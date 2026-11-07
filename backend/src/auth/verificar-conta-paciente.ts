import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { RespostaInterceptor } from '../common/interceptors/resposta.interceptor';
import { inserirAdministrador } from '../usuarios/seed-administrador';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

let etapa = 'Conectar ao banco temporário';
async function verificar() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET)
    throw new Error('Configure o .env.');
  const bancoTeste = `clinora_test_conta_${randomBytes(8).toString('hex')}`;
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
    const usuarios = conexao.model(Usuario.name, UsuarioSchema);
    await usuarios.init();
    const senha = randomBytes(18).toString('base64url');
    await inserirAdministrador(conexao, {
      SEED_ADMIN_NOME: 'Equipe Teste',
      SEED_ADMIN_EMAIL: 'equipe@conta.example',
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
    const base = await app.getUrl();
    async function chamar(
      metodo: string,
      rota: string,
      corpo?: object,
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
      const dados = (await resposta.json()) as {
        dados?: {
          accessToken?: string;
          usuario?: {
            _id: string;
            nome: string;
            email: string;
            perfil: string;
            telefone: string;
          };
          _id?: string;
          nome?: string;
          email?: string;
          telefone?: string;
        };
        message?: string;
      };
      return { status: resposta.status, dados };
    }
    async function esperar(
      nome: string,
      metodo: string,
      rota: string,
      status: number,
      corpo?: object,
      token?: string,
    ) {
      etapa = nome;
      const resposta = await chamar(metodo, rota, corpo, token);
      assert.equal(resposta.status, status);
      casos.push(nome);
      return resposta.dados;
    }
    const cadastro = {
      nome: 'Paciente Integração',
      email: ' PACIENTE@CONTA.EXAMPLE ',
      senha,
    };
    const resposta = await esperar(
      'Cadastro público persiste e inicia sessão com 201.',
      'POST',
      '/auth/cadastro-paciente',
      201,
      cadastro,
    );
    const token = resposta.dados!.accessToken!;
    const id = resposta.dados!.usuario!._id;
    assert.equal(resposta.dados!.usuario!.perfil, 'paciente');
    assert.equal(resposta.dados!.usuario!.email, 'paciente@conta.example');
    assert.ok(token && id);
    const conta = await usuarios
      .findById(id)
      .select('+senhaHash')
      .lean()
      .exec();
    assert.ok(conta && conta.ativo && conta.perfil === 'paciente');
    assert.ok(await bcrypt.compare(senha, conta.senhaHash));
    assert.notEqual(conta.senhaHash, senha);
    assert.ok(
      !JSON.stringify(resposta).includes('senhaHash') &&
        !JSON.stringify(resposta).includes(senha),
    );
    casos.push(
      'MongoDB guarda perfil fixo, e-mail normalizado e hash bcrypt; resposta não expõe a senha.',
    );
    await esperar(
      'Cadastro repetido retorna 409.',
      'POST',
      '/auth/cadastro-paciente',
      409,
      cadastro,
    );
    for (const campo of ['perfil', 'ativo', '_id', 'senhaHash', 'paciente']) {
      await esperar(
        `Cadastro recusa injeção de ${campo}.`,
        'POST',
        '/auth/cadastro-paciente',
        400,
        {
          ...cadastro,
          email: 'injecao@conta.example',
          [campo]: campo === 'ativo' ? false : 'admin',
        },
      );
    }
    for (const dados of [
      { nome: '  ' },
      { email: 'invalido' },
      { senha: 'curta' },
      { senha: 'á'.repeat(40) },
    ]) {
      await esperar(
        `Cadastro valida ${Object.keys(dados)[0]} (${casos.length}).`,
        'POST',
        '/auth/cadastro-paciente',
        400,
        { ...cadastro, email: 'invalidacao@conta.example', ...dados },
      );
    }
    await esperar(
      'Login público aceita a conta gravada.',
      'POST',
      '/auth/login-paciente',
      200,
      { email: cadastro.email, senha },
    );
    await esperar(
      'Login público recusa senha incorreta.',
      'POST',
      '/auth/login-paciente',
      401,
      { email: cadastro.email, senha: 'Incorreta@123' },
    );
    await esperar(
      'Login público recusa conta inexistente.',
      'POST',
      '/auth/login-paciente',
      401,
      { email: 'ausente@conta.example', senha },
    );
    await esperar(
      'Paciente não autentica no login da equipe.',
      'POST',
      '/auth/login',
      401,
      { email: cadastro.email, senha },
    );
    await esperar(
      'Conta da equipe não autentica no login do paciente.',
      'POST',
      '/auth/login-paciente',
      401,
      { email: 'equipe@conta.example', senha },
    );
    const equipe = await esperar(
      'Login da equipe continua funcionando.',
      'POST',
      '/auth/login',
      200,
      { email: 'equipe@conta.example', senha },
    );
    const tokenEquipe = equipe.dados!.accessToken!;
    await esperar('Conta exige JWT.', 'GET', '/conta', 401);
    await esperar(
      'Equipe não assume a conta de um paciente.',
      'GET',
      '/conta',
      403,
      undefined,
      tokenEquipe,
    );
    const perfil = await esperar(
      'Conta lê os próprios dados do MongoDB.',
      'GET',
      '/conta',
      200,
      undefined,
      token,
    );
    assert.equal(perfil.dados!._id, id);
    assert.ok(!JSON.stringify(perfil).includes('senhaHash'));
    const outro = await esperar(
      'Segunda conta é independente.',
      'POST',
      '/auth/cadastro-paciente',
      201,
      { nome: 'Outro Paciente', email: 'outro@conta.example', senha },
    );
    const outroId = outro.dados!.usuario!._id;
    const outroAntes = await usuarios
      .findById(outroId)
      .select('+senhaHash')
      .lean()
      .exec();
    const consultaId = await esperar(
      'ID na query não troca o titular da conta.',
      'GET',
      '/conta?usuario=' + outroId,
      200,
      undefined,
      token,
    );
    assert.equal(consultaId.dados!._id, id);
    const novos = {
      nome: 'Paciente Atualizado',
      email: 'atualizado@conta.example',
      telefone: '(51) 99999-1013',
    };
    await esperar(
      'Meus dados salva nome, e-mail e telefone.',
      'PATCH',
      '/conta',
      200,
      novos,
      token,
    );
    const salvo = await usuarios
      .findById(id)
      .select('+senhaHash')
      .lean()
      .exec();
    assert.equal(salvo!.nome, novos.nome);
    assert.equal(salvo!.email, novos.email);
    assert.equal(salvo!.telefone, novos.telefone);
    assert.equal(salvo!.senhaHash, conta.senhaHash);
    assert.ok(salvo!.updatedAt > salvo!.createdAt);
    assert.deepEqual(
      await usuarios.findById(outroId).select('+senhaHash').lean().exec(),
      outroAntes,
    );
    casos.push(
      'Edição persiste, atualiza timestamp e preserva senha e outra conta.',
    );
    await esperar(
      'Novo login lê o perfil atualizado no banco.',
      'POST',
      '/auth/login-paciente',
      200,
      { email: novos.email, senha },
    );
    await esperar(
      'E-mail anterior deixa de autenticar.',
      'POST',
      '/auth/login-paciente',
      401,
      { email: cadastro.email, senha },
    );
    await esperar(
      'Edição não assume e-mail de outra conta.',
      'PATCH',
      '/conta',
      409,
      { ...novos, email: 'outro@conta.example' },
      token,
    );
    for (const campo of ['perfil', 'ativo', '_id', 'senhaHash', 'paciente']) {
      await esperar(
        `Meus dados recusa injeção de ${campo}.`,
        'PATCH',
        '/conta',
        400,
        { ...novos, [campo]: 'admin' },
        token,
      );
    }
    await esperar(
      'Telefone inválido é recusado.',
      'PATCH',
      '/conta',
      400,
      { ...novos, telefone: 'abc' },
      token,
    );
    await esperar(
      'Telefone nulo é recusado com 400, sem erro interno.',
      'PATCH',
      '/conta',
      400,
      { ...novos, telefone: null },
      token,
    );
    for (const rota of [
      '/auth/me',
      '/usuarios/me',
      '/pacientes',
      '/profissionais',
      '/consultas',
      '/especialidades',
      '/convenios',
      '/relatorios/resumo',
    ]) {
      await esperar(
        `Paciente não acessa ${rota}.`,
        'GET',
        rota,
        403,
        undefined,
        token,
      );
    }
    for (const moduloNome of [
      'pacientes',
      'profissionais',
      'consultas',
      'especialidades',
      'convenios',
      'usuarios',
    ]) {
      await esperar(
        `Paciente não cadastra ${moduloNome} na gestão.`,
        'POST',
        '/' + moduloNome,
        403,
        {},
        token,
      );
    }
    for (const metodo of ['PATCH', 'DELETE']) {
      await esperar(
        `Paciente não executa ${metodo} em cadastro da gestão.`,
        metodo,
        '/pacientes/' + id,
        403,
        metodo === 'PATCH' ? novos : undefined,
        token,
      );
    }
    const corrida = await Promise.all(
      [1, 2].map(() =>
        chamar('POST', '/auth/cadastro-paciente', {
          nome: 'Conta Concorrente',
          email: 'corrida@conta.example',
          senha,
        }),
      ),
    );
    assert.deepEqual(corrida.map((r) => r.status).sort(), [201, 409]);
    casos.push('Índice único resolve cadastro simultâneo com 201 e 409.');
    await usuarios.updateOne({ _id: id }, { $set: { ativo: false } });
    await esperar(
      'Conta inativa não faz novo login.',
      'POST',
      '/auth/login-paciente',
      401,
      { email: novos.email, senha },
    );
    await esperar(
      'Conta inativa perde acesso à leitura mesmo com JWT anterior.',
      'GET',
      '/conta',
      401,
      undefined,
      token,
    );
    await esperar(
      'Conta inativa não altera o próprio cadastro.',
      'PATCH',
      '/conta',
      401,
      novos,
      token,
    );
    assert.equal(await conexao.collection('pacientes').countDocuments(), 0);
    casos.push(
      'Cadastro de acesso não cria ficha clínica nem vincula registros por e-mail sem verificação.',
    );
    const evidencia = {
      data: new Date().toLocaleDateString('sv-SE', {
        timeZone: 'America/Sao_Paulo',
      }),
      bancoTemporario: bancoTeste,
      total: casos.length,
      casos,
      bancoClinoraAlterado: false,
    };
    if (process.argv.includes('--registrar')) {
      const pasta = resolve(process.cwd(), '../docs/aula-13/evidencias');
      mkdirSync(pasta, { recursive: true });
      writeFileSync(
        resolve(pasta, 'conta-paciente.json'),
        JSON.stringify(evidencia, null, 2) + '\n',
      );
    }
    console.log(JSON.stringify(evidencia, null, 2));
  } finally {
    if (
      proprio &&
      conexao.name === bancoTeste &&
      /^clinora_test_conta_[a-f0-9]{16}$/.test(bancoTeste)
    ) {
      await conexao.dropDatabase();
      console.log('Banco temporário próprio removido; clinora preservado.');
    }
    if (app) await app.close();
    await conexao.close();
  }
}
verificar().catch((erro: unknown) => {
  console.error(
    'Falha na etapa: ' +
      etapa +
      '. Tipo: ' +
      (erro instanceof Error ? erro.name : 'desconhecido'),
  );
  process.exitCode = 1;
});
