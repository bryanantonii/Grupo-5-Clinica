import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Categoria, Produto, ProdutoDocument } from './schemas/produto.schema';

/**
 * O Service é onde vivem as regras de negócio (PDF 04, cap. 7 e PDF 05, cap. 5).
 * Ele não conhece HTTP: recebe dados, decide e devolve dados ou lança exceções.
 */
@Injectable()
export class ProdutosService {
  constructor(
    @InjectModel(Produto.name)
    private readonly produtoModel: Model<ProdutoDocument>,
  ) {}

  async listar(categoria?: Categoria): Promise<Produto[]> {
    const filtro = categoria ? { categoria } : {};
    return this.produtoModel.find(filtro).sort({ nome: 1 }).lean().exec();
  }

  async buscarPorId(id: string): Promise<Produto> {
    this.validarId(id);
    const produto = await this.produtoModel.findById(id).lean().exec();
    if (!produto) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }
    return produto;
  }

  async criar(dto: CreateProdutoDto): Promise<Produto> {
    await this.garantirNomeUnico(dto.nome);
    const criado = await this.produtoModel.create(dto);
    return criado.toObject();
  }

  async atualizar(id: string, dto: UpdateProdutoDto): Promise<Produto> {
    this.validarId(id);
    if (dto.nome) {
      await this.garantirNomeUnico(dto.nome, id);
    }
    const atualizado = await this.produtoModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!atualizado) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }
    return atualizado;
  }

  async remover(id: string): Promise<void> {
    const produto = await this.buscarPorId(id);

    // REGRA DE NEGÓCIO: não é permitido excluir produto com estoque.
    // O usuário deve zerar o estoque ou apenas inativar o produto.
    if (produto.estoque > 0) {
      throw new BadRequestException(
        'Não é possível excluir um produto com estoque. Zere o estoque ou inative o produto.',
      );
    }
    await this.produtoModel.findByIdAndDelete(id).exec();
  }

  // ---------- regras auxiliares ----------

  private validarId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`O id "${id}" não é válido`);
    }
  }

  private async garantirNomeUnico(nome: string, idAtual?: string) {
    const existente = await this.produtoModel.findOne({ nome }).lean().exec();
    if (existente && String(existente._id) !== idAtual) {
      throw new ConflictException(`Já existe um produto com o nome "${nome}"`);
    }
  }
}
