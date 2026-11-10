import { BadRequestException, ConflictException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { PacientesService } from './pacientes.service';
import { Paciente } from './schemas/paciente.schema';

describe('Regras de Pacientes na API', () => {
  const entrada = {
    nome: 'Ana Lima',
    email: 'ana@example.com',
    telefone: '(51) 99999-1234',
    dataNascimento: '1990-05-21',
  };
  const cadeia = (valor: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(valor) }),
  });
  it('recusa nascimento futuro sem gravar no banco', async () => {
    const model = { create: jest.fn() };
    const service = new PacientesService(
      model as unknown as Model<Paciente>,
      {} as Connection,
    );
    await expect(
      service.criar({ ...entrada, dataNascimento: '2999-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });
  it('recusa e-mail já cadastrado mesmo para um paciente inativo', async () => {
    const model = {
      findOne: jest.fn().mockReturnValue(cadeia({ ativo: false })),
      create: jest.fn(),
    };
    const service = new PacientesService(
      model as unknown as Model<Paciente>,
      {} as Connection,
    );
    await expect(service.criar(entrada)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(model.create).not.toHaveBeenCalled();
  });
  it('recusa convênio inexistente ou inativo', async () => {
    const model = {
      findOne: jest.fn().mockReturnValue(cadeia(null)),
      create: jest.fn(),
    };
    const conexao = {
      collection: () => ({ findOne: jest.fn().mockResolvedValue(null) }),
    };
    const service = new PacientesService(
      model as unknown as Model<Paciente>,
      conexao as unknown as Connection,
    );
    await expect(
      service.criar({ ...entrada, convenio: '665f1c2b9a1e4b0012345680' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });
  it('a exclusão lógica conserva o documento e altera somente ativo', async () => {
    const model = {
      findByIdAndUpdate: jest.fn().mockReturnValue(cadeia({ ativo: false })),
    };
    const service = new PacientesService(
      model as unknown as Model<Paciente>,
      {} as Connection,
    );
    await service.remover('665f1c2b9a1e4b0012345680');
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      '665f1c2b9a1e4b0012345680',
      { $set: { ativo: false } },
      expect.any(Object),
    );
  });
});
