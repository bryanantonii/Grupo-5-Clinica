import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { RespostaInterceptor } from '../common/interceptors/resposta.interceptor';
import { popularClinica } from '../seed/popular-clinica';
import { completarEspecialidades } from '../seed/completar-especialidades';
import { inserirAdministrador } from '../usuarios/seed-administrador';

let etapa = 'Conectar ao banco temporário';
async function verificar() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET)
    throw new Error('Configure o .env local.');
  const bancoTeste = `clinora_test_aula13_${randomBytes(8).toString('hex')}`;
  const conexao = await mongoose
    .createConnection(process.env.MONGODB_URI, {
      dbName: bancoTeste,
      serverSelectionTimeoutMS: 15000,
    })
    .asPromise();
  let proprio = false;
  let app: INestApplication | undefined;
  const casos: string[] = [];
  try {
    assert.equal(conexao.name, bancoTeste);
    assert.equal((await conexao.db!.listCollections().toArray()).length, 0);
    proprio = true;
    await popularClinica(conexao);
    await completarEspecialidades(conexao);
    const senha = randomBytes(18).toString('base64url');
    await inserirAdministrador(conexao, {
      SEED_ADMIN_NOME: 'Admin de teste',
      SEED_ADMIN_EMAIL: 'admin@aula13.example',
      SEED_ADMIN_SENHA: senha,
    });
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(getConnectionToken())
      .useValue(conexao)
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
    await Promise.all(
      Object.values(conexao.models).map((model) => model.init()),
    );
    const base = await app.getUrl();
    async function chamar(
      metodo: string,
      rota: string,
      corpo?: unknown,
      token?: string,
    ) {
      const resposta = await fetch(base + '/api/v1' + rota, {
        method: metodo,
        headers: {
          ...(corpo ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
      return {
        status: resposta.status,
        corpo:
          resposta.status === 204
            ? null
            : ((await resposta.json()) as { dados: unknown }),
      };
    }
    async function conferir(
      descricao: string,
      metodo: string,
      rota: string,
      status: number,
      corpo?: unknown,
      token?: string,
    ) {
      etapa = descricao;
      const resultado = await chamar(metodo, rota, corpo, token);
      assert.equal(resultado.status, status, descricao);
      casos.push(descricao);
      return resultado.corpo?.dados as Record<string, unknown>;
    }
    for (const recurso of [
      'pacientes',
      'profissionais',
      'consultas',
      'especialidades',
      'convenios',
      'relatorios/resumo',
    ])
      await conferir(
        `Sem JWT: ${recurso} retorna 401`,
        'GET',
        '/' + recurso,
        401,
      );
    const catalogo = (await conferir(
      'Catálogo público disponível sem login',
      'GET',
      '/catalogo/profissionais',
      200,
    )) as unknown as Record<string, unknown>[];
    assert.ok(
      catalogo.length > 0 &&
        catalogo.every((item) => !('email' in item) && !('telefone' in item)),
    );
    const login = await conferir(
      'Administrador faz login real',
      'POST',
      '/auth/login',
      200,
      { email: 'admin@aula13.example', senha },
    );
    const admin = String(login.accessToken);
    const senhaAtendente = randomBytes(18).toString('base64url');
    await conferir(
      'Administrador cadastra atendente',
      'POST',
      '/usuarios',
      201,
      {
        nome: 'Atendente de teste',
        email: 'atendente@aula13.example',
        senha: senhaAtendente,
      },
      admin,
    );
    const acesso = await conferir(
      'Atendente faz login real',
      'POST',
      '/auth/login',
      200,
      { email: 'atendente@aula13.example', senha: senhaAtendente },
    );
    const atendente = String(acesso.accessToken);
    await conferir(
      'Atendente não cria contas de usuário',
      'POST',
      '/usuarios',
      403,
      {
        nome: 'Outra pessoa',
        email: 'outra@example.com',
        senha: senhaAtendente,
      },
      atendente,
    );
    await conferir(
      'Atendente não escolhe perfil admin',
      'POST',
      '/usuarios',
      400,
      {
        nome: 'Outra pessoa',
        email: 'outra@example.com',
        senha: senhaAtendente,
        perfil: 'admin',
      },
      admin,
    );
    for (const rota of [
      'resumo',
      'consultas-por-status',
      'consultas-por-especialidade',
    ])
      await conferir(
        `Relatório ${rota}: atendente recebe 403`,
        'GET',
        '/relatorios/' + rota,
        403,
        undefined,
        atendente,
      );

    const especialidade = await conferir(
      'Atendente cadastra especialidade no MongoDB',
      'POST',
      '/especialidades',
      201,
      {
        nome: 'Especialidade aula 13',
        descricao: 'Registro fictício',
        duracaoConsultaMin: 30,
        valorParticular: 175,
      },
      atendente,
    );
    const esp = String(especialidade._id);
    await conferir(
      'Nome de especialidade não se duplica por caixa',
      'POST',
      '/especialidades',
      409,
      {
        nome: 'ESPECIALIDADE AULA 13',
        duracaoConsultaMin: 30,
        valorParticular: 175,
      },
      atendente,
    );
    await conferir(
      'Especialidade recusa duração inválida',
      'POST',
      '/especialidades',
      400,
      {
        nome: 'Duração inválida',
        duracaoConsultaMin: 14,
        valorParticular: 175,
      },
      atendente,
    );
    await conferir(
      'Atendente edita especialidade',
      'PATCH',
      '/especialidades/' + esp,
      200,
      { descricao: 'Descrição alterada' },
      atendente,
    );
    const profissional = await conferir(
      'Atendente cadastra profissional com referência real',
      'POST',
      '/profissionais',
      201,
      {
        nome: 'Dra. Ana de Teste',
        registro: 'TEST-AULA13',
        especialidade: esp,
        email: 'dra.aula13@example.com',
        telefone: '(51) 99999-1234',
      },
      atendente,
    );
    const prof = String(profissional._id);
    const tipoReferencia = await conexao
      .collection('profissionais')
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(prof) } },
        { $project: { _id: 0, tipo: { $type: '$especialidade' } } },
      ])
      .toArray();
    assert.equal(tipoReferencia[0]?.tipo, 'objectId');
    casos.push('Profissional grava a especialidade como ObjectId e não Mixed');
    await conferir(
      'PATCH não permite ao atendente inativar profissional',
      'PATCH',
      '/profissionais/' + prof,
      403,
      { ativo: false },
      atendente,
    );
    await conferir(
      'Atendente edita profissional',
      'PATCH',
      '/profissionais/' + prof,
      200,
      { nome: 'Dra. Ana Atualizada' },
      atendente,
    );
    const convenio = await conferir(
      'Atendente cadastra convênio no MongoDB',
      'POST',
      '/convenios',
      201,
      {
        nome: 'Convênio aula 13',
        codigoAns: '000013',
        percentualCobertura: 80,
        modalidade: 'coletivo',
        telefone: '(51) 99999-1234',
      },
      atendente,
    );
    const conv = String(convenio._id);
    await conferir(
      'Código ANS é único',
      'POST',
      '/convenios',
      409,
      { nome: 'Outro convênio', codigoAns: '000013', percentualCobertura: 50 },
      atendente,
    );
    await conferir(
      'Cobertura fora do limite retorna 400',
      'POST',
      '/convenios',
      400,
      {
        nome: 'Convênio inválido',
        codigoAns: '000014',
        percentualCobertura: 101,
      },
      atendente,
    );
    await conferir(
      'Atendente edita convênio',
      'PATCH',
      '/convenios/' + conv,
      200,
      { percentualCobertura: 85 },
      atendente,
    );
    const dadosPaciente = {
      nome: 'Paciente aula 13',
      email: 'paciente.aula13@example.com',
      telefone: '(51) 99999-1234',
      dataNascimento: '1990-05-21',
      convenio: conv,
    };
    const paciente = await conferir(
      'Atendente cadastra paciente com convênio real',
      'POST',
      '/pacientes',
      201,
      dadosPaciente,
      atendente,
    );
    const pac = String(paciente._id);
    await conferir(
      'E-mail de paciente é normalizado e único',
      'POST',
      '/pacientes',
      409,
      { ...dadosPaciente, email: ' PACIENTE.AULA13@EXAMPLE.COM ' },
      atendente,
    );
    await conferir(
      'Nascimento futuro é recusado',
      'POST',
      '/pacientes',
      400,
      {
        ...dadosPaciente,
        email: 'futuro@example.com',
        dataNascimento: '2999-01-01',
      },
      atendente,
    );
    await conferir(
      'Convênio inexistente é recusado',
      'POST',
      '/pacientes',
      400,
      {
        ...dadosPaciente,
        email: 'semconvenio@example.com',
        convenio: '000000000000000000000013',
      },
      atendente,
    );
    await conferir(
      'Atendente edita paciente e remove convênio opcional',
      'PATCH',
      '/pacientes/' + pac,
      200,
      { nome: 'Paciente atualizado', convenio: null },
      atendente,
    );
    for (const [recurso, id] of [
      ['pacientes', pac],
      ['especialidades', esp],
      ['convenios', conv],
    ])
      await conferir(
        `PATCH de ${recurso} rejeita inativação fora da rota restrita`,
        'PATCH',
        `/${recurso}/${id}`,
        400,
        { ativo: false },
        atendente,
      );
    const data = new Date(Date.now() + 3 * 86400000);
    data.setUTCHours(13, 0, 0, 0);
    while ([0, 6].includes(data.getUTCDay()))
      data.setUTCDate(data.getUTCDate() + 1);
    const horario = (hora: number) => {
      const d = new Date(data);
      d.setUTCHours(hora);
      return d.toISOString();
    };
    const dadosConsulta = {
      paciente: pac,
      profissional: prof,
      dataHora: horario(13),
      motivo: 'Consulta fictícia de teste',
    };
    const consulta = await conferir(
      'Atendente marca consulta com IDs reais',
      'POST',
      '/consultas',
      201,
      dadosConsulta,
      atendente,
    );
    const consultaId = String(consulta._id);
    assert.equal(consulta.status, 'marcada');
    await conferir(
      'Horário ocupado retorna 409',
      'POST',
      '/consultas',
      409,
      dadosConsulta,
      atendente,
    );
    await conferir(
      'Expediente é conferido no fuso de Brasília',
      'POST',
      '/consultas',
      400,
      { ...dadosConsulta, dataHora: horario(2) },
      atendente,
    );
    await conferir(
      'Data sem fuso explícito é recusada',
      'POST',
      '/consultas',
      400,
      { ...dadosConsulta, dataHora: horario(13).slice(0, 19) },
      atendente,
    );
    await conferir(
      'Status não pode ser injetado no cadastro',
      'POST',
      '/consultas',
      400,
      { ...dadosConsulta, status: 'realizada' },
      atendente,
    );
    await conferir(
      'Atendente edita o motivo da consulta',
      'PATCH',
      '/consultas/' + consultaId,
      200,
      { motivo: 'Retorno atualizado' },
      atendente,
    );
    await conferir(
      'Fluxo não permite pular confirmação',
      'PATCH',
      '/consultas/' + consultaId + '/status',
      400,
      { status: 'realizada' },
      atendente,
    );
    await conferir(
      'Atendente confirma consulta',
      'PATCH',
      '/consultas/' + consultaId + '/status',
      200,
      { status: 'confirmada' },
      atendente,
    );
    await conferir(
      'Atendente registra realização',
      'PATCH',
      '/consultas/' + consultaId + '/status',
      200,
      { status: 'realizada' },
      atendente,
    );
    await conferir(
      'Consulta encerrada não aceita edição',
      'PATCH',
      '/consultas/' + consultaId,
      400,
      { motivo: 'Tentativa de editar' },
      atendente,
    );
    await conferir(
      'Consulta realizada não pode voltar para marcada',
      'PATCH',
      '/consultas/' + consultaId + '/status',
      400,
      { status: 'marcada' },
      atendente,
    );
    etapa = 'Concorrência no horário único';
    const concorrentes = await Promise.all([
      chamar(
        'POST',
        '/consultas',
        { ...dadosConsulta, dataHora: horario(14) },
        atendente,
      ),
      chamar(
        'POST',
        '/consultas',
        { ...dadosConsulta, dataHora: horario(14) },
        atendente,
      ),
    ]);
    assert.deepEqual(concorrentes.map((r) => r.status).sort(), [201, 409]);
    casos.push(
      'Índice único impede duas marcações concorrentes no mesmo horário',
    );
    const cancelavel = await conferir(
      'Outra consulta é marcada',
      'POST',
      '/consultas',
      201,
      { ...dadosConsulta, dataHora: horario(15) },
      atendente,
    );
    await conferir(
      'Cancelamento é uma transição e preserva o histórico',
      'PATCH',
      '/consultas/' + String(cancelavel._id) + '/status',
      200,
      { status: 'cancelada' },
      atendente,
    );
    const reutilizada = await conferir(
      'Cancelamento libera horário no índice',
      'POST',
      '/consultas',
      201,
      { ...dadosConsulta, dataHora: horario(15) },
      atendente,
    );
    const agrupadas = await conferir(
      'Admin consulta realizadas por especialidade',
      'GET',
      '/relatorios/consultas-por-especialidade',
      200,
      undefined,
      admin,
    );
    assert.deepEqual(agrupadas, [
      { especialidade: 'Especialidade aula 13', quantidade: 1 },
    ]);
    const resumo = await conferir(
      'Admin consulta resumo calculado no banco',
      'GET',
      '/relatorios/resumo',
      200,
      undefined,
      admin,
    );
    assert.equal(resumo.pacientes, 1);
    assert.equal(resumo.consultasMarcadas, 2);
    assert.equal(resumo.faltas, 0);
    await conexao
      .collection('profissionais')
      .updateOne(
        { _id: new mongoose.Types.ObjectId(prof) },
        { $set: { especialidade: esp } },
      );
    const legado = await conferir(
      'Relatórios também leem referências antigas gravadas como texto',
      'GET',
      '/relatorios/consultas-por-especialidade',
      200,
      undefined,
      admin,
    );
    assert.deepEqual(legado, [
      { especialidade: 'Especialidade aula 13', quantidade: 1 },
    ]);
    await conferir(
      'Admin consulta distribuição por status',
      'GET',
      '/relatorios/consultas-por-status',
      200,
      undefined,
      admin,
    );
    await conferir(
      'Query com boolean inválido retorna 400',
      'GET',
      '/pacientes?todos=talvez',
      400,
      undefined,
      atendente,
    );
    await conferir(
      'ID malformado retorna 400',
      'GET',
      '/convenios/id-invalido',
      400,
      undefined,
      atendente,
    );
    for (const [recurso, id] of [
      ['pacientes', pac],
      ['profissionais', prof],
      ['especialidades', esp],
      ['convenios', conv],
      ['consultas', String(reutilizada._id)],
    ]) {
      await conferir(
        `Atendente não usa DELETE em ${recurso}`,
        'DELETE',
        `/${recurso}/${id}`,
        403,
        undefined,
        atendente,
      );
      await conferir(
        `Administrador usa DELETE em ${recurso}`,
        'DELETE',
        `/${recurso}/${id}`,
        204,
        undefined,
        admin,
      );
      const salvo = await conexao
        .collection(recurso)
        .findOne({ _id: new mongoose.Types.ObjectId(id) });
      assert.ok(salvo);
      assert.equal(
        recurso === 'consultas' ? salvo.status : salvo.ativo,
        recurso === 'consultas' ? 'cancelada' : false,
      );
      casos.push(`${recurso}: documento preservado após a operação`);
      if (recurso !== 'consultas') {
        const ativos = (await conferir(
          `${recurso}: listagem padrão omite inativado`,
          'GET',
          '/' + recurso,
          200,
          undefined,
          admin,
        )) as unknown as Record<string, unknown>[];
        assert.ok(!ativos.some((item) => String(item._id) === id));
        const todos = (await conferir(
          `${recurso}: mostrar inativos mantém o histórico`,
          'GET',
          '/' + recurso + '?todos=true',
          200,
          undefined,
          admin,
        )) as unknown as Record<string, unknown>[];
        assert.ok(todos.some((item) => String(item._id) === id));
      }
    }
    await conferir(
      'Paciente inativo não recebe nova consulta',
      'POST',
      '/consultas',
      400,
      { ...dadosConsulta, dataHora: horario(16) },
      atendente,
    );
    assert.equal(
      (await conexao.db!.listCollections({ name: 'produtos' }).toArray())
        .length,
      0,
    );
    casos.push('Nenhuma coleção de Produtos foi criada');
  } finally {
    if (proprio) {
      assert.ok(
        bancoTeste.startsWith('clinora_test_aula13_') &&
          conexao.name === bancoTeste,
      );
      await conexao.dropDatabase();
    }
    await app?.close();
    await conexao.close();
  }
  const resultado = {
    data: '2026-11-06',
    bancoTeste,
    total: casos.length,
    casos,
    limpeza:
      'concluída; somente o banco temporário criado pelo verificador foi removido',
  };
  if (process.argv.includes('--registrar')) {
    const pasta = resolve('../docs/aula-13/evidencias');
    mkdirSync(pasta, { recursive: true });
    writeFileSync(
      resolve(pasta, 'integracao.json'),
      JSON.stringify(resultado, null, 2) + '\n',
    );
  }
  console.log(JSON.stringify(resultado, null, 2));
}
verificar().catch((erro: unknown) => {
  console.error(
    `Falha na etapa ${etapa}: ${erro instanceof assert.AssertionError ? erro.message : erro instanceof Error ? erro.name : 'erro'}. Nenhum token ou credencial foi exibido.`,
  );
  process.exitCode = 1;
});
