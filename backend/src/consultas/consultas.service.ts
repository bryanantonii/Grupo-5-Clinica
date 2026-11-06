import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Consulta, Status, TRANSICOES } from './schemas/consulta.schema';
import {
  AtualizarConsultaDto,
  CriarConsultaDto,
  ListarConsultasDto,
} from './dto/consulta.dto';
import {
  validarId,
  escaparBusca,
  traduzirDuplicidade,
} from '../cadastros/validacao';
export function validarHorario(dataHora: string) {
  const data = new Date(dataHora);
  if (!Number.isFinite(data.getTime()))
    throw new BadRequestException('Data e hora inválidas.');
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(data);
  const dia = partes.find((p) => p.type === 'weekday')?.value;
  const hora = Number(partes.find((p) => p.type === 'hour')?.value);
  if (
    !Number.isFinite(data.getTime()) ||
    data.getTime() <= Date.now() ||
    dia === 'Sat' ||
    dia === 'Sun' ||
    hora < 8 ||
    hora >= 18
  )
    throw new BadRequestException(
      'Escolha um dia útil no futuro entre 8h e 18h, no horário de Brasília.',
    );
}
@Injectable()
export class ConsultasService {
  constructor(
    @InjectModel(Consulta.name) private readonly model: Model<Consulta>,
    @InjectConnection() private readonly conexao: Connection,
  ) {}
  async listar(query: ListarConsultasDto = {}) {
    const filtro: Record<string, unknown> = query.status
      ? { status: query.status }
      : {};
    if (query.busca?.trim()) {
      const pacientes = await this.conexao
        .collection('pacientes')
        .find(
          { nome: { $regex: escaparBusca(query.busca), $options: 'i' } },
          { projection: { _id: 1 } },
        )
        .toArray();
      filtro.paciente = { $in: pacientes.map((p) => p._id) };
    }
    return this.model.find(filtro).sort({ dataHora: 1 }).lean().exec();
  }
  async buscarPorId(id: string) {
    validarId(id);
    const item = await this.model.findById(id).lean().exec();
    if (!item) throw new NotFoundException('Consulta não encontrada.');
    return item;
  }
  private async validarReferencias(paciente: string, profissional: string) {
    validarId(paciente);
    validarId(profissional);
    for (const [colecao, id, rotulo] of [
      ['pacientes', paciente, 'paciente'],
      ['profissionais', profissional, 'profissional'],
    ]) {
      if (
        !(await this.conexao
          .collection(colecao)
          .findOne({ _id: new Types.ObjectId(id), ativo: { $ne: false } }))
      )
        throw new BadRequestException(`Escolha um ${rotulo} ativo existente.`);
    }
  }
  private async validarConflito(
    profissional: string,
    dataHora: string,
    id?: string,
  ) {
    if (
      await this.model
        .findOne({
          profissional: new Types.ObjectId(profissional),
          dataHora: new Date(dataHora),
          status: { $ne: 'cancelada' },
          ...(id ? { _id: { $ne: id } } : {}),
        })
        .lean()
        .exec()
    )
      throw new ConflictException(
        'O profissional já tem uma consulta neste horário.',
      );
  }
  async criar(dto: CriarConsultaDto) {
    validarHorario(dto.dataHora);
    await this.validarReferencias(dto.paciente, dto.profissional);
    await this.validarConflito(dto.profissional, dto.dataHora);
    try {
      return (
        await this.model.create({ ...dto, status: 'marcada' })
      ).toObject();
    } catch (e: unknown) {
      traduzirDuplicidade(
        e,
        'O profissional já tem uma consulta neste horário.',
      );
    }
  }
  async atualizar(id: string, dto: AtualizarConsultaDto) {
    const atual = await this.buscarPorId(id);
    if (!['marcada', 'confirmada'].includes(atual.status))
      throw new BadRequestException(
        'Consultas encerradas não podem ser editadas.',
      );
    const profissional = dto.profissional ?? String(atual.profissional);
    const paciente = dto.paciente ?? String(atual.paciente);
    const dataHora = dto.dataHora ?? atual.dataHora.toISOString();
    validarHorario(dataHora);
    await this.validarReferencias(paciente, profissional);
    await this.validarConflito(profissional, dataHora, id);
    try {
      const alterada = await this.model
        .findOneAndUpdate(
          { _id: id, status: atual.status },
          { $set: dto },
          { returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec();
      if (!alterada)
        throw new ConflictException(
          'A consulta mudou durante a edição. Atualize a lista.',
        );
      return alterada;
    } catch (e: unknown) {
      traduzirDuplicidade(
        e,
        'O profissional já tem uma consulta neste horário.',
      );
    }
  }
  async mudarStatus(id: string, novo: Status) {
    const atual = await this.buscarPorId(id);
    if (!TRANSICOES[atual.status].includes(novo))
      throw new BadRequestException(
        `Não é possível passar de "${atual.status}" para "${novo}".`,
      );
    const alterada = await this.model
      .findOneAndUpdate(
        { _id: id, status: atual.status },
        { $set: { status: novo } },
        { returnDocument: 'after', runValidators: true },
      )
      .lean()
      .exec();
    if (!alterada)
      throw new ConflictException(
        'O status foi alterado por outro usuário. Atualize a lista.',
      );
    return alterada;
  }
  async remover(id: string): Promise<void> {
    await this.mudarStatus(id, 'cancelada');
  }
}
