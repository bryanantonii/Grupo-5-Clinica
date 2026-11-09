export interface Especialidade {
  _id: string;
  nome: string;
  descricao: string;
  icone: string;
}
export interface ConvenioPublico {
  _id: string;
  nome: string;
  codigoAns: string;
  percentualCobertura: number;
  telefone: string;
}
export type { ProfissionalCardDados as Profissional } from '../profissionais/profissional.model';
export interface PerfilPaciente {
  nome: string;
  email: string;
  telefone: string;
}
export type StatusConsultaPortal = 'marcada' | 'confirmada' | 'realizada' | 'falta' | 'cancelada';
export const ROTULOS_CONSULTA: Record<StatusConsultaPortal, string> = {
  marcada: 'Marcada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  falta: 'Falta',
  cancelada: 'Cancelada',
};
export interface Consulta {
  _id: string;
  profissional: string;
  profissionalNome: string;
  especialidade: string;
  especialidadeNome: string;
  dataHora: string;
  data: string;
  horario: string;
  convenio: string;
  convenioId: string | null;
  paciente: PerfilPaciente;
  status: StatusConsultaPortal;
}
export interface AgendamentoEntrada {
  profissional: string;
  especialidade: string;
  data: string;
  horario: string;
  telefone: string;
  dataNascimento: string;
  convenio: string | null;
  ciente: boolean;
}
