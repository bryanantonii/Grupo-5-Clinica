import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { ListarProfissionaisDto } from './dto/listar-profissionais.dto';
import {
  ProfissionalRespostaDto,
  EspecialidadeOpcaoDto,
} from './dto/profissional-resposta.dto';
import {
  Profissional,
  ProfissionalDocument,
} from './schemas/profissional.schema';
import { ProfissionaisEspecialidadesService } from './profissionais-especialidades.service';

type Registro = Profissional & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};
const escaparRegex = (texto: string) =>
  texto.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&');

@Injectable()
export class ProfissionaisService {
  constructor(
    @InjectModel(Profissional.name)
    private readonly model: Model<ProfissionalDocument>,
    private readonly especialidades: ProfissionaisEspecialidadesService,
  ) {}

  async listar(
    query: ListarProfissionaisDto = {},
  ): Promise<ProfissionalRespostaDto[]> {
    const filtro: Record<string, unknown> = query.todos ? {} : { ativo: true };
    if (query.busca?.trim())
      filtro.nome = { $regex: escaparRegex(query.busca.trim()), $options: 'i' };
    if (query.especialidade) {
      this.validarId(query.especialidade);
      filtro.especialidade = new Types.ObjectId(query.especialidade);
    }
    const lista = await this.model.find(filtro).sort({ nome: 1 }).lean().exec();
    const referencias = new Map<string, EspecialidadeOpcaoDto>();
    for (const p of lista) {
      const id = String(p.especialidade);
      if (!referencias.has(id))
        referencias.set(id, await this.especialidades.buscarPorId(id));
    }
    return lista.map((p) =>
      this.resposta(p, referencias.get(String(p.especialidade))!),
    );
  }

  async buscarPorId(id: string): Promise<ProfissionalRespostaDto> {
    const profissional = await this.encontrar(id);
    return this.resposta(
      profissional,
      await this.especialidades.buscarPorId(String(profissional.especialidade)),
    );
  }

  listarEspecialidades(): Promise<EspecialidadeOpcaoDto[]> {
    return this.especialidades.listar();
  }

  async criar(dto: CreateProfissionalDto): Promise<ProfissionalRespostaDto> {
    const dados = this.normalizar(dto);
    const especialidade = await this.especialidades.buscarPorId(
      dados.especialidade,
    );
    await this.garantirUnicidade(dados);
    try {
      const criado = await this.model.create({ ...dados, ativo: true });
      return this.resposta(criado.toObject(), especialidade);
    } catch (erro: unknown) {
      this.tratarDuplicidade(erro);
    }
  }

  async atualizar(
    id: string,
    dto: UpdateProfissionalDto,
  ): Promise<ProfissionalRespostaDto> {
    const atual = await this.encontrar(id);
    const dados = this.normalizar(dto);
    const especialidade = await this.especialidades.buscarPorId(
      dados.especialidade ?? String(atual.especialidade),
    );
    await this.garantirUnicidade(dados, id);
    try {
      const atualizado = await this.model
        .findByIdAndUpdate(id, dados, {
          returnDocument: 'after',
          runValidators: true,
        })
        .lean()
        .exec();
      if (!atualizado)
        throw new NotFoundException('Profissional não encontrado');
      return this.resposta(atualizado, especialidade);
    } catch (erro: unknown) {
      this.tratarDuplicidade(erro);
    }
  }

  async remover(id: string): Promise<void> {
    this.validarId(id);
    const removido = await this.model
      .findByIdAndUpdate(
        id,
        { ativo: false },
        { returnDocument: 'after', runValidators: true },
      )
      .lean()
      .exec();
    if (!removido) throw new NotFoundException('Profissional não encontrado');
  }

  private async encontrar(id: string): Promise<Registro> {
    this.validarId(id);
    const profissional = await this.model.findById(id).lean().exec();
    if (!profissional)
      throw new NotFoundException('Profissional não encontrado');
    return profissional;
  }

  private validarId(id: string): void {
    if (!/^[a-f\d]{24}$/i.test(id))
      throw new BadRequestException('O id do profissional não é válido');
  }

  private normalizar<T extends Partial<CreateProfissionalDto>>(dto: T): T {
    const dados = { ...dto };
    if (dados.nome !== undefined) dados.nome = dados.nome.trim();
    if (dados.registro !== undefined)
      dados.registro = dados.registro.trim().toUpperCase();
    if (dados.email !== undefined)
      dados.email = dados.email.trim().toLowerCase();
    if (dados.telefone !== undefined) dados.telefone = dados.telefone.trim();
    return dados;
  }

  private async garantirUnicidade(
    dados: Partial<CreateProfissionalDto>,
    idAtual?: string,
  ): Promise<void> {
    for (const campo of ['registro', 'email'] as const) {
      if (dados[campo] === undefined) continue;
      const existente = await this.model
        .findOne({ [campo]: dados[campo] })
        .lean()
        .exec();
      if (
        existente &&
        String(existente._id).toLowerCase() !== idAtual?.toLowerCase()
      )
        throw this.conflito(campo);
    }
  }

  private conflito(campo: 'registro' | 'email'): ConflictException {
    return new ConflictException({
      statusCode: 409,
      error: 'Conflict',
      campo,
      message:
        campo === 'registro'
          ? 'Já existe um profissional com este registro.'
          : 'Já existe um profissional com este e-mail.',
    });
  }

  private tratarDuplicidade(erro: unknown): never {
    if (
      typeof erro === 'object' &&
      erro !== null &&
      'code' in erro &&
      erro.code === 11000
    ) {
      const campos = 'keyPattern' in erro ? erro.keyPattern : undefined;
      throw this.conflito(
        typeof campos === 'object' && campos !== null && 'email' in campos
          ? 'email'
          : 'registro',
      );
    }
    throw erro;
  }

  private resposta(
    p: Registro,
    especialidade: EspecialidadeOpcaoDto,
  ): ProfissionalRespostaDto {
    return {
      _id: String(p._id),
      nome: p.nome,
      registro: p.registro,
      especialidade,
      email: p.email,
      telefone: p.telefone,
      ativo: p.ativo,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    };
  }
}
