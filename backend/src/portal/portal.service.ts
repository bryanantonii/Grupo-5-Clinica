import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Paciente } from '../pacientes/schemas/paciente.schema';
import { Consulta } from '../consultas/schemas/consulta.schema';
import {
  ConsultasService,
  validarHorario,
} from '../consultas/consultas.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { traduzirDuplicidade, validarId } from '../cadastros/validacao';
import { AgendarPacienteDto, HorariosDto } from './dto/agendamento.dto';

export const HORARIOS_PORTAL = [
  '08:00',
  '09:30',
  '10:00',
  '13:30',
  '14:00',
  '15:30',
] as const;
const zona = 'America/Sao_Paulo';
export function dataBrasilia(data = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(data);
}
function horaBrasilia(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(data);
}
@Injectable()
export class PortalService {
  constructor(
    @InjectModel(Paciente.name) private readonly pacientes: Model<Paciente>,
    @InjectModel(Consulta.name) private readonly consultas: Model<Consulta>,
    @InjectConnection() private readonly conexao: Connection,
    private readonly crud: ConsultasService,
    private readonly usuarios: UsuariosService,
  ) {}

  async convenios() {
    const lista = await this.conexao
      .collection('convenios')
      .find(
        { ativo: true },
        {
          projection: {
            nome: 1,
            codigoAns: 1,
            percentualCobertura: 1,
            telefone: 1,
          },
        },
      )
      .sort({ nome: 1 })
      .toArray();
    return lista.map((c) => ({
      _id: String(c._id),
      nome: String(c['nome']),
      codigoAns: String(c['codigoAns']),
      percentualCobertura: Number(c['percentualCobertura']),
      telefone: String(c['telefone'] ?? ''),
    }));
  }

  async horarios(dto: HorariosDto) {
    validarId(dto.profissional);
    const prof = await this.conexao
      .collection('profissionais')
      .findOne({ _id: new Types.ObjectId(dto.profissional), ativo: true });
    if (!prof) throw new NotFoundException('Profissional indisponível.');
    const inicio = new Date(dto.data + 'T00:00:00-03:00');
    if (!Number.isFinite(inicio.getTime()) || dataBrasilia(inicio) !== dto.data)
      throw new BadRequestException('Data inválida.');
    const ocupados = await this.consultas
      .find({
        profissional: new Types.ObjectId(dto.profissional),
        status: { $ne: 'cancelada' },
        dataHora: { $gte: inicio, $lt: new Date(inicio.getTime() + 86400000) },
      })
      .select('dataHora')
      .lean()
      .exec();
    const tomados = new Set(ocupados.map((c) => horaBrasilia(c.dataHora)));
    const horarios = HORARIOS_PORTAL.filter((hora) => {
      try {
        validarHorario(dto.data + 'T' + hora + ':00-03:00');
        return !tomados.has(hora);
      } catch {
        return false;
      }
    });
    return { profissional: dto.profissional, data: dto.data, horarios };
  }

  private async pacienteDaConta(usuario: string) {
    await this.usuarios.buscarContaPaciente(usuario);
    return this.pacientes
      .findOne({ usuario: new Types.ObjectId(usuario) })
      .lean()
      .exec();
  }

  async cadastro(usuario: string) {
    const paciente = await this.pacienteDaConta(usuario);
    return {
      dataNascimento: paciente ? dataBrasilia(paciente.dataNascimento) : '',
      convenio: paciente?.convenio ? String(paciente.convenio) : null,
      telefone: paciente?.telefone ?? '',
    };
  }

  async listar(usuario: string) {
    const paciente = await this.pacienteDaConta(usuario);
    if (!paciente) return [];
    const lista = await this.consultas
      .find({ paciente: paciente._id })
      .sort({ dataHora: -1 })
      .lean()
      .exec();
    return Promise.all(lista.map((c) => this.resposta(c)));
  }

  private async propria(usuario: string, id: string) {
    validarId(id);
    const paciente = await this.pacienteDaConta(usuario);
    if (!paciente) throw new NotFoundException('Consulta não encontrada.');
    const consulta = await this.consultas
      .findOne({ _id: id, paciente: paciente._id })
      .lean()
      .exec();
    if (!consulta) throw new NotFoundException('Consulta não encontrada.');
    return consulta;
  }

  async buscar(usuario: string, id: string) {
    return this.resposta(await this.propria(usuario, id));
  }

