import { Model } from 'mongoose';
import { Paciente } from '../pacientes/schemas/paciente.schema';
import { Consulta } from '../consultas/schemas/consulta.schema';
import { RelatoriosService } from './relatorios.service';

describe('Relatórios da clínica', () => {
  it('conta pacientes ativos, consultas marcadas ou confirmadas e faltas', async () => {
    const pacientes = {
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: () => Promise.resolve(4) }),
    };
    const consultas = {
      countDocuments: jest
        .fn()
        .mockReturnValueOnce({ exec: () => Promise.resolve(2) })
        .mockReturnValueOnce({ exec: () => Promise.resolve(1) }),
    };
    const service = new RelatoriosService(
      pacientes as unknown as Model<Paciente>,
      consultas as unknown as Model<Consulta>,
    );
    await expect(service.resumo()).resolves.toEqual({
      pacientes: 4,
      consultasMarcadas: 2,
      faltas: 1,
    });
    expect(pacientes.countDocuments).toHaveBeenCalledWith({ ativo: true });
    expect(consultas.countDocuments).toHaveBeenCalledWith({
      status: { $in: ['marcada', 'confirmada'] },
    });
    expect(consultas.countDocuments).toHaveBeenCalledWith({ status: 'falta' });
  });
  it('agrupa os status no MongoDB e aceita uma coleção vazia', async () => {
    const consultas = {
      aggregate: jest.fn().mockReturnValue({ exec: () => Promise.resolve([]) }),
    };
    const service = new RelatoriosService(
      {} as Model<Paciente>,
      consultas as unknown as Model<Consulta>,
    );
    await expect(service.consultasPorStatus()).resolves.toEqual([]);
    expect(consultas.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $group: { _id: '$status', quantidade: { $sum: 1 } } },
      ]),
    );
  });
  it('consulta somente realizadas e cruza profissionais e especialidades', async () => {
    const consultas = {
      aggregate: jest.fn().mockReturnValue({
        exec: () =>
          Promise.resolve([{ especialidade: 'Cardiologia', quantidade: 3 }]),
      }),
    };
    const service = new RelatoriosService(
      {} as Model<Paciente>,
      consultas as unknown as Model<Consulta>,
    );
    await expect(service.consultasPorEspecialidade()).resolves.toEqual([
      { especialidade: 'Cardiologia', quantidade: 3 },
    ]);
    expect(consultas.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        { $match: { status: 'realizada' } },
        {
          $lookup: {
            from: 'profissionais',
            localField: 'profissional',
            foreignField: '_id',
            as: 'p',
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
      ]),
    );
  });
});
