import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Paciente } from '../pacientes/schemas/paciente.schema';
import { Consulta } from '../consultas/schemas/consulta.schema';
@Injectable()
export class RelatoriosService {
  constructor(
    @InjectModel(Paciente.name) private readonly pacientes: Model<Paciente>,
    @InjectModel(Consulta.name) private readonly consultas: Model<Consulta>,
  ) {}
  async resumo() {
    const [pacientes, consultasMarcadas, faltas] = await Promise.all([
      this.pacientes.countDocuments({ ativo: true }).exec(),
      this.consultas
        .countDocuments({ status: { $in: ['marcada', 'confirmada'] } })
        .exec(),
      this.consultas.countDocuments({ status: 'falta' }).exec(),
    ]);
    return { pacientes, consultasMarcadas, faltas };
  }
  consultasPorStatus() {
    return this.consultas
      .aggregate<{ _id: string; quantidade: number }>([
        { $group: { _id: '$status', quantidade: { $sum: 1 } } },
        { $sort: { quantidade: -1 } },
      ])
      .exec();
  }
  consultasPorEspecialidade() {
    return this.consultas
      .aggregate<{ especialidade: string; quantidade: number }>([
        { $match: { status: 'realizada' } },
        {
          $lookup: {
            from: 'profissionais',
            localField: 'profissional',
            foreignField: '_id',
            as: 'p',
          },
        },
        { $unwind: '$p' },
        {
          $set: {
            'p.especialidade': {
              $convert: {
                input: '$p.especialidade',
                to: 'objectId',
                onError: null,
                onNull: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'especialidades',
            localField: 'p.especialidade',
            foreignField: '_id',
            as: 'e',
          },
        },
        { $unwind: '$e' },
        { $group: { _id: '$e.nome', quantidade: { $sum: 1 } } },
        { $project: { _id: 0, especialidade: '$_id', quantidade: 1 } },
        { $sort: { quantidade: -1 } },
      ])
      .exec();
  }
}
