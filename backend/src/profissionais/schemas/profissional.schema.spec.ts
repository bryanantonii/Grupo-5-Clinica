import { Schema as MongoSchema } from 'mongoose';
import { ProfissionalSchema } from './profissional.schema';

describe('Referência de Especialidade em Profissionais', () => {
  it('grava ObjectId e não Mixed para permitir os cruzamentos dos relatórios', () => {
    const campo = ProfissionalSchema.path('especialidade');
    expect(campo.instance).toBe('ObjectId');
    expect(campo).toBeInstanceOf(MongoSchema.Types.ObjectId);
  });
});
