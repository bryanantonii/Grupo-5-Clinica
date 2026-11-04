import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { ConveniosService } from './convenios.service';
import { Convenio } from './schemas/convenio.schema';

const consulta = <T>(valor: T) => ({
  sort: jest.fn().mockReturnThis(),
  collation: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(valor),
});

describe('Regras de negócio de Convênios', () => {
  let service: ConveniosService;
  const id = new Types.ObjectId().toString();
  const entrada = {
    nome: 'Saúde Mais',
    codigoAns: '045678',
    percentualCobertura: 80,
  };
  const registro = {
    ...entrada,
    _id: new Types.ObjectId(id),
    ativo: true,
    modalidade: 'individual',
  };
  const model = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    model.findOne.mockReturnValue(consulta(null));
    model.findById.mockReturnValue(consulta(registro));
    model.findByIdAndUpdate.mockReturnValue(consulta(registro));
    model.create.mockResolvedValue({ toObject: () => registro });
    const modulo = await Test.createTestingModule({
      providers: [
        ConveniosService,
        { provide: getModelToken(Convenio.name), useValue: model },
      ],
    }).compile();
    service = modulo.get(ConveniosService);
  });

  it('cria um convênio ativo e preserva o zero inicial do ANS', async () => {
    await expect(
      service.criar({ ...entrada, codigoAns: ' 045678 ' }),
    ).resolves.toEqual(registro);
    expect(model.create).toHaveBeenCalledWith({ ...entrada, ativo: true });
  });

  it.each([true, false])(
    'RN10 impede ANS de outro convênio com ativo=%s',
    async (ativo) => {
      model.findOne.mockReturnValue(consulta({ ...registro, ativo }));
      await expect(service.criar(entrada)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(model.findOne).toHaveBeenCalledWith({ codigoAns: '045678' });
      expect(model.create).not.toHaveBeenCalled();
    },
  );

  it('RN10 também impede trocar o ANS por um já utilizado na edição', async () => {
    model.findOne.mockReturnValue(
      consulta({ ...registro, _id: new Types.ObjectId() }),
    );
    await expect(
      service.atualizar(id, { codigoAns: '123456' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(model.findOne).toHaveBeenCalledWith({
      codigoAns: '123456',
      _id: { $ne: id },
    });
    expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('permite conservar o próprio ANS na edição, excluindo o próprio ID da busca', async () => {
    await service.atualizar(id, { codigoAns: '045678' });
    expect(model.findOne).toHaveBeenCalledWith({
      codigoAns: '045678',
      _id: { $ne: id },
    });
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { $set: { codigoAns: '045678' } },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );
  });

  it('atualização parcial preserva os campos omitidos e aceita cobertura zero', async () => {
    await service.atualizar(id, { percentualCobertura: 0 });
    expect(model.findOne).not.toHaveBeenCalled();
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { $set: { percentualCobertura: 0 } },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );
  });

  it('nome único segue a mesma comparação de maiúsculas e acentos do índice existente', async () => {
    const porNome = consulta(registro);
    model.findOne
      .mockReturnValueOnce(consulta(null))
      .mockReturnValueOnce(porNome);
    await expect(
      service.criar({ ...entrada, nome: ' SAUDE MAIS ' }),
    ).rejects.toMatchObject({ status: 409 });
    expect(model.findOne).toHaveBeenLastCalledWith({ nome: 'SAUDE MAIS' });
    expect(porNome.collation).toHaveBeenCalledWith({
      locale: 'pt',
      strength: 1,
    });
    expect(model.create).not.toHaveBeenCalled();
  });

  it.each(['codigoAns', 'nome'])(
    'traduz E11000 de %s para 409 no cadastro concorrente',
    async (campo) => {
      model.create.mockRejectedValue({
        code: 11000,
        keyPattern: { [campo]: 1 },
      });
      await expect(service.criar(entrada)).rejects.toMatchObject({
        status: 409,
        response: { campo },
      });
    },
  );

  it('traduz E11000 para 409 quando outro cadastro ocupa o ANS durante a edição', async () => {
    const atualizacao = consulta(null);
    atualizacao.exec.mockRejectedValue({
      code: 11000,
      keyPattern: { codigoAns: 1 },
    });
    model.findByIdAndUpdate.mockReturnValue(atualizacao);
    await expect(
      service.atualizar(id, { codigoAns: '123456' }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('mantém erros inesperados do banco para não mascarar indisponibilidade como duplicidade', async () => {
    const erro = new Error('Banco indisponível');
    model.create.mockRejectedValue(erro);
    await expect(service.criar(entrada)).rejects.toBe(erro);
  });

  it('RN11 lista somente os ativos por padrão', async () => {
    model.find.mockReturnValue(consulta([registro]));
    await expect(service.listar()).resolves.toEqual([registro]);
    expect(model.find).toHaveBeenCalledWith({ ativo: true });
  });

  it('RN11 permite consultar os inativos ao solicitar todos explicitamente', async () => {
    const inativo = { ...registro, ativo: false };
    model.find.mockReturnValue(consulta([inativo]));
    await expect(service.listar(undefined, true)).resolves.toEqual([inativo]);
    expect(model.find).toHaveBeenCalledWith({});
  });

  it('busca usa texto literal e conserva o filtro de ativos', async () => {
    const busca = consulta([]);
    model.find.mockReturnValue(busca);
    await expect(service.listar(' Saúde.* ')).resolves.toEqual([]);
    expect(model.find).toHaveBeenCalledWith({
      ativo: true,
      nome: { $regex: 'Saúde\\.\\*', $options: 'i' },
    });
    expect(busca.sort).toHaveBeenCalledWith({ nome: 1 });
  });

  it.each([true, false])(
    'RN11 inativa e preserva o cadastro quando o estado atual é %s',
    async (ativo) => {
      model.findByIdAndUpdate.mockReturnValue(consulta({ ...registro, ativo }));
      await expect(service.remover(id)).resolves.toBeUndefined();
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { $set: { ativo: false } },
        {
          returnDocument: 'after',
          runValidators: true,
        },
      );
      expect(model.deleteOne).not.toHaveBeenCalled();
      expect(model.findByIdAndDelete).not.toHaveBeenCalled();
    },
  );

  it('detalhes permitem consultar um convênio inativo preservado', async () => {
    model.findById.mockReturnValue(consulta({ ...registro, ativo: false }));
    await expect(service.buscarPorId(id)).resolves.toMatchObject({
      ativo: false,
    });
  });

  it.each(['buscarPorId', 'atualizar', 'remover'] as const)(
    '%s recusa ID inválido antes de acessar o banco',
    async (metodo) => {
      await expect(service[metodo]('invalido', {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(model.findById).not.toHaveBeenCalled();
      expect(model.findByIdAndUpdate).not.toHaveBeenCalled();
    },
  );

  it.each(['buscarPorId', 'atualizar'] as const)(
    '%s devolve 404 quando o cadastro não existe',
    async (metodo) => {
      model.findById.mockReturnValue(consulta(null));
      await expect(service[metodo](id, {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    },
  );

  it('remover um cadastro inexistente devolve 404', async () => {
    model.findByIdAndUpdate.mockReturnValue(consulta(null));
    await expect(service.remover(id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('edição devolve 404 se o registro deixar de existir entre a leitura e a escrita', async () => {
    model.findByIdAndUpdate.mockReturnValue(consulta(null));
    await expect(
      service.atualizar(id, { nome: 'Plano atualizado' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
