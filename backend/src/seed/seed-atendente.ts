import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

export async function inserirAtendente(
  conexao: Connection,
  ambiente: NodeJS.ProcessEnv,
) {
  const email = ambiente.SEED_ATENDENTE_EMAIL?.trim().toLowerCase();
  const senha = ambiente.SEED_ATENDENTE_SENHA;
  const nome = ambiente.SEED_ATENDENTE_NOME?.trim() || 'Atendente Clinora';
  if (
    !email ||
    !isEmail(email) ||
    !senha ||
    senha.length < 8 ||
    bcrypt.truncates(senha) ||
    nome.length < 3 ||
    nome.length > 80
  )
    throw new Error(
      'Execute npm run configurar:auth para preparar o atendente no .env local.',
    );
  const model = conexao.model(Usuario.name, UsuarioSchema);
  await model.init();
  const existente = await model.findOne({ email }).lean().exec();
  if (existente) {
    if (existente.perfil !== 'atendente')
      throw new Error(
        'O e-mail do atendente pertence a outro perfil e foi preservado.',
      );
    return { inseridos: 0, existentes: 1 };
  }
  const senhaHash = await bcrypt.hash(senha, 10);
  const agora = new Date();
  const resultado = await model.updateOne(
    { email },
    {
      $setOnInsert: {
        nome,
        email,
        senhaHash,
        perfil: 'atendente',
        ativo: true,
        createdAt: agora,
        updatedAt: agora,
      },
    },
    { upsert: true, runValidators: true, timestamps: false },
  );
  return {
    inseridos: resultado.upsertedCount,
    existentes: resultado.upsertedCount ? 0 : 1,
  };
}
