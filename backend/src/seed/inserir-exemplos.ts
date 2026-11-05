import { Model, QueryFilter } from 'mongoose';

/** Insere somente os exemplos ausentes; não apaga nem sobrescreve cadastros. */
export async function inserirExemplos<T>(
  model: Model<T>,
  registros: ReadonlyArray<Partial<T>>,
  campoUnico: keyof T,
): Promise<{ inseridos: number; existentes: number }> {
  await model.init();
  let inseridos = 0;
  let existentes = 0;
  for (const dados of registros) {
    const documento = new model(dados);
    await documento.validate();
    const agora = new Date();
    const resultado = await model.updateOne(
      { [campoUnico]: dados[campoUnico] } as QueryFilter<T>,
      {
        $setOnInsert: {
          ...documento.toObject(),
          createdAt: agora,
          updatedAt: agora,
        },
      },
      { upsert: true, runValidators: true, timestamps: false },
    );
    if (resultado.upsertedCount) inseridos++;
    else existentes++;
  }
  return { inseridos, existentes };
}
