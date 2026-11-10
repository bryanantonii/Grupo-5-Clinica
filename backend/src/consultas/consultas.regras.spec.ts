import { BadRequestException, ConflictException } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { ConsultasService, validarHorario } from './consultas.service';
import { Consulta } from './schemas/consulta.schema';

describe('Regras da agenda no MongoDB', () => {
  const id = '665f1c2b9a1e4b0012345680';
  const referencia = new Types.ObjectId(id);
  const cadeia = (valor: unknown) => ({
    lean: () => ({ exec: jest.fn().mockResolvedValue(valor) }),
  });
  beforeEach(() =>
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-06T12:00:00Z')),
  );
  afterEach(() => jest.restoreAllMocks());

  it('aceita dias úteis entre 8h e 18h no fuso de Brasília', () => {
    expect(() => validarHorario('2026-11-09T11:00:00Z')).not.toThrow();
    expect(() => validarHorario('2026-11-09T20:59:00Z')).not.toThrow();
  });
  it.each([
    '2026-11-07T13:00:00Z',
    '2026-11-09T10:59:00Z',
    '2026-11-09T21:00:00Z',
    '2026-11-05T15:00:00Z',
    'inválida',
  ])('recusa horário fora da regra: %s', (data) => {
    expect(() => validarHorario(data)).toThrow(BadRequestException);
  });
  it('detecta profissional ocupado antes de inserir uma consulta', async () => {
    const model = {
      findOne: jest.fn().mockReturnValue(cadeia({ _id: id })),
      create: jest.fn(),
    };
    const conexao = {
      collection: () => ({
        findOne: jest.fn().mockResolvedValue({ _id: referencia, ativo: true }),
      }),
    };
    const service = new ConsultasService(
      model as unknown as Model<Consulta>,
      conexao as unknown as Connection,
    );
    await expect(
      service.criar({
        paciente: id,
        profissional: id,
        dataHora: '2026-11-09T13:00:00Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(model.create).not.toHaveBeenCalled();
  });
  it('recusa paciente ou profissional que não está ativo', async () => {
    const model = { create: jest.fn() };
    const conexao = {
      collection: () => ({ findOne: jest.fn().mockResolvedValue(null) }),
    };
    const service = new ConsultasService(
      model as unknown as Model<Consulta>,
      conexao as unknown as Connection,
    );
    await expect(
      service.criar({
        paciente: id,
        profissional: id,
        dataHora: '2026-11-09T13:00:00Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.create).not.toHaveBeenCalled();
  });
  it('não permite reabrir consulta encerrada nem saltar confirmação', async () => {
    const model = { findById: jest.fn(), findOneAndUpdate: jest.fn() };
    const service = new ConsultasService(
      model as unknown as Model<Consulta>,
      {} as Connection,
    );
    model.findById.mockReturnValue(cadeia({ _id: id, status: 'cancelada' }));
    await expect(service.mudarStatus(id, 'marcada')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    model.findById.mockReturnValue(cadeia({ _id: id, status: 'marcada' }));
    await expect(service.mudarStatus(id, 'realizada')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it('recusa edição dos campos de uma consulta realizada', async () => {
    const model = {
      findById: jest
        .fn()
        .mockReturnValue(cadeia({ _id: id, status: 'realizada' })),
      findOneAndUpdate: jest.fn(),
    };
    const service = new ConsultasService(
      model as unknown as Model<Consulta>,
      {} as Connection,
    );
    await expect(
      service.atualizar(id, { motivo: 'Outra descrição' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it('conserva uma mudança de status concorrente em vez de sobrescrevê-la', async () => {
    const model = {
      findById: jest
        .fn()
        .mockReturnValue(cadeia({ _id: id, status: 'marcada' })),
      findOneAndUpdate: jest.fn().mockReturnValue(cadeia(null)),
    };
    const service = new ConsultasService(
      model as unknown as Model<Consulta>,
      {} as Connection,
    );
    await expect(service.mudarStatus(id, 'confirmada')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id, status: 'marcada' },
      { $set: { status: 'confirmada' } },
      expect.any(Object),
    );
  });
});
