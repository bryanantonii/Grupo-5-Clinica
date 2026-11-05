import 'dotenv/config';
import mongoose, { Connection, Types } from 'mongoose';
import { inserirExemplos } from '../seed/inserir-exemplos';
import {
  Profissional,
  ProfissionalSchema,
} from './schemas/profissional.schema';

export async function popularProfissionaisExemplo(conexao: Connection) {
  const especialidades = conexao.collection<{
    _id: Types.ObjectId;
    nome: string;
    ativo: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>('especialidades');
  const opcoes = [
    { nome: 'Clínica geral', descricao: 'Acompanhamento da saúde.' },
    { nome: 'Cardiologia', descricao: 'Cuidado da saúde do coração.' },
    { nome: 'Dermatologia', descricao: 'Cuidado da pele.' },
  ];
  const ids: Types.ObjectId[] = [];
  let inseridas = 0;
  for (const opcao of opcoes) {
    const agora = new Date();
    const resultado = await especialidades.updateOne(
      { nome: opcao.nome },
      {
        $setOnInsert: {
          ...opcao,
          ativo: true,
          createdAt: agora,
          updatedAt: agora,
        },
      },
      { upsert: true },
    );
    inseridas += resultado.upsertedCount;
    const registro = await especialidades.findOne({ nome: opcao.nome });
    if (!registro)
      throw new Error('Não foi possível localizar a especialidade de exemplo.');
    ids.push(registro._id);
  }
  const model = conexao.model(Profissional.name, ProfissionalSchema);
  const dados = [
    {
      nome: 'Dra. Mariana Costa',
      registro: 'DEMO-001',
      especialidade: ids[0],
      email: 'mariana.costa@example.com',
      telefone: '(51) 90000-0001',
    },
    {
      nome: 'Dr. Rafael Mendes',
      registro: 'DEMO-002',
      especialidade: ids[1],
      email: 'rafael.mendes@example.com',
      telefone: '(51) 90000-0002',
    },
    {
      nome: 'Dra. Camila Oliveira',
      registro: 'DEMO-003',
      especialidade: ids[2],
      email: 'camila.oliveira@example.com',
      telefone: '(51) 90000-0003',
    },
  ];
  const profissionais = await inserirExemplos(model, dados, 'registro');
  return {
    especialidades: {
      inseridos: inseridas,
      existentes: opcoes.length - inseridas,
    },
    profissionais,
  };
}

export async function inserirProfissionaisExemplo(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    await popularProfissionaisExemplo(mongoose.connection);
    console.log(
      'Exemplos de Profissionais conferidos. Registros existentes foram preservados.',
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  void inserirProfissionaisExemplo(
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/projeto-integrador',
  ).catch(() => {
    console.error(
      'Falha no seed de Profissionais. Confira a conexão, os registros únicos e o banco configurado.',
    );
    process.exitCode = 1;
  });
}
