import { ModuloConfig } from '../gestao/modulo-config';
import { ConveniosService } from './services/convenios.service';
export const CONVENIOS_CONFIG: ModuloConfig = {
  ...{
    modulo: 'convenios',
    singular: 'convênio',
    titulo: 'Convênios',
    artigo: 'o',
    descricao: 'Consulte os planos e mantenha as condições de cobertura atualizadas.',
    campos: [
      {
        nome: 'nome',
        rotulo: 'Nome',
        tipo: 'text',
        obrigatorio: true,
        minLength: 3,
        maxLength: 60,
      },
      {
        nome: 'codigoAns',
        rotulo: 'Código ANS',
        tipo: 'text',
        obrigatorio: true,
        minLength: 6,
        maxLength: 6,
        pattern: '^\\d{6}$',
        ajuda: 'Exatamente 6 dígitos, preservando zeros à esquerda.',
      },
      {
        nome: 'percentualCobertura',
        rotulo: 'Cobertura em porcentagem',
        tipo: 'number',
        obrigatorio: true,
        min: 0,
        max: 100,
        inteiro: true,
      },
      {
        nome: 'telefone',
        rotulo: 'Telefone',
        tipo: 'tel',
        obrigatorio: false,
        pattern: '^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$',
        ajuda: 'Formato: (51) 99999-9999.',
      },
    ],
    colunas: [
      {
        campo: 'nome',
        rotulo: 'Nome',
      },
      {
        campo: 'codigoAns',
        rotulo: 'Código ANS',
      },
      {
        campo: 'percentualCobertura',
        rotulo: 'Cobertura',
        formato: 'percentual',
      },
      {
        campo: 'telefone',
        rotulo: 'Telefone',
      },
      {
        campo: 'ativo',
        rotulo: 'Situação',
        formato: 'situacao',
      },
    ],
  },
  servico: ConveniosService,
};
