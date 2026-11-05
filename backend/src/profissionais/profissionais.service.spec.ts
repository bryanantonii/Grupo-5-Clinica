import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ProfissionaisService } from './profissionais.service';
import { ProfissionaisEspecialidadesService } from './profissionais-especialidades.service';
import { Profissional } from './schemas/profissional.schema';

const consulta = <T>(valor: T) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(valor),
});

describe('ProfissionaisService', () => {
  let service: ProfissionaisService;
  const id = new Types.ObjectId().toString();
  const especialidade = {
    _id: new Types.ObjectId().toString(),
    nome: 'Clínica geral',
  };
  const dto = {
    nome: 'Dra. Ana Lima',
    registro: 'CRM-RS 12345',
    especialidade: especialidade._id,
    email: 'ana@example.com',
    telefone: '(51) 99999-9999',
  };
  const profissional = {
    ...dto,
    _id: new Types.ObjectId(id),
    especialidade: new Types.ObjectId(especialidade._id),
    ativo: true,
  };
  const model = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const referencias = { buscarPorId: jest.fn(), listar: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    referencias.buscarPorId.mockResolvedValue(especialidade);
    referencias.listar.mockResolvedValue([especialidade]);
    model.findOne.mockReturnValue(consulta(null));
    const modulo = await Test.createTestingModule({
      providers: [
        ProfissionaisService,
        { provide: getModelToken(Profissional.name), useValue: model },
        { provide: ProfissionaisEspecialidadesService, useValue: referencias },
      ],
    }).compile();
    service = modulo.get(ProfissionaisService);
  });

  it('lista somente ativos por padrão e devolve a referência com nome', async () => {
    model.find.mockReturnValue(consulta([profissional]));
    const resultado = await service.listar();
    expect(model.find).toHaveBeenCalledWith({ ativo: true });
    expect(resultado[0].especialidade).toEqual(especialidade);
  });

  it('inclui inativos e filtra busca literal e especialidade', async () => {
    model.find.mockReturnValue(consulta([]));
    await service.listar({
      todos: true,
      busca: 'Ana.*',
      especialidade: especialidade._id,
    });
    expect(model.find).toHaveBeenCalledWith({
      nome: { $regex: 'Ana\\.\\*', $options: 'i' },
      especialidade: new Types.ObjectId(especialidade._id),
    });
  });

  it('rejeita ID inválido na busca, atualização e inativação', async () => {
    await expect(service.buscarPorId('abc')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.atualizar('abc', {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.remover('abc')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('devolve 404 para profissional inexistente', async () => {
    model.findById.mockReturnValue(consulta(null));
    await expect(service.buscarPorId(id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('busca um profissional por ID', async () => {
    model.findById.mockReturnValue(consulta(profissional));
    await expect(service.buscarPorId(id)).resolves.toMatchObject({
      _id: id,
      nome: dto.nome,
    });
  });

  it('cria com registro em maiúsculas, e-mail normalizado e ativo automático', async () => {
    model.create.mockResolvedValue({ toObject: () => profissional });
    await service.criar({
      ...dto,
      registro: ' crm-rs 12345 ',
      email: ' ANA@EXAMPLE.COM ',
    });
    expect(model.create).toHaveBeenCalledWith({ ...dto, ativo: true });
  });

  it.each(['registro', 'email'] as const)(
    'bloqueia %s repetido com 409',
    async (campo) => {
      model.findOne.mockImplementation((filtro: Record<string, unknown>) =>
        consulta(campo in filtro ? profissional : null),
      );
      await expect(service.criar(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(model.create).not.toHaveBeenCalled();
    },
  );

  it('não cria se a especialidade não existir', async () => {
    referencias.buscarPorId.mockRejectedValue(
      new NotFoundException('Especialidade não encontrada'),
    );
    await expect(service.criar(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it('converte violação de índice único por concorrência em 409', async () => {
    model.create.mockRejectedValue({ code: 11000, keyPattern: { email: 1 } });
    try {
      await service.criar(dto);
      throw new Error('Era esperado conflito');
    } catch (erro: unknown) {
      expect(erro).toBeInstanceOf(ConflictException);
      expect((erro as ConflictException).getResponse()).toMatchObject({
        campo: 'email',
      });
    }
  });

  it('atualiza sem acusar duplicidade do próprio registro', async () => {
    model.findById.mockReturnValue(consulta(profissional));
    model.findOne.mockReturnValue(consulta(profissional));
    model.findByIdAndUpdate.mockReturnValue(
      consulta({ ...profissional, nome: 'Dra. Ana Souza' }),
    );
    const resultado = await service.atualizar(id, {
      nome: 'Dra. Ana Souza',
      registro: dto.registro,
    });
    expect(resultado.nome).toBe('Dra. Ana Souza');
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { nome: 'Dra. Ana Souza', registro: dto.registro },
      { returnDocument: 'after', runValidators: true },
    );
  });

  it('valida a nova especialidade ao editar', async () => {
    model.findById.mockReturnValue(consulta(profissional));
    referencias.buscarPorId.mockRejectedValue(new NotFoundException());
    await expect(
      service.atualizar(id, { especialidade: new Types.ObjectId().toString() }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('não atualiza um profissional inexistente', async () => {
    model.findById.mockReturnValue(consulta(null));
    await expect(
      service.atualizar(id, { nome: 'Dra. Ana Souza' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('inativa sem apagar o registro', async () => {
    model.findByIdAndUpdate.mockReturnValue(
      consulta({ ...profissional, ativo: false }),
    );
    await expect(service.remover(id)).resolves.toBeUndefined();
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { ativo: false },
      { returnDocument: 'after', runValidators: true },
    );
  });

  it('devolve 404 ao inativar ID inexistente', async () => {
    model.findByIdAndUpdate.mockReturnValue(consulta(null));
    await expect(service.remover(id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('permite reativar por PATCH', async () => {
    model.findById.mockReturnValue(consulta({ ...profissional, ativo: false }));
    model.findByIdAndUpdate.mockReturnValue(consulta(profissional));
    await expect(service.atualizar(id, { ativo: true })).resolves.toMatchObject(
      { ativo: true },
    );
  });

  it('propaga falha de banco sem transformá-la em sucesso', async () => {
    const falha = new Error('Banco indisponível');
    model.create.mockRejectedValue(falha);
    await expect(service.criar(dto)).rejects.toBe(falha);
  });
});
