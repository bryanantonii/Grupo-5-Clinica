/** Insere somente os exemplos dos módulos disponíveis da Clinora. */
import 'dotenv/config';
import mongoose from 'mongoose';
import { popularClinica } from './popular-clinica';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      'Defina MONGODB_URI no .env do backend antes de executar o seed.',
    );
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`Banco: ${mongoose.connection.name}`);
    const resultado = await popularClinica(mongoose.connection);
    console.log('Convênios:', resultado.convenios);
    console.log('Especialidades:', resultado.especialidades);
    console.log('Profissionais:', resultado.profissionais);
    console.log('Cadastros existentes foram preservados.');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((erro: unknown) => {
  const nome = erro instanceof Error ? erro.name : 'Erro desconhecido';
  console.error(`Falha no seed (${nome}). Confira conexão, dados e índices.`);
  process.exitCode = 1;
});
