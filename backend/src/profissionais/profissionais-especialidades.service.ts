import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { EspecialidadeOpcaoDto } from './dto/profissional-resposta.dto';

interface EspecialidadeRegistro {
  _id: Types.ObjectId;
  nome: string;
  ativo?: boolean;
}

/** Consulta de referência enquanto o módulo Especialidades não exporta seu service.
 * Somente lê a coleção do colega; não cria nem altera especialidades. */
@Injectable()
export class ProfissionaisEspecialidadesService {
  constructor(@InjectConnection() private readonly conexao: Connection) {}

  async listar(): Promise<EspecialidadeOpcaoDto[]> {
    const registros = await this.conexao
      .collection<EspecialidadeRegistro>('especialidades')
      .find({ ativo: { $ne: false } }, { projection: { nome: 1 } })
      .sort({ nome: 1 })
      .toArray();
    return registros.map((e) => ({ _id: String(e._id), nome: e.nome }));
  }

  async buscarPorId(id: string): Promise<EspecialidadeOpcaoDto> {
    if (!/^[a-f\d]{24}$/i.test(id))
      throw new BadRequestException('Especialidade: id inválido');
    const registro = await this.conexao
      .collection<EspecialidadeRegistro>('especialidades')
      .findOne({ _id: new Types.ObjectId(id) }, { projection: { nome: 1 } });
    if (!registro) throw new NotFoundException('Especialidade não encontrada');
    return { _id: String(registro._id), nome: registro.nome };
  }
}
