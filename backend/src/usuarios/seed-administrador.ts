import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';

export async function inserirAdministrador(
  conexao: Connection,
  ambiente: NodeJS.ProcessEnv,
) {
  const nome = ambiente.SEED_ADMIN_NOME?.trim() || 'Administrador Clinora';
  const email = ambiente.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const senha = ambiente.SEED_ADMIN_SENHA;
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
      'Configure SEED_ADMIN_NOME, SEED_ADMIN_EMAIL e SEED_ADMIN_SENHA no .env antes do seed.',
    );
  const model = conexao.model(Usuario.name, UsuarioSchema);
  await model.init();
  const existente = await model.findOne({ email }).lean().exec();
  if (existente) {
    if (existente.perfil !== 'admin')
      throw new Error(
        'O e-mail do seed já pertence a outro perfil. Escolha outro e-mail; o usuário existente foi preservado.',
      );
    return { inseridos: 0, existentes: 1 };
  }
  const senhaHash = await bcrypt.hash(senha, 10);
  // A condição de upsert preserva um cadastro que tenha sido inserido em paralelo.
  const agora = new Date();
  const resultado = await model.updateOne(
    { email },
    {
      $setOnInsert: {
        nome,
        email,
        senhaHash,
        perfil: 'admin',
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
