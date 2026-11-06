import { Connection } from 'mongoose';

/** Completa somente campos ausentes, com os valores fictícios já usados no C1. */
export async function completarEspecialidades(conexao: Connection) {
  let camposCompletados = 0;
  for (const exemplo of [
    { nome: 'Clínica geral', duracaoConsultaMin: 30, valorParticular: 180 },
    { nome: 'Cardiologia', duracaoConsultaMin: 45, valorParticular: 280 },
    { nome: 'Dermatologia', duracaoConsultaMin: 30, valorParticular: 220 },
  ]) {
    for (const campo of ['duracaoConsultaMin', 'valorParticular'] as const) {
      const resultado = await conexao
        .collection('especialidades')
        .updateOne(
          { nome: exemplo.nome, [campo]: { $exists: false } },
          { $set: { [campo]: exemplo[campo], updatedAt: new Date() } },
        );
      camposCompletados += resultado.modifiedCount;
    }
  }
  return { camposCompletados };
}
