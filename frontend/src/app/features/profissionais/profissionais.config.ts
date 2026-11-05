import { ModuloConfig } from '../gestao/modulo-config';
import { ProfissionaisService } from './services/profissionais.service';
export const PROFISSIONAIS_CONFIG: ModuloConfig = {
  ...{
    modulo: 'profissionais',
    singular: 'profissional',
    titulo: 'Profissionais',
    artigo: 'o',
    descricao: 'Mantenha os registros e as especialidades da equipe atualizados.',
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
        nome: 'registro',
        rotulo: 'Registro profissional',
        tipo: 'text',
        obrigatorio: true,
        minLength: 4,
        maxLength: 20,
        ajuda: 'CRM, CRP ou outro conselho. O registro é salvo em maiúsculas.',
      },
      {
        nome: 'especialidade',
        rotulo: 'Especialidade',
        tipo: 'select',
        obrigatorio: true,
        referencia: 'especialidades',
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
    ],
    colunas: [
      {
        campo: 'nome',
        rotulo: 'Nome',
      },
      {
        campo: 'registro',
        rotulo: 'Registro',
      },
      {
        campo: 'especialidade',
        rotulo: 'Especialidade',
        referencia: 'especialidades',
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
        campo: 'ativo',
        rotulo: 'Situação',
        formato: 'situacao',
      },
    ],
  },
  servico: ProfissionaisService,
};
