export interface Especialidade {
  _id: string;
  nome: string;
  descricao: string;
  icone: string;
}
// Alias de apresentação mantido para as páginas de agendamento e início.
export type { ProfissionalCardDados as Profissional } from '../profissionais/profissional.model';

export interface PerfilPaciente {
  nome: string;
  email: string;
  telefone: string;
}
export interface Consulta {
  _id: string;
  profissional: string;
  especialidade: string;
  data: string;
  horario: string;
  convenio: string;
  paciente: PerfilPaciente;
  status: 'confirmada' | 'cancelada';
}
