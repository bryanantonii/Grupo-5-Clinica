import 'dotenv/config';
import { strict as assert } from 'node:assert';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { AppModule } from '../app.module';
import { RespostaInterceptor } from '../common/interceptors/resposta.interceptor';
import { popularClinica } from '../seed/popular-clinica';
import { completarEspecialidades } from '../seed/completar-especialidades';
import { inserirAdministrador } from '../usuarios/seed-administrador';
import { EmailService } from '../recuperacao/email.service';
import type { PortalService } from './portal.service';

type Sessao = { accessToken: string; usuario: { _id: string; perfil: string } };
type ConsultaPortal = Awaited<ReturnType<PortalService['buscar']>>;
type Opcao = { _id: string; especialidade: string };
let etapa = 'Iniciar banco temporário';
async function verificar() {
  const banco = 'clinora_test_portal_' + randomBytes(8).toString('hex');
  const conexao = await mongoose
    .createConnection(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
      dbName: banco,
      serverSelectionTimeoutMS: 15000,
    })
    .asPromise();
  let proprio = false;
  let app: INestApplication | undefined;
  const casos: string[] = [];
  const envios: { email: string; link: string }[] = [];
  let emailConfigurado = false;
  try {
    assert.equal(conexao.name, banco);
    assert.equal((await conexao.db!.listCollections().toArray()).length, 0);
    proprio = true;
    process.env.JWT_SECRET = randomBytes(48).toString('base64url');
    await popularClinica(conexao);
    await completarEspecialidades(conexao);
    const senha = randomBytes(18).toString('base64url');
    const novaSenha = randomBytes(18).toString('base64url');
    await inserirAdministrador(conexao, {
      SEED_ADMIN_NOME: 'Admin de teste',
      SEED_ADMIN_EMAIL: 'admin@portal.example',
      SEED_ADMIN_SENHA: senha,
    });
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getConnectionToken())
      .useValue(conexao)
      // Somente o transporte de e-mail é substituído neste teste. HTTP, JWT, bcrypt e MongoDB são reais.
      .overrideProvider(EmailService)
      .useValue({
        configurado: () => emailConfigurado,
        enviarRecuperacao: (email: string, link: string) => {
          envios.push({ email, link });
          return Promise.resolve();
        },
      })
      .compile();
    app = modulo.createNestApplication({ logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new RespostaInterceptor());
    await app.listen(0, '127.0.0.1');
    await Promise.all(Object.values(conexao.models).map((m) => m.init()));
    const base = (await app.getUrl()) + '/api/v1';
    async function chamar<T = Record<string, unknown>>(
      descricao: string,
      method: string,
      rota: string,
      status: number,
      body?: unknown,
      token?: string,
    ): Promise<T> {
      etapa = descricao;
      const r = await fetch(base + rota, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      assert.equal(r.status, status, descricao);
      casos.push(descricao);
      if (status === 204) return undefined as T;
      const resposta = (await r.json()) as { dados: T };
      return resposta.dados;
    }
    const admin = (
      await chamar<Sessao>(
        'Login real da administração',
        'POST',
        '/auth/login',
        200,
        { email: 'admin@portal.example', senha },
      )
    ).accessToken;
    const a = await chamar<Sessao>(
      'Cadastro público cria usuário no MongoDB',
      'POST',
      '/auth/cadastro-paciente',
      201,
      { nome: 'Ana Portal', email: 'ana@portal.example', senha },
    );
    const b = await chamar<Sessao>(
      'Segunda conta recebe identidade própria',
      'POST',
      '/auth/cadastro-paciente',
      201,
      { nome: 'Bia Portal', email: 'bia@portal.example', senha },
    );
    const guardado = await conexao
      .collection('usuarios')
      .findOne({ _id: new Types.ObjectId(a.usuario._id) });
    assert.ok(guardado);
    assert.equal(guardado['perfil'], 'paciente');
    assert.notEqual(guardado['senhaHash'], senha);
    await chamar(
      'Cadastro não aceita perfil administrativo',
      'POST',
      '/auth/cadastro-paciente',
      400,
      {
        nome: 'Invasão',
        email: 'invasao@portal.example',
        senha,
        perfil: 'admin',
      },
    );
    await chamar(
      'E-mail duplicado é rejeitado',
      'POST',
      '/auth/cadastro-paciente',
      409,
      { nome: 'Ana Portal', email: 'ANA@PORTAL.EXAMPLE', senha },
    );
    await chamar('Portal exige JWT', 'GET', '/conta/consultas', 401);
    await chamar(
      'Equipe não utiliza a área privada de um paciente',
      'GET',
      '/conta/consultas',
      403,
      undefined,
      admin,
    );
    const vazio = await chamar<ConsultaPortal[]>(
      'Conta nova não recebe consultas locais ou de terceiros',
      'GET',
      '/conta/consultas',
      200,
      undefined,
      a.accessToken,
    );
    assert.deepEqual(vazio, []);
    await chamar(
      'Paciente não acessa os cadastros da gestão',
      'GET',
      '/pacientes',
      403,
      undefined,
      a.accessToken,
    );
    const equipe = await chamar<Opcao[]>(
      'Catálogo público utiliza profissionais do MongoDB',
      'GET',
      '/catalogo/profissionais',
      200,
    );
    const convenios = await chamar<{ _id: string }[]>(
      'Catálogo público utiliza convênios ativos do banco',
      'GET',
      '/catalogo/convenios',
      200,
    );
    const prof = equipe[0];
    assert.ok(prof);
    assert.ok(convenios.length);
    const dia = new Date();
    dia.setDate(dia.getDate() + 3);
    while ([0, 6].includes(dia.getDay())) dia.setDate(dia.getDate() + 1);
    const data = dia.toISOString().slice(0, 10);
    const slots = await chamar<{ horarios: string[] }>(
      'Disponibilidade é lida sem expor dados de pacientes',
      'GET',
      '/catalogo/horarios?profissional=' + prof._id + '&data=' + data,
      200,
    );
    assert.ok(slots.horarios.length);
    assert.equal('paciente' in slots, false);
    const entrada = {
      profissional: prof._id,
      especialidade: prof.especialidade,
      dataHora: data + 'T' + slots.horarios[0] + ':00-03:00',
      dataNascimento: '2000-05-21',
      telefone: '(51) 99999-2345',
      convenio: convenios[0]._id,
      ciente: true,
    };
    await chamar(
      'Agendamento não aceita escolher o ID de outro paciente',
      'POST',
      '/conta/consultas',
      400,
      { ...entrada, paciente: b.usuario._id },
      a.accessToken,
    );
    await chamar(
      'Agendamento exige confirmação dos dados',
      'POST',
      '/conta/consultas',
      400,
      { ...entrada, ciente: false },
      a.accessToken,
    );
    await chamar(
      'Nascimento futuro é recusado',
      'POST',
      '/conta/consultas',
      400,
      { ...entrada, dataNascimento: '2099-01-01' },
      a.accessToken,
    );
    await chamar(
      'Convênio inexistente é recusado',
      'POST',
      '/conta/consultas',
      400,
      { ...entrada, convenio: new Types.ObjectId().toHexString() },
      a.accessToken,
    );
    const criada = await chamar<ConsultaPortal>(
      'Agendamento cria consulta real com status marcada',
      'POST',
      '/conta/consultas',
      201,
      entrada,
      a.accessToken,
    );
    assert.equal(criada.status, 'marcada');
    const paciente = await conexao
      .collection('pacientes')
      .findOne({ usuario: new Types.ObjectId(a.usuario._id) });
    assert.ok(paciente);
    assert.equal(String(paciente['convenio']), convenios[0]._id);
    assert.equal(
      await conexao.collection('consultas').countDocuments({
        _id: new Types.ObjectId(criada._id),
        paciente: paciente._id,
      }),
      1,
    );
    const recarregada = await chamar<ConsultaPortal>(
      'GET após cadastro preserva o ID e os dados do agendamento',
      'GET',
      '/conta/consultas/' + criada._id,
      200,
      undefined,
      a.accessToken,
    );
    assert.equal(recarregada._id, criada._id);
    assert.equal(recarregada.profissionalNome.length > 0, true);
    const lista = await chamar<ConsultaPortal[]>(
      'Consulta aparece na área privada após nova requisição',
      'GET',
      '/conta/consultas',
      200,
      undefined,
      a.accessToken,
    );
    assert.equal(lista.length, 1);
    const gestao = await chamar<{ _id: string }[]>(
      'Mesma consulta aparece na API usada pela gestão',
      'GET',
      '/consultas',
      200,
      undefined,
      admin,
    );
    assert.ok(gestao.some((c) => c._id === criada._id));
    const ocupado = await chamar<{ horarios: string[] }>(
      'Horário ocupado sai da disponibilidade pública',
      'GET',
      '/catalogo/horarios?profissional=' + prof._id + '&data=' + data,
      200,
    );
    assert.equal(ocupado.horarios.includes(slots.horarios[0]), false);
    await chamar(
      'Outro paciente recebe conflito ao disputar horário ocupado',
      'POST',
      '/conta/consultas',
      409,
      entrada,
      b.accessToken,
    );
    await chamar(
      'Outro paciente não lê uma consulta por adivinhar o ID',
      'GET',
      '/conta/consultas/' + criada._id,
      404,
      undefined,
      b.accessToken,
    );
    await chamar(
      'Outro paciente não cancela uma consulta por adivinhar o ID',
      'PATCH',
      '/conta/consultas/' + criada._id + '/cancelar',
      404,
      {},
      b.accessToken,
    );
    await chamar(
      'Gestão atualiza o status no mesmo registro',
      'PATCH',
      '/consultas/' + criada._id + '/status',
      200,
      { status: 'confirmada' },
      admin,
    );
    assert.equal(
      (
        await chamar<ConsultaPortal>(
          'Paciente vê o status atualizado pela equipe',
          'GET',
          '/conta/consultas/' + criada._id,
          200,
          undefined,
          a.accessToken,
        )
      ).status,
      'confirmada',
    );
    assert.equal(
      (
        await chamar<ConsultaPortal>(
          'Cancelamento próprio mantém a consulta no histórico',
          'PATCH',
          '/conta/consultas/' + criada._id + '/cancelar',
          200,
          {},
          a.accessToken,
        )
      ).status,
      'cancelada',
    );
    await chamar(
      'Cancelamento repetido não altera novamente o fluxo',
      'PATCH',
      '/conta/consultas/' + criada._id + '/cancelar',
      400,
      {},
      a.accessToken,
    );
    const livre = await chamar<{ horarios: string[] }>(
      'Cancelamento libera o horário na agenda pública',
      'GET',
      '/catalogo/horarios?profissional=' + prof._id + '&data=' + data,
      200,
    );
    assert.ok(livre.horarios.includes(slots.horarios[0]));
    const particular = await chamar<ConsultaPortal>(
      'Novo agendamento reutiliza o horário liberado',
      'POST',
      '/conta/consultas',
      201,
      { ...entrada, convenio: null },
      a.accessToken,
    );
    assert.equal(particular.convenioId, null);
    const historica = await chamar<ConsultaPortal>(
      'Convênio da consulta anterior é preservado ao trocar o atendimento',
      'GET',
      '/conta/consultas/' + criada._id,
      200,
      undefined,
      a.accessToken,
    );
    assert.equal(historica.convenioId, convenios[0]._id);
    assert.equal(
      await conexao
        .collection('pacientes')
        .countDocuments({ usuario: new Types.ObjectId(a.usuario._id) }),
      1,
    );
    await chamar(
      'Meus dados atualiza a conta real',
      'PATCH',
      '/conta',
      200,
      {
        nome: 'Ana Atualizada',
        email: 'ana.nova@portal.example',
        telefone: '(51) 98888-7777',
      },
      a.accessToken,
    );
    const atualizado = await conexao
      .collection('pacientes')
      .findOne({ usuario: new Types.ObjectId(a.usuario._id) });
    assert.equal(atualizado?.['email'], 'ana.nova@portal.example');
    assert.equal(atualizado?.['nome'], 'Ana Atualizada');
    const contato = {
      nome: 'Contato Portal',
      email: 'contato@portal.example',
      assunto: 'Agendamento',
      mensagem: 'Gostaria de informações sobre o atendimento.',
    };
    const mensagem = await chamar<{ _id: string }>(
      'Contato público persiste a mensagem no MongoDB',
      'POST',
      '/contatos',
      201,
      contato,
    );
    assert.equal(
      await conexao.collection('contatos').countDocuments({
        _id: new Types.ObjectId(mensagem._id),
        situacao: 'nova',
      }),
      1,
    );
    await chamar('Contato inválido não é aceito', 'POST', '/contatos', 400, {
      ...contato,
      mensagem: 'curta',
    });
    await chamar(
      'Mensagens recebidas exigem autenticação',
      'GET',
      '/contatos',
      401,
    );
    await chamar(
      'Paciente não lê mensagens de outras pessoas',
      'GET',
      '/contatos',
      403,
      undefined,
      b.accessToken,
    );
    await chamar(
      'Administração lê as mensagens recebidas',
      'GET',
      '/contatos',
      200,
      undefined,
      admin,
    );
    await chamar(
      'Equipe registra a leitura de uma mensagem',
      'PATCH',
      '/contatos/' + mensagem._id + '/leitura',
      200,
      { lida: true },
      admin,
    );
    assert.equal(
      (
        await conexao
          .collection('contatos')
          .findOne({ _id: new Types.ObjectId(mensagem._id) })
      )?.['situacao'],
      'lida',
    );
    await chamar(
      'Paciente não lista usuários',
      'GET',
      '/usuarios',
      403,
      undefined,
      b.accessToken,
    );
    await chamar(
      'Administração lista contas sem dados secretos',
      'GET',
      '/usuarios',
      200,
      undefined,
      admin,
    );
    const atendente = await chamar<{ _id: string }>(
      'Cadastro administrativo salva atendente real',
      'POST',
      '/usuarios',
      201,
      { nome: 'Atendente Portal', email: 'atendente@portal.example', senha },
      admin,
    );
    assert.ok(atendente._id);
    const atendenteToken = (
      await chamar<Sessao>(
        'Atendente cadastrado consegue entrar',
        'POST',
        '/auth/login',
        200,
        { email: 'atendente@portal.example', senha },
      )
    ).accessToken;
    await chamar(
      'Atendente pode ler mensagens',
      'GET',
      '/contatos',
      200,
      undefined,
      atendenteToken,
    );
    await chamar(
      'Atendente não lista contas administrativas',
      'GET',
      '/usuarios',
      403,
      undefined,
      atendenteToken,
    );
    await chamar(
      'Recuperação sem SMTP informa indisponibilidade',
      'POST',
      '/auth/recuperar-acesso',
      503,
      { email: 'ana.nova@portal.example' },
    );
    await chamar(
      'Falha de configuração SMTP não revela e-mails cadastrados',
      'POST',
      '/auth/recuperar-acesso',
      503,
      { email: 'ausente@portal.example' },
    );
    emailConfigurado = true;
    const respostaReset = await chamar<{ mensagem: string }>(
      'Recuperação prepara link com token de uso único',
      'POST',
      '/auth/recuperar-acesso',
      200,
      { email: 'ana.nova@portal.example' },
    );
    const respostaAusente = await chamar<{ mensagem: string }>(
      'Recuperação responde de forma genérica para e-mail ausente',
      'POST',
      '/auth/recuperar-acesso',
      200,
      { email: 'ausente@portal.example' },
    );
    assert.equal(respostaReset.mensagem, respostaAusente.mensagem);
    assert.equal(envios.length, 1);
    const token = new URL(envios[0].link).searchParams.get('token')!;
    const segredo = await conexao
      .collection('recuperacoes')
      .findOne({ usuario: new Types.ObjectId(a.usuario._id) });
    assert.ok(segredo);
    assert.notEqual(segredo['tokenHash'], token);
    assert.equal(token.length, 64);
    await chamar(
      'Token de recuperação inválido é recusado',
      'POST',
      '/auth/redefinir-senha',
      400,
      { token: 'a'.repeat(64), senha: novaSenha },
    );
    await chamar(
      'Redefinição válida atualiza a senha real',
      'POST',
      '/auth/redefinir-senha',
      200,
      { token, senha: novaSenha },
    );
    await chamar(
      'Link não pode ser utilizado duas vezes',
      'POST',
      '/auth/redefinir-senha',
      400,
      { token, senha: novaSenha },
    );
    await chamar(
      'Senha anterior deixa de autenticar',
      'POST',
      '/auth/login-paciente',
      401,
      { email: 'ana.nova@portal.example', senha },
    );
    const novaSessao = await chamar<Sessao>(
      'Nova senha autentica a conta',
      'POST',
      '/auth/login-paciente',
      200,
      { email: 'ana.nova@portal.example', senha: novaSenha },
    );
    await chamar(
      'Sessão anterior é revogada após redefinir a senha',
      'GET',
      '/conta',
      401,
      undefined,
      a.accessToken,
    );
    await chamar(
      'Sessão emitida após redefinição continua válida',
      'GET',
      '/conta',
      200,
      undefined,
      novaSessao.accessToken,
    );
    await chamar(
      'Novo link pode ser solicitado após o uso anterior',
      'POST',
      '/auth/recuperar-acesso',
      200,
      { email: 'ana.nova@portal.example' },
    );
    const tokenExpirado = new URL(envios[1].link).searchParams.get('token')!;
    await conexao
      .collection('recuperacoes')
      .updateOne(
        { usuario: new Types.ObjectId(a.usuario._id) },
        { $set: { expiraEm: new Date(Date.now() - 1000) } },
      );
    await chamar(
      'Link expirado não altera a senha',
      'POST',
      '/auth/redefinir-senha',
      400,
      { token: tokenExpirado, senha },
    );
    const antigo = await chamar<{ _id: string }>(
      'Gestão cria um cadastro clínico anterior ao portal',
      'POST',
      '/pacientes',
      201,
      {
        nome: 'Paciente Anterior',
        email: 'anterior@portal.example',
        telefone: '(51) 99999-6666',
        dataNascimento: '1990-01-01',
        convenio: null,
      },
      admin,
    );
    const contaAntiga = await chamar<Sessao>(
      'Conta nova com e-mail de cadastro antigo não recebe vínculo automático',
      'POST',
      '/auth/cadastro-paciente',
      201,
      { nome: 'Paciente Anterior', email: 'anterior@portal.example', senha },
    );
    assert.deepEqual(
      await chamar<ConsultaPortal[]>(
        'Mesmo e-mail não concede acesso ao histórico clínico',
        'GET',
        '/conta/consultas',
        200,
        undefined,
        contaAntiga.accessToken,
      ),
      [],
    );
    await chamar(
      'Atendente não pode vincular identidades',
      'PATCH',
      '/usuarios/' + contaAntiga.usuario._id + '/paciente',
      403,
      { paciente: antigo._id },
      atendenteToken,
    );
    await chamar(
      'Administração pode vincular o cadastro conferido',
      'PATCH',
      '/usuarios/' + contaAntiga.usuario._id + '/paciente',
      200,
      { paciente: antigo._id },
      admin,
    );
    assert.equal(
      String(
        (
          await conexao
            .collection('pacientes')
            .findOne({ _id: new Types.ObjectId(antigo._id) })
        )?.['usuario'],
      ),
      contaAntiga.usuario._id,
    );
    etapa = 'Concorrência na reserva de horário';
    const segundaData = new Date(dia);
    segundaData.setDate(segundaData.getDate() + 7);
    const disputa = {
      ...entrada,
      dataHora: segundaData.toISOString().slice(0, 10) + 'T08:00:00-03:00',
    };
    const resultados = await Promise.all(
      [novaSessao.accessToken, b.accessToken].map((accessToken) =>
        fetch(base + '/conta/consultas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
          body: JSON.stringify(disputa),
        }),
      ),
    );
    assert.deepEqual(resultados.map((r) => r.status).sort(), [201, 409]);
    casos.push(
      'Índice único permite uma reserva e recusa a concorrente com 409',
    );
    const preservada = await chamar<ConsultaPortal>(
      'Consulta particular não recebe o convênio de um agendamento posterior',
      'GET',
      '/conta/consultas/' + particular._id,
      200,
      undefined,
      novaSessao.accessToken,
    );
    assert.equal(preservada.convenioId, null);
    assert.equal(preservada.convenio, 'Particular');
    const outroProf = equipe.find(
      (p) => p.especialidade !== prof.especialidade,
    )!;
    assert.ok(outroProf);
    await chamar(
      'Gestão rejeita especialidade diferente do profissional',
      'PATCH',
      '/consultas/' + particular._id,
      400,
      { especialidade: outroProf.especialidade },
      admin,
    );
    await chamar(
      'Gestão rejeita convênio inexistente',
      'PATCH',
      '/consultas/' + particular._id,
      400,
      { convenio: new Types.ObjectId().toHexString() },
      admin,
    );
    await chamar(
      'Gestão pode trocar o profissional de uma consulta aberta',
      'PATCH',
      '/consultas/' + particular._id,
      200,
      { profissional: outroProf._id },
      admin,
    );
    const transferida = await chamar<ConsultaPortal>(
      'Portal recebe a especialidade correta após alteração pela equipe',
      'GET',
      '/conta/consultas/' + particular._id,
      200,
      undefined,
      novaSessao.accessToken,
    );
    assert.equal(transferida.profissional, outroProf._id);
    assert.equal(transferida.especialidade, outroProf.especialidade);
    const pasta = resolve('../docs/integracao-real/evidencias');
    mkdirSync(pasta, { recursive: true });
    writeFileSync(
      resolve(pasta, 'portal-http.json'),
      JSON.stringify(
        {
          data: new Date().toISOString(),
          banco: 'temporário e isolado',
          total: casos.length,
          transporteEmail:
            'Substituído exclusivamente neste teste para conferir o link sem enviar mensagens externas.',
          casos,
        },
        null,
        2,
      ) + '\n',
    );
    console.log(
      'Portal: ' +
        casos.length +
        ' verificações HTTP/MongoDB passaram. Evidência sem senhas ou tokens registrada.',
    );
  } finally {
    if (proprio && Number(conexao.readyState) === 1) {
      assert.equal(conexao.name, banco);
      assert.ok(banco.startsWith('clinora_test_portal_'));
      await conexao.dropDatabase();
    }
    if (app) await app.close();
    await conexao.close();
  }
}
void verificar().catch((erro: unknown) => {
  console.error(
    'Falha na verificação: ' +
      etapa +
      ' (' +
      (erro instanceof Error ? erro.name : 'erro') +
      ').',
  );
  process.exitCode = 1;
});
