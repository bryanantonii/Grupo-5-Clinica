import { ProviderToken } from '@angular/core';
import { Modulo } from './gestao.models';
import { GestaoService } from './services/gestao.service';
export interface CampoFormulario {
  nome: string;
  rotulo: string;
  tipo: 'text' | 'email' | 'tel' | 'date' | 'datetime-local' | 'number' | 'textarea' | 'select';
  obrigatorio?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  inteiro?: boolean;
  pattern?: string;
  referencia?: Modulo;
  ajuda?: string;
}
export interface Coluna {
  campo: string;
  rotulo: string;
  formato?: 'data' | 'dataHora' | 'moeda' | 'percentual' | 'situacao' | 'status';
  referencia?: Modulo;
}
export interface ModuloConfig {
  modulo: Modulo;
  titulo: string;
  singular: string;
  artigo: 'o' | 'a';
  descricao: string;
  servico: ProviderToken<GestaoService>;
  campos: CampoFormulario[];
  colunas: Coluna[];
}