  async agendar(usuario: string, dto: AgendarPacienteDto) {
    const conta = await this.usuarios.buscarContaPaciente(usuario);
    validarHorario(dto.dataHora);
    if (dto.dataNascimento > dataBrasilia())
      throw new BadRequestException(
        'A data de nascimento não pode ser futura.',
      );
    const dataHora = new Date(dto.dataHora);
    if (
      !HORARIOS_PORTAL.includes(
        horaBrasilia(dataHora) as (typeof HORARIOS_PORTAL)[number],
      ) ||
      dataHora.getSeconds() !== 0 ||
      dataHora.getMilliseconds() !== 0
    )
      throw new BadRequestException(
        'Escolha um dos horários oferecidos pela clínica.',
      );
    const prof = await this.conexao
      .collection('profissionais')
      .findOne({ _id: new Types.ObjectId(dto.profissional), ativo: true });
    if (!prof || String(prof['especialidade']) !== dto.especialidade)
      throw new BadRequestException(
        'Escolha um profissional ativo desta especialidade.',
      );
    if (
      !(await this.conexao.collection('especialidades').findOne({
        _id: new Types.ObjectId(dto.especialidade),
        ativo: { $ne: false },
      }))
    )
      throw new BadRequestException('Especialidade indisponível.');
    if (
      dto.convenio &&
      !(await this.conexao
        .collection('convenios')
        .findOne({ _id: new Types.ObjectId(dto.convenio), ativo: true }))
    )
      throw new BadRequestException('Escolha um convênio ativo existente.');
    const anterior = await this.pacientes
      .findOne({ usuario: new Types.ObjectId(usuario) })
      .lean()
      .exec();
    if (anterior?.ativo === false)
      throw new BadRequestException(
        'Seu cadastro precisa ser atualizado pela clínica antes de agendar.',
      );
    await this.usuarios.atualizarContaPaciente(usuario, {
      nome: conta.nome,
      email: conta.email,
      telefone: dto.telefone,
    });
    let paciente;
    try {
      paciente = await this.pacientes
        .findOneAndUpdate(
          { usuario: new Types.ObjectId(usuario) },
          {
            $set: {
              nome: conta.nome,
              email: conta.email,
              telefone: dto.telefone,
              dataNascimento: new Date(dto.dataNascimento + 'T12:00:00Z'),
              convenio: dto.convenio ? new Types.ObjectId(dto.convenio) : null,
            },
            $setOnInsert: { usuario: new Types.ObjectId(usuario), ativo: true },
          },
          { upsert: true, returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec();
    } catch (erro) {
      traduzirDuplicidade(
        erro,
        'Não foi possível vincular o cadastro. Entre em contato com a clínica para confirmar seus dados.',
      );
    }
    if (!paciente)
      throw new ConflictException(
        'O cadastro foi atualizado em outra solicitação. Tente novamente.',
      );
    const criada = await this.crud.criar({
      paciente: String(paciente._id),
      profissional: dto.profissional,
      dataHora: dto.dataHora,
      motivo: dto.motivo,
      especialidade: dto.especialidade,
      convenio: dto.convenio ?? null,
    });
    return this.resposta(criada);
  }

  async cancelar(usuario: string, id: string) {
    const consulta = await this.propria(usuario, id);
    if (consulta.dataHora.getTime() <= Date.now())
      throw new BadRequestException(
        'Consultas passadas não podem ser canceladas pelo portal.',
      );
    return this.resposta(
      await this.crud.mudarStatus(String(consulta._id), 'cancelada'),
    );
  }

  private async resposta(c: Consulta & { _id: Types.ObjectId }) {
    const paciente = await this.pacientes.findById(c.paciente).lean().exec();
    const prof = await this.conexao
      .collection('profissionais')
      .findOne({ _id: c.profissional });
    const especialidadeId =
      c.especialidade ??
      (prof?.['especialidade'] as Types.ObjectId | undefined);
    const especialidade = especialidadeId
      ? await this.conexao
          .collection('especialidades')
          .findOne({ _id: especialidadeId })
      : null;
    const convenioId =
      c.convenio === undefined ? paciente?.convenio : c.convenio;
    const convenio = convenioId
      ? await this.conexao.collection('convenios').findOne({ _id: convenioId })
      : null;
    return {
      _id: String(c._id),
      profissional: String(c.profissional),
      profissionalNome: String(prof?.['nome'] ?? 'Profissional indisponível'),
      especialidade: especialidadeId ? String(especialidadeId) : '',
      especialidadeNome: String(
        especialidade?.['nome'] ?? 'Especialidade indisponível',
      ),
      dataHora: c.dataHora.toISOString(),
      data: dataBrasilia(c.dataHora),
      horario: horaBrasilia(c.dataHora),
      convenio: String(convenio?.['nome'] ?? 'Particular'),
      convenioId: convenioId ? String(convenioId) : null,
      status: c.status,
      paciente: {
        nome: paciente?.nome ?? '',
        email: paciente?.email ?? '',
        telefone: paciente?.telefone ?? '',
      },
    };
  }
}
