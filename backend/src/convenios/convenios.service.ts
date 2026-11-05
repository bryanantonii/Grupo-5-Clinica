import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AtualizarConvenioEntrada,
  CriarConvenioEntrada,
} from './convenios.entrada';
import { Convenio, ConvenioDocument } from './schemas/convenio.schema';

type CampoUnico = 'codigoAns' | 'nome';

@Injectable()
export class ConveniosService {
  constructor(
    @InjectModel(Convenio.name)
    private readonly model: Model<ConvenioDocument>,
  ) {}

  listar(busca?: string, todos = false) {
    const filtro: Record<string, unknown> = todos ? {} : { ativo: true };
    if (busca?.trim()) {
      filtro.nome = {
        $regex: busca.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        $options: 'i',
      };
    }
    return this.model.find(filtro).sort({ nome: 1 }).lean().exec();
  }

  async buscarPorId(id: string) {
    this.validarId(id);
    const convenio = await this.model.findById(id).lean().exec();
    if (!convenio) throw new NotFoundException('Convênio não encontrado.');
    return convenio;
  }

  async criar(entrada: CriarConvenioEntrada) {
    const dados = this.normalizar(entrada);
    await this.garantirUnicidade(dados);
    try {
      const convenio = await this.model.create({ ...dados, ativo: true });
      return convenio.toObject();
    } catch (erro: unknown) {
      this.tratarDuplicidade(erro);
    }
  }

  async atualizar(id: string, entrada: AtualizarConvenioEntrada) {
    await this.buscarPorId(id);
    const dados = this.normalizar(entrada);
    await this.garantirUnicidade(dados, id);
    try {
      const convenio = await this.model
        .findByIdAndUpdate(
          id,
          { $set: dados },
          {
            returnDocument: 'after',
            runValidators: true,
          },
        )
        .lean()
        .exec();
      if (!convenio) throw new NotFoundException('Convênio não encontrado.');
      return convenio;
    } catch (erro: unknown) {
      this.tratarDuplicidade(erro);
    }
  }

  async remover(id: string): Promise<void> {
    this.validarId(id);
    const convenio = await this.model
      .findByIdAndUpdate(
        id,
        { $set: { ativo: false } },
        {
          returnDocument: 'after',
          runValidators: true,
        },
      )
      .lean()
      .exec();
    if (!convenio) throw new NotFoundException('Convênio não encontrado.');
  }

  private validarId(id: string): void {
    if (!/^[a-f\d]{24}$/i.test(id))
      throw new BadRequestException('O id do convênio não é válido.');
  }

  private normalizar(entrada: AtualizarConvenioEntrada) {
    const dados: AtualizarConvenioEntrada = {};
    for (const campo of ['nome', 'codigoAns', 'telefone'] as const) {
      if (entrada[campo] !== undefined) dados[campo] = entrada[campo].trim();
    }
    if (entrada.percentualCobertura !== undefined)
      dados.percentualCobertura = entrada.percentualCobertura;
    if (entrada.modalidade !== undefined) dados.modalidade = entrada.modalidade;
    if (entrada.ativo !== undefined) dados.ativo = entrada.ativo;
    return dados;
  }

  private async garantirUnicidade(
    dados: AtualizarConvenioEntrada,
    idAtual?: string,
  ): Promise<void> {
    for (const campo of ['codigoAns', 'nome'] as const) {
      if (dados[campo] === undefined) continue;
      const filtro: Record<string, unknown> = { [campo]: dados[campo] };
      if (idAtual) filtro._id = { $ne: idAtual };
      const consulta = this.model.findOne(filtro);
      if (campo === 'nome') consulta.collation({ locale: 'pt', strength: 1 });
      if (await consulta.lean().exec()) throw this.conflito(campo);
    }
  }

  private conflito(campo: CampoUnico): ConflictException {
    return new ConflictException({
      statusCode: 409,
      error: 'Conflict',
      campo,
      message:
        campo === 'codigoAns'
          ? 'Já existe um convênio com este código ANS.'
          : 'Já existe um convênio com este nome.',
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
        typeof campos === 'object' && campos !== null && 'nome' in campos
          ? 'nome'
          : 'codigoAns',
      );
    }
    throw erro;
  }
}
