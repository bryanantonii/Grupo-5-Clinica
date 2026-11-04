import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Module,
  NotFoundException,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ConveniosModule } from './convenios.module';
import { ConveniosService } from './convenios.service';
import { Convenio } from './schemas/convenio.schema';

async function verificar() {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error('Configure MONGODB_URI para executar a verificação.');
  const bancoTeste = `clinora_test_aula11_${randomBytes(6).toString('hex')}`;
  @Module({
    imports: [
      MongooseModule.forRoot(uri, {
        dbName: bancoTeste,
        serverSelectionTimeoutMS: 10000,
        autoCreate: false,
        autoIndex: false,
      }),
      ConveniosModule,
    ],
  })
  class VerificacaoModule {}

  const app = await NestFactory.createApplicationContext(VerificacaoModule, {
    logger: false,
  });
  const conexao = app.get<Connection>(getConnectionToken());
  let bancoProprio = false;
  const casos: string[] = [];
  try {
    assert.equal(conexao.name, bancoTeste);
    assert.equal((await conexao.db!.listCollections().toArray()).length, 0);
    bancoProprio = true;
    const model = app.get<Model<Convenio>>(getModelToken(Convenio.name));
    await model.createCollection();
    await model.createIndexes();
    const service = app.get(ConveniosService);
    const dados = {
      nome: 'Plano de teste A',
      codigoAns: '045678',
      percentualCobertura: 80,
    };
    const criado = await service.criar(dados);
    const id = String(criado._id);
    assert.equal(criado.codigoAns, '045678');
    assert.equal(criado.ativo, true);
    assert.equal(criado.modalidade, 'individual');
    casos.push('Cadastro ativo com ANS textual e modalidade padrão');

    await assert.rejects(
      () => service.criar({ ...dados, nome: 'Outro plano' }),
      ConflictException,
    );
    assert.equal(await model.countDocuments(), 1);
    casos.push('RN10 bloqueia ANS duplicado sem gravar outro documento');

    await assert.rejects(
      () =>
        service.criar({
          ...dados,
          codigoAns: '123456',
          nome: 'PLANO DE TESTE A',
        }),
      ConflictException,
    );
    casos.push('Nome único respeita a collation do índice');

    const atualizado = await service.atualizar(id, {
      codigoAns: '045678',
      percentualCobertura: 0,
    });
    assert.equal(atualizado.percentualCobertura, 0);
    assert.equal(atualizado.nome, dados.nome);
    casos.push('Edição mantém o próprio ANS e preserva campos omitidos');

    const outro = await service.criar({
      ...dados,
      nome: 'Plano de teste B',
      codigoAns: '123456',
    });
    await assert.rejects(
      () => service.atualizar(String(outro._id), { codigoAns: '045678' }),
      ConflictException,
    );
    assert.equal(
      (await service.buscarPorId(String(outro._id))).codigoAns,
      '123456',
    );
    casos.push('RN10 bloqueia duplicidade na edição sem alterar o cadastro');

    await service.remover(id);
    const inativo = await service.buscarPorId(id);
    assert.equal(inativo.ativo, false);
    assert.equal(inativo.nome, dados.nome);
    assert.equal(inativo.createdAt.getTime(), criado.createdAt.getTime());
    assert.equal(await model.countDocuments(), 2);
    assert.equal((await service.listar()).length, 1);
    assert.equal((await service.listar(undefined, true)).length, 2);
    casos.push('RN11 preserva o documento e o histórico e filtra os inativos');

    await service.remover(id);
    assert.equal(await model.countDocuments(), 2);
    await assert.rejects(
      () => service.criar({ ...dados, nome: 'Terceiro plano' }),
      ConflictException,
    );
    casos.push(
      'Inativação repetida preserva o cadastro e o ANS continua reservado',
    );

    const concorrentes = await Promise.allSettled([
      service.criar({
        ...dados,
        nome: 'Plano concorrente A',
        codigoAns: '999997',
      }),
      service.criar({
        ...dados,
        nome: 'Plano concorrente B',
        codigoAns: '999997',
      }),
    ]);
    assert.equal(
      concorrentes.filter((r) => r.status === 'fulfilled').length,
      1,
    );
    const recusado = concorrentes.find((r) => r.status === 'rejected');
    assert(
      recusado?.status === 'rejected' &&
        recusado.reason instanceof ConflictException,
    );
    assert.equal(await model.countDocuments({ codigoAns: '999997' }), 1);
    casos.push(
      'Duas criações concorrentes resultam em um cadastro e um conflito 409',
    );

    assert.equal((await service.listar('Plano.*')).length, 0);
    await assert.rejects(
      () => service.buscarPorId('invalido'),
      BadRequestException,
    );
    await assert.rejects(
      () => service.remover(new Types.ObjectId().toString()),
      NotFoundException,
    );
    casos.push('Busca literal e erros de ID inválido ou inexistente');

    console.log(
      JSON.stringify(
        {
          banco: bancoTeste,
          injecaoNest: true,
          casosAprovados: casos.length,
          casos,
        },
        null,
        2,
      ),
    );
  } finally {
    try {
      if (bancoProprio && conexao.name === bancoTeste)
        await conexao.dropDatabase();
    } finally {
      await app.close();
    }
  }
}

verificar().catch((erro: unknown) => {
  console.error(
    `Falha na verificação (${erro instanceof Error ? erro.name : 'erro'}). Confira conexão e permissões para o banco temporário.`,
  );
  process.exitCode = 1;
});
