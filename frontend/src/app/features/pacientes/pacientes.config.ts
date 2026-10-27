import { ModuloConfig } from '../gestao/modulo-config';
import { PacientesService } from './services/pacientes.service';
export const PACIENTES_CONFIG: ModuloConfig = {
  ...{
    modulo: 'pacientes',
    singular: 'paciente',
    titulo: 'Pacientes',
    artigo: 'o',
    descricao: 'Organize os contatos, convênios e dados dos pacientes.',
    campos: [
      {
        nome: 'nome',
        rotulo: 'Nome',
        tipo: 'text',
        obrigatorio: true,
        minLength: 3,
        maxLength: 80,
      },
      {
        nome: 'email',
        rotulo: 'E-mail',
        tipo: 'email',
        obrigatorio: true,
      },
      {
        nome: 'telefone',
        rotulo: 'Telefone',
        tipo: 'tel',
        obrigatorio: true,
        pattern: '^\\(?\\d{2}\\)?\\s?9?\\d{4}-?\\d{4}$',
        ajuda: 'Formato: (51) 99999-9999.',
      },
      {
        nome: 'dataNascimento',
        rotulo: 'Data de nascimento',
        tipo: 'date',
        obrigatorio: true,
      },
      {
        nome: 'convenio',
        rotulo: 'Convênio',
        tipo: 'select',
        referencia: 'convenios',
      },
    ],
    colunas: [
      {
        campo: 'nome',
        rotulo: 'Nome',
      },
      {
        campo: 'email',
        rotulo: 'E-mail',
      },
      {
        campo: 'telefone',
        rotulo: 'Telefone',
      },
      {
        campo: 'dataNascimento',
        rotulo: 'Nascimento',
        formato: 'data',
      },
      {
        campo: 'convenio',
        rotulo: 'Convênio',
        referencia: 'convenios',
      },
      {
        campo: 'ativo',
        rotulo: 'Situação',
        formato: 'situacao',
      },
    ],
  },
  servico: PacientesService,
};
