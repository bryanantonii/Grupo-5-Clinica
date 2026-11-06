import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Especialidade } from './schemas/especialidade.schema';
import {
  CriarEspecialidadeDto,
  AtualizarEspecialidadeDto,
} from './dto/especialidade.dto';
import { ListagemDto } from '../cadastros/listagem.dto';
import {
  validarId,
  escaparBusca,
  traduzirDuplicidade,
} from '../cadastros/validacao';
@Injectable()
export class EspecialidadesService {
  constructor(
    @InjectModel(Especialidade.name)
    private readonly model: Model<Especialidade>,
  ) {}
  listar(query: ListagemDto = {}) {
    return this.model
      .find({
        ...(!query.todos ? { ativo: true } : {}),
        ...(query.busca?.trim()
          ? { nome: { $regex: escaparBusca(query.busca), $options: 'i' } }
          : {}),
      })
      .sort({ nome: 1 })
      .lean()
      .exec();
  }
  async buscarPorId(id: string) {
    validarId(id);
    const item = await this.model.findById(id).lean().exec();
    if (!item) throw new NotFoundException('Especialidade não encontrada.');
    return item;
  }
  private async verificarNome(nome?: string, id?: string) {
    if (
      nome &&
      (await this.model
        .findOne({ nome, ...(id ? { _id: { $ne: id } } : {}) })
        .collation({ locale: 'pt', strength: 1 })
        .lean()
        .exec())
    )
      throw new ConflictException('Já existe uma especialidade com este nome.');
  }
  async criar(dto: CriarEspecialidadeDto) {
    await this.verificarNome(dto.nome);
    try {
      return (await this.model.create({ ...dto, ativo: true })).toObject();
    } catch (e: unknown) {
      traduzirDuplicidade(e, 'Já existe uma especialidade com este nome.');
    }
  }
  async atualizar(id: string, dto: AtualizarEspecialidadeDto) {
    await this.buscarPorId(id);
    await this.verificarNome(dto.nome, id);
    try {
      const item = await this.model
        .findByIdAndUpdate(
          id,
          { $set: dto },
          { returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec();
      if (!item) throw new NotFoundException('Especialidade não encontrada.');
      return item;
    } catch (e: unknown) {
      traduzirDuplicidade(e, 'Já existe uma especialidade com este nome.');
    }
  }
  async remover(id: string): Promise<void> {
    validarId(id);
    if (
      !(await this.model
        .findByIdAndUpdate(
          id,
          { $set: { ativo: false } },
          { returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec())
    )
      throw new NotFoundException('Especialidade não encontrada.');
  }
}
