import { ProfissionalCardDados } from '../profissionais/profissional.model';

export type Modulo = 'pacientes' | 'profissionais' | 'consultas' | 'especialidades' | 'convenios';
export type ValorCampo = string | number | boolean | undefined;
export interface Registro {
  _id: string;
  [campo: string]: ValorCampo;
}
export interface Paciente extends Registro {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  convenio: string;
  ativo: boolean;
}
export interface ProfissionalGestao extends ProfissionalCardDados, Registro {}
export interface Especialidade extends Registro {
  nome: string;
  descricao: string;
  duracaoConsultaMin: number;
  valorParticular: number;
  icone: string;
  ativo: boolean;
}
export interface Convenio extends Registro {
  nome: string;
  codigoAns: string;
  percentualCobertura: number;
  telefone: string;
  ativo: boolean;
}
export type StatusConsulta = 'marcada' | 'confirmada' | 'realizada' | 'falta' | 'cancelada';
export interface ConsultaGestao extends Registro {
  paciente: string;
  profissional: string;
  dataHora: string;
  motivo: string;
  status: StatusConsulta;
}
export interface DadosClinica {
  pacientes: Paciente[];
  profissionais: ProfissionalGestao[];
  consultas: ConsultaGestao[];
  especialidades: Especialidade[];
  convenios: Convenio[];
}
export interface Filtro {
  busca?: string;
  status?: string;
  mostrarInativos?: boolean;
}
export const STATUS_CONSULTA: readonly StatusConsulta[] = [
  'marcada',
  'confirmada',
  'realizada',
  'falta',
  'cancelada',
];
export const TRANSICOES: Record<StatusConsulta, readonly StatusConsulta[]> = {
  marcada: ['confirmada', 'cancelada'],
  confirmada: ['realizada', 'falta', 'cancelada'],
  realizada: [],
  falta: [],
  cancelada: [],
};
export const ROTULOS_STATUS: Record<StatusConsulta, string> = {
  marcada: 'Marcada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  falta: 'Falta',
  cancelada: 'Cancelada',
};
export function normalizar(texto: unknown): string {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}
