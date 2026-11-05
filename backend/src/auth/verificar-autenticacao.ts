import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { AppModule } from '../app.module';
import { RespostaInterceptor } from '../common/interceptors/resposta.interceptor';
import { popularClinica } from '../seed/popular-clinica';
import { inserirAdministrador } from '../usuarios/seed-administrador';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

let etapa = 'Conexão do banco temporário';

async function verificar() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !process.env.JWT_SECRET)
    throw new Error('Configure MONGODB_URI e JWT_SECRET no .env.');
  const bancoTeste = `clinora_test_aula12_${randomBytes(8).toString('hex')}`;
  const conexao = await mongoose
    .createConnection(uri, {
      dbName: bancoTeste,
      serverSelectionTimeoutMS: 15000,
    })
    .asPromise();
  let bancoProprio = false;
  let app: INestApplication | undefined;
  const casos: string[] = [];
  const senha = randomBytes(18).toString('base64url');
  const email = 'admin@autenticacao.example';
  try {
    assert.equal(conexao.name, bancoTeste);
    assert.equal((await conexao.db!.listCollections().toArray()).length, 0);
    bancoProprio = true;
    await popularClinica(conexao);
    const adminAmbiente = {
      SEED_ADMIN_NOME: 'Administrador de teste',
      SEED_ADMIN_EMAIL: email,
      SEED_ADMIN_SENHA: senha,
    };
    etapa = 'Seed do administrador';
    assert.deepEqual(await inserirAdministrador(conexao, adminAmbiente), {
      inseridos: 1,
      existentes: 0,
    });
    const usuarios = conexao.model(Usuario.name, UsuarioSchema);
    const admin = await usuarios
      .findOne({ email })
      .select('+senhaHash')
      .lean()
      .exec();
    assert.ok(admin);
    assert.equal(await bcrypt.compare(senha, admin.senhaHash), true);
    assert.notEqual(admin.senhaHash, senha);
    casos.push('Administrador gravado com bcrypt e sem senha em texto.');
    const publico = await usuarios.findOne({ email }).lean().exec();
    assert.ok(publico && !('senhaHash' in publico));
    casos.push('select false omite o hash na consulta comum.');
    const antes = await conexao.collection('usuarios').findOne({ email });
    assert.deepEqual(
      await inserirAdministrador(conexao, {
        ...adminAmbiente,
        SEED_ADMIN_SENHA: 'OutraSenha@123',
      }),
      { inseridos: 0, existentes: 1 },
    );
    assert.deepEqual(
      await conexao.collection('usuarios').findOne({ email }),
      antes,
    );
    casos.push(
      'Repetição do seed preserva administrador, senha, ID e timestamps.',
    );

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
      const dados: unknown = await resposta.json();
      return {
        status: resposta.status,
        corpo: dados as Record<string, unknown>,
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
      assert.equal(resultado.status, status);
      casos.push(descricao);
      return resultado.corpo;
    }
    await conferir(
      'Rotas de gestão recusam acesso sem JWT.',
      'GET',
      '/profissionais',
      401,
    );
    await conferir('Identidade protegida exige token.', 'GET', '/auth/me', 401);
    await conferir(
      'Cadastro de usuários exige token.',
      'POST',
      '/usuarios',
      401,
      { nome: 'Ana Lima', email: 'ana@example.com', senha: 'Senha@123' },
    );
    const catalogo = await conferir(
      'Catálogo público continua disponível sem token.',
      'GET',
      '/catalogo/profissionais',
      200,
    );
    assert.ok(Array.isArray(catalogo.dados) && catalogo.dados.length === 3);
    for (const item of catalogo.dados as Record<string, unknown>[]) {
      assert.ok(
        !('email' in item) && !('telefone' in item) && !('senhaHash' in item),
      );
    }
    casos.push('Catálogo não expõe contato privado nem dados de acesso.');
    await conferir(
      'Especialidades públicas continuam acessíveis.',
      'GET',
      '/catalogo/especialidades',
      200,
    );
    const inexistente = await conferir(
      'E-mail inexistente retorna 401 genérico.',
      'POST',
      '/auth/login',
      401,
      { email: 'inexistente@example.com', senha: 'Senha@123' },
    );
    const incorreto = await conferir(
      'Senha incorreta retorna o mesmo 401.',
      'POST',
      '/auth/login',
      401,
      { email, senha: 'Incorreta@123' },
    );
    assert.equal(inexistente.message, incorreto.message);
    assert.equal(incorreto.message, 'Credenciais inválidas');
    const login = await conferir(
      'Login público devolve token válido.',
      'POST',
      '/auth/login',
      200,
      { email, senha },
    );
    const dadosLogin = login.dados as {
      accessToken: string;
      usuario: Record<string, unknown>;
    };
    assert.equal(typeof dadosLogin.accessToken, 'string');
    assert.ok(!JSON.stringify(login).includes('senhaHash'));
    const jwt = new JwtService({ secret: process.env.JWT_SECRET });
    const payload = await jwt.verifyAsync<Record<string, unknown>>(
      dadosLogin.accessToken,
      { algorithms: ['HS256'] },
    );
    assert.deepEqual(Object.keys(payload).sort(), [
      'exp',
      'iat',
      'nome',
      'perfil',
      'sub',
    ]);
    assert.equal(Number(payload.exp) - Number(payload.iat), 3600);
    casos.push('JWT usa payload mínimo e expira em uma hora.');
    const token = dadosLogin.accessToken;
    await conferir(
      'Token válido permite consultar a identidade.',
      'GET',
      '/auth/me',
      200,
      undefined,
      token,
    );
    const cadastro = await conferir(
      'Consulta do próprio usuário omite o hash.',
      'GET',
      '/usuarios/me',
      200,
      undefined,
      token,
    );
    assert.ok(!JSON.stringify(cadastro).includes('senhaHash'));
    await conferir(
      'JWT libera a listagem protegida de Profissionais.',
      'GET',
      '/profissionais',
      200,
      undefined,
      token,
    );
    await conferir(
      'Texto inválido no Bearer recebe 401.',
      'GET',
      '/auth/me',
      401,
      undefined,
      'invalido',
    );
    await conferir(
      'Cabeçalho com conteúdo adicional recebe 401.',
      'GET',
      '/auth/me',
      401,
      undefined,
      token + ' extra',
    );
    const outro = new JwtService({ secret: randomBytes(48).toString('hex') });
    await conferir(
      'Assinatura feita com outro segredo é recusada.',
      'GET',
      '/auth/me',
      401,
      undefined,
      await outro.signAsync(
        { sub: payload.sub, nome: payload.nome, perfil: payload.perfil },
        { expiresIn: '1h' },
      ),
    );
    await conferir(
      'Token expirado é recusado.',
      'GET',
      '/auth/me',
      401,
      undefined,
      await jwt.signAsync(
        { sub: payload.sub, nome: payload.nome, perfil: payload.perfil },
        { expiresIn: -1 },
      ),
    );
    await conferir(
      'Token sem expiração é recusado.',
      'GET',
      '/auth/me',
      401,
      undefined,
      await jwt.signAsync({
        sub: payload.sub,
        nome: payload.nome,
        perfil: payload.perfil,
      }),
    );
    const partes = token.split('.');
    partes[1] = Buffer.from(
      JSON.stringify({ ...payload, nome: 'Nome adulterado' }),
    ).toString('base64url');
    await conferir(
      'Payload adulterado sem nova assinatura é recusado.',
      'GET',
      '/auth/me',
      401,
      undefined,
      partes.join('.'),
    );
    const novo = {
      nome: 'Ana Lima',
      email: 'ana@example.com',
      senha: 'Senha@123',
    };
    const criado = await conferir(
      'Usuário autenticado cadastra atendente com hash.',
      'POST',
      '/usuarios',
      201,
      novo,
      token,
    );
    assert.equal((criado.dados as Record<string, unknown>).perfil, 'atendente');
    assert.ok(!JSON.stringify(criado).includes('senhaHash'));
    await conferir(
      'E-mail duplicado normalizado recebe 409.',
      'POST',
      '/usuarios',
      409,
      { ...novo, email: ' ANA@EXAMPLE.COM ' },
      token,
    );
    await conferir(
      'Cliente não consegue criar perfil admin pelo DTO.',
      'POST',
      '/usuarios',
      400,
      { ...novo, email: 'outro@example.com', perfil: 'admin' },
      token,
    );
    await conferir(
      'Cliente não consegue injetar senhaHash.',
      'POST',
      '/usuarios',
      400,
      { ...novo, email: 'outro@example.com', senhaHash: 'injetado' },
      token,
    );
    await conferir(
      'Senhas acima de 72 bytes são recusadas.',
      'POST',
      '/usuarios',
      400,
      { ...novo, email: 'outro@example.com', senha: 'á'.repeat(40) },
      token,
    );
    await conferir(
      'Login também recusa truncamento UTF-8.',
      'POST',
      '/auth/login',
      400,
      { email, senha: 'á'.repeat(40) },
    );
    await conferir(
      'DTO de login rejeita e-mail e senha inválidos.',
      'POST',
      '/auth/login',
      400,
      { email: 'invalido', senha: '' },
    );
    await conexao
      .collection('usuarios')
      .updateOne({ email: novo.email }, { $set: { ativo: false } });
    await conferir(
      'Usuário inativo não autentica mesmo com senha correta.',
      'POST',
      '/auth/login',
      401,
      { email: novo.email, senha: novo.senha },
    );
    etapa = 'Swagger e coleções';
    const swagger = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
    assert.ok(swagger.paths['/api/v1/profissionais'].get?.security?.length);
    assert.ok(!swagger.paths['/api/v1/auth/login'].post?.security?.length);
    assert.ok(
      !(await conexao.db!.listCollections({ name: 'produtos' }).toArray())
        .length,
    );
    casos.push(
      'Swagger diferencia login público e recursos protegidos; Produtos permanece ausente.',
    );
    console.log(
      JSON.stringify(
        {
          bancoTeste,
          total: casos.length,
          casos,
          limpeza: 'Banco temporário removido ao finalizar.',
        },
        null,
        2,
      ),
    );
  } finally {
    try {
      if (
        bancoProprio &&
        conexao.name === bancoTeste &&
        /^clinora_test_aula12_[a-f0-9]{16}$/.test(bancoTeste)
      )
        await conexao.dropDatabase();
    } finally {
      if (app) await app.close();
      await conexao.close();
    }
  }
}

void verificar().catch((erro: unknown) => {
  console.error(
    `Falha na verificação de autenticação em ${etapa} (${erro instanceof Error ? erro.name : 'erro desconhecido'}).`,
  );
  process.exitCode = 1;
});
