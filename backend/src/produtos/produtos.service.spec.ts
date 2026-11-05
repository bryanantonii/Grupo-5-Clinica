import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ProdutosService } from './produtos.service';
import { Produto } from './schemas/produto.schema';

/**
 * Testes unitários do Service com o Model "dublê" (mock), como na Sprint 4 (aula 10, slide 13).
 * Não precisam do MongoDB rodando: rodam em segundos no PC e no GitHub Actions.
 */

// Cria um objeto que imita a cadeia .lean().exec() do Mongoose
// (se o seu service usar .populate(), acrescente populate: jest.fn().mockReturnThis())
const consulta = <T>(resultado: T) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(resultado),
});

describe('ProdutosService', () => {
  let service: ProdutosService;
  const id = new Types.ObjectId().toString();
  const produto = {
    _id: id,
    nome: 'Arroz integral 1 kg',
    preco: 8.9,
    estoque: 25,
    categoria: 'alimento',
    ativo: true,
  };

  const modelMock = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        ProdutosService,
        { provide: getModelToken(Produto.name), useValue: modelMock },
      ],
    }).compile();
    service = modulo.get(ProdutosService);
  });

  it('lista os produtos filtrando por categoria', async () => {
    // Arrange
    modelMock.find.mockReturnValue(consulta([produto]));
    // Act
    const resultado = await service.listar('alimento');
    // Assert
    expect(modelMock.find).toHaveBeenCalledWith({ categoria: 'alimento' });
    expect(resultado).toEqual([produto]);
  });

  it('busca um produto existente pelo id', async () => {
    modelMock.findById.mockReturnValue(consulta(produto));
    await expect(service.buscarPorId(id)).resolves.toEqual(produto);
  });

  // Arrange: o Model "dublê" devolve null
  it('lança 404 quando o produto não existe', async () => {
    modelMock.findById.mockReturnValue(consulta(null));
    // Act + Assert
    await expect(service.buscarPorId(id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lança 400 quando o id é inválido', async () => {
    await expect(service.buscarPorId('abc')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('cria um produto quando o nome é inédito', async () => {
    modelMock.findOne.mockReturnValue(consulta(null));
    modelMock.create.mockResolvedValue({ toObject: () => produto });
    const dto: CreateProdutoDto = {
      nome: produto.nome,
      preco: produto.preco,
      estoque: produto.estoque,
      categoria: 'alimento',
    };
    await expect(service.criar(dto)).resolves.toEqual(produto);
  });

  it('não cria produto com nome repetido (409)', async () => {
    modelMock.findOne.mockReturnValue(
      consulta({ ...produto, _id: new Types.ObjectId() }),
    );
    const dto: CreateProdutoDto = {
      nome: produto.nome,
      preco: 10,
      estoque: 1,
      categoria: 'alimento',
    };
    await expect(service.criar(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('não exclui produto com estoque (regra de negócio)', async () => {
    modelMock.findById.mockReturnValue(consulta(produto));
    await expect(service.remover(id)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(modelMock.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('exclui produto com estoque zerado', async () => {
    modelMock.findById.mockReturnValue(consulta({ ...produto, estoque: 0 }));
    modelMock.findByIdAndDelete.mockReturnValue(consulta(null));
    await expect(service.remover(id)).resolves.toBeUndefined();
    expect(modelMock.findByIdAndDelete).toHaveBeenCalledWith(id);
  });
});
