import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import mongoose, { Connection, Types } from 'mongoose';
import { popularClinica } from './popular-clinica';

const COLECOES = ['convenios', 'especialidades', 'profissionais'];

async function snapshot(conexao: Connection) {
  const registros: Record<string, unknown[]> = {};
  for (const nome of COLECOES) {
    registros[nome] = await conexao
      .collection(nome)
      .find({})
      .sort({ _id: 1 })
      .toArray();
  }
  return registros;
}

async function verificar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Defina MONGODB_URI no .env do backend.');
  const bancoTeste = `clinora_test_seed_${randomBytes(8).toString('hex')}`;
  const conexao = await mongoose
    .createConnection(uri, {
      dbName: bancoTeste,
      serverSelectionTimeoutMS: 15000,
    })
    .asPromise();
  let bancoProprio = false;
  const casos: string[] = [];
  try {
    assert.equal(conexao.name, bancoTeste);
    assert.equal((await conexao.db!.listCollections().toArray()).length, 0);
    bancoProprio = true;

    const primeira = await popularClinica(conexao);
    assert.deepEqual(primeira, {
      convenios: { inseridos: 5, existentes: 0 },
      especialidades: { inseridos: 3, existentes: 0 },
      profissionais: { inseridos: 3, existentes: 0 },
    });
    const nomes = (await conexao.db!.listCollections().toArray())
      .map((c) => c.name)
      .sort();
    assert.deepEqual(nomes, COLECOES);
    casos.push(
      'Seed cria somente Convênios, Especialidades e Profissionais; não cria Produtos.',
    );

    const profissionais = await conexao
      .collection<{ especialidade: Types.ObjectId }>('profissionais')
      .find({})
      .toArray();
    for (const profissional of profissionais) {
      assert.ok(
        await conexao
          .collection('especialidades')
          .findOne({ _id: profissional.especialidade }),
      );
    }
    casos.push(
      'Profissionais referenciam especialidades existentes por ObjectId.',
    );

    await conexao
      .collection('profissionais')
      .updateOne(
        { registro: 'DEMO-001' },
        { $set: { nome: 'Dra. Mariana Costa editada', ativo: false } },
      );
    await conexao
      .collection('convenios')
      .updateOne(
        { codigoAns: '123456' },
        { $set: { percentualCobertura: 37, ativo: false } },
      );
    await conexao
      .collection('especialidades')
      .updateOne(
        { nome: 'Clínica geral' },
        { $set: { descricao: 'Descrição editada pelo grupo.' } },
      );
    const antes = await snapshot(conexao);
    const segunda = await popularClinica(conexao);
    assert.deepEqual(segunda, {
      convenios: { inseridos: 0, existentes: 5 },
      especialidades: { inseridos: 0, existentes: 3 },
      profissionais: { inseridos: 0, existentes: 3 },
    });
    assert.deepEqual(await snapshot(conexao), antes);
    casos.push(
      'Reexecutar o seed preserva IDs, datas, edições e cadastros inativos.',
    );
    console.log(
      JSON.stringify(
        {
          bancoTeste,
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
        /^clinora_test_seed_[a-f0-9]{16}$/.test(bancoTeste)
      ) {
        await conexao.dropDatabase();
      }
    } finally {
      await conexao.close();
    }
  }
}

void verificar().catch((erro: unknown) => {
  console.error(
    `Falha na verificação do seed (${erro instanceof Error ? erro.name : 'Erro desconhecido'}).`,
  );
  process.exitCode = 1;
});
