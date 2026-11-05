import 'dotenv/config';
import assert from 'node:assert/strict';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Convenio } from './schemas/convenio.schema';
import { CONVENIOS_EXEMPLO } from './seed/convenios.dados';

async function verificar() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  try {
    const model = app.get<Model<Convenio>>(getModelToken(Convenio.name));
    await model.init();
    const indices = (await model.listIndexes()) as unknown as Array<{
      name: string;
      key: Record<string, number | string>;
      unique?: boolean;
    }>;
    assert(indices.some((i) => i.key.codigoAns === 1 && i.unique));
    assert(indices.some((i) => i.key.nome === 1 && i.unique));
    const exemplos = await model
      .find({ codigoAns: { $in: CONVENIOS_EXEMPLO.map((c) => c.codigoAns) } })
      .sort({ codigoAns: 1 })
      .lean()
      .exec();
    assert.equal(exemplos.length, 5);
    for (const exemplo of exemplos) {
      assert(exemplo.createdAt instanceof Date);
      assert(exemplo.updatedAt instanceof Date);
      assert(exemplo.updatedAt >= exemplo.createdAt);
    }
    assert(exemplos.some((c) => c.codigoAns === '045678'));
    const duplicado = await model
      .create({ ...CONVENIOS_EXEMPLO[0] })
      .then(() => null)
      .catch((erro: unknown) => erro);
    assert(
      duplicado &&
        typeof duplicado === 'object' &&
        'code' in duplicado &&
        duplicado.code === 11000,
      'O índice único deve rejeitar o exemplo duplicado com E11000.',
    );
    console.log(
      JSON.stringify(
        {
          banco: model.db.name,
          colecao: model.collection.collectionName,
          injecaoNest: true,
          exemplosEncontrados: exemplos.length,
          total: await model.countDocuments(),
          ativos: await model.countDocuments({ ativo: true }),
          duplicidadeBloqueada: true,
          indices,
          registros: exemplos,
        },
        null,
        2,
      ),
    );
  } finally {
    await app.close();
  }
}

verificar().catch((erro: unknown) => {
  console.error(
    `Falha na verificação (${erro instanceof Error ? erro.name : 'erro'}). Confira seed e conexão.`,
  );
  process.exitCode = 1;
});
