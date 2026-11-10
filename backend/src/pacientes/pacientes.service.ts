import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Paciente } from './schemas/paciente.schema';
import { CriarPacienteDto, AtualizarPacienteDto } from './dto/paciente.dto';
import { ListagemDto } from '../cadastros/listagem.dto';
import {
  validarId,
  escaparBusca,
  traduzirDuplicidade,
} from '../cadastros/validacao';
@Injectable()
export class PacientesService {
  constructor(
    @InjectModel(Paciente.name) private readonly model: Model<Paciente>,
    @InjectConnection() private readonly conexao: Connection,
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
    if (!item) throw new NotFoundException('Paciente não encontrado.');
    return item;
  }
  private async validar(dto: AtualizarPacienteDto, id?: string) {
    const hoje = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    if (dto.dataNascimento && dto.dataNascimento > hoje)
      throw new BadRequestException(
        'A data de nascimento não pode ser futura.',
      );
    if (
      dto.email &&
      (await this.model
        .findOne({ email: dto.email, ...(id ? { _id: { $ne: id } } : {}) })
        .lean()
        .exec())
    )
      throw new ConflictException('Já existe um paciente com este e-mail.');
    if (dto.convenio) {
      validarId(dto.convenio);
      const convenio = await this.conexao.collection('convenios').findOne({
        _id: new Types.ObjectId(dto.convenio),
        ativo: { $ne: false },
      });
      if (!convenio)
        throw new BadRequestException('Escolha um convênio ativo existente.');
    }
  }
  async criar(dto: CriarPacienteDto) {
    await this.validar(dto);
    try {
      return (await this.model.create({ ...dto, ativo: true })).toObject();
    } catch (e: unknown) {
      traduzirDuplicidade(e, 'Já existe um paciente com este e-mail.');
    }
  }
  async atualizar(id: string, dto: AtualizarPacienteDto) {
    await this.buscarPorId(id);
    await this.validar(dto, id);
    try {
      const item = await this.model
        .findByIdAndUpdate(
          id,
          { $set: dto },
          { returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec();
      if (!item) throw new NotFoundException('Paciente não encontrado.');
      return item;
    } catch (e: unknown) {
      traduzirDuplicidade(e, 'Já existe um paciente com este e-mail.');
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
      throw new NotFoundException('Paciente não encontrado.');
  }
}
