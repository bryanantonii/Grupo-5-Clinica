import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { validarId } from '../cadastros/validacao';
import { Contato } from './contatos.schema';
import type { CriarContatoDto } from './contatos.controller';
@Injectable()
export class ContatosService {
  constructor(
    @InjectModel(Contato.name) private readonly model: Model<Contato>,
  ) {}
  async criar(dto: CriarContatoDto) {
    const item = await this.model.create({ ...dto, situacao: 'nova' });
    return {
      _id: String(item._id),
      mensagem: 'Mensagem recebida pela clínica.',
    };
  }
  listar() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }
  async ler(id: string) {
    validarId(id);
    const item = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { situacao: 'lida' } },
        { returnDocument: 'after', runValidators: true },
      )
      .lean()
      .exec();
    if (!item) throw new NotFoundException('Mensagem não encontrada.');
    return item;
  }
}
