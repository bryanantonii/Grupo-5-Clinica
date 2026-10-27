import { ModuloConfig } from '../gestao/modulo-config';
import { EspecialidadesService } from './services/especialidades.service';
export const ESPECIALIDADES_CONFIG: ModuloConfig = {
  ...{
    modulo: 'especialidades',
    singular: 'especialidade',
    titulo: 'Especialidades',
    artigo: 'a',
    descricao: 'Defina os cuidados oferecidos, a duração e o valor das consultas.',
    campos: [
      {
        nome: 'nome',
        rotulo: 'Nome',
        tipo: 'text',
        obrigatorio: true,
        minLength: 3,
        maxLength: 50,
      },
      {
        nome: 'duracaoConsultaMin',
        rotulo: 'Duração da consulta em minutos',
        tipo: 'number',
        obrigatorio: true,
        min: 15,
        max: 120,
        inteiro: true,
      },
      {
        nome: 'valorParticular',
        rotulo: 'Valor particular em reais',
        tipo: 'number',
        obrigatorio: true,
        min: 0,
      },
      {
        nome: 'descricao',
        rotulo: 'Descrição',
        tipo: 'textarea',
        maxLength: 300,
      },
    ],
    colunas: [
      {
        campo: 'nome',
        rotulo: 'Nome',
      },
      {
        campo: 'duracaoConsultaMin',
        rotulo: 'Duração em minutos',
      },
      {
        campo: 'valorParticular',
        rotulo: 'Valor particular',
        formato: 'moeda',
      },
      {
        campo: 'descricao',
        rotulo: 'Descrição',
      },
      {
        campo: 'ativo',
        rotulo: 'Situação',
        formato: 'situacao',
      },
    ],
  },
  servico: EspecialidadesService,
};
