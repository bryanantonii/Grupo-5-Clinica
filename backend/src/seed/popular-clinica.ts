import { Connection } from 'mongoose';
import { Convenio, ConvenioSchema } from '../convenios/schemas/convenio.schema';
import { CONVENIOS_EXEMPLO } from '../convenios/seed/convenios.dados';
import { popularProfissionaisExemplo } from '../profissionais/seed-profissionais';
import { inserirExemplos } from './inserir-exemplos';

/** Usa uma única conexão e não cria coleções do exemplo didático Produtos. */
export async function popularClinica(conexao: Connection) {
  const convenioModel = conexao.model(Convenio.name, ConvenioSchema);
  const convenios = await inserirExemplos(
    convenioModel,
    CONVENIOS_EXEMPLO,
    'codigoAns',
  );
  const equipe = await popularProfissionaisExemplo(conexao);
  return { convenios, ...equipe };
}
