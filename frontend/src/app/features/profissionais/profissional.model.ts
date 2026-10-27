import { Referencia } from '../../core/models/referencia';

/** Contrato de Profissionais conforme o módulo B do manual da clínica. */
export interface Profissional {
  _id: string;
  nome: string;
  registro: string;
  especialidade: Referencia;
  email: string;
  telefone: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Dados que serão enviados à API ao criar ou editar um profissional. */
export interface ProfissionalEntrada {
  nome: string;
  registro: string;
  especialidade: string;
  email: string;
  telefone: string;
  ativo?: boolean;
}

/** Campos de apresentação usados pelo design Clinora além do contrato da API. */
export interface ProfissionalCardDados extends Profissional {
  especialidade: string;
  iniciais: string;
  descricao: string;
  titulo: string;
}
