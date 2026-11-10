import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { EspecialidadesService } from './especialidades.service';
import { Especialidade } from './schemas/especialidade.schema';

describe('Regras de Especialidades', () => {
  const cadeia = (valor: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(valor) }),
  });
  it('impede nome duplicado usando a mesma collation do índice', async () => {
    const collation = jest.fn().mockReturnValue(cadeia({ _id: 'existente' }));
    const model = { findOne: () => ({ collation }), create: jest.fn() };
    const service = new EspecialidadesService(
      model as unknown as Model<Especialidade>,
    );
    await expect(
      service.criar({
        nome: 'cardiologia',
        duracaoConsultaMin: 30,
        valorParticular: 250,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(collation).toHaveBeenCalledWith({ locale: 'pt', strength: 1 });
    expect(model.create).not.toHaveBeenCalled();
  });
  it('traduz a corrida de inserção do índice único em 409', async () => {
    const model = {
      findOne: () => ({ collation: () => cadeia(null) }),
      create: jest.fn().mockRejectedValue({ code: 11000 }),
    };
    const service = new EspecialidadesService(
      model as unknown as Model<Especialidade>,
    );
    await expect(
      service.criar({
        nome: 'Cardiologia',
        duracaoConsultaMin: 30,
        valorParticular: 250,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('exclusão de ID inexistente retorna 404', async () => {
    const service = new EspecialidadesService({
      findByIdAndUpdate: () => cadeia(null),
    } as unknown as Model<Especialidade>);
    await expect(
      service.remover('665f1c2b9a1e4b0012345680'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
