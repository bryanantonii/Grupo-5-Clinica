import { ModuloConfig } from '../gestao/modulo-config';
import { ConsultasService } from './services/consultas.service';
export const CONSULTAS_CONFIG: ModuloConfig = {
  ...{
    modulo: 'consultas',
    singular: 'consulta',
    titulo: 'Consultas',
    artigo: 'a',
    descricao: 'Acompanhe a agenda e a situação de cada atendimento.',
    campos: [
      {
        nome: 'paciente',
        rotulo: 'Paciente',
        tipo: 'select',
        obrigatorio: true,
        referencia: 'pacientes',
      },
      {
        nome: 'profissional',
        rotulo: 'Profissional',
        tipo: 'select',
        obrigatorio: true,
        referencia: 'profissionais',
      },
      {
        nome: 'dataHora',
        rotulo: 'Data e hora',
        tipo: 'datetime-local',
        obrigatorio: true,
        ajuda: 'Segunda a sexta, a partir das 8h e antes das 18h. Escolha um horário futuro.',
      },
      {
        nome: 'motivo',
        rotulo: 'Motivo',
        tipo: 'textarea',
        maxLength: 300,
        ajuda: 'Até 300 caracteres. Use apenas informações fictícias nesta demonstração.',
      },
    ],
    colunas: [
      {
        campo: 'paciente',
        rotulo: 'Paciente',
        referencia: 'pacientes',
      },
      {
        campo: 'profissional',
        rotulo: 'Profissional',
        referencia: 'profissionais',
      },
      {
        campo: 'dataHora',
        rotulo: 'Data e hora',
        formato: 'dataHora',
      },
      {
        campo: 'status',
        rotulo: 'Status',
        formato: 'status',
      },
    ],
  },
  servico: ConsultasService,
};
