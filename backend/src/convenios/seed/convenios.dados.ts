import { Convenio } from '../schemas/convenio.schema';

export const CONVENIOS_EXEMPLO: ReadonlyArray<
  Pick<Convenio, 'nome' | 'codigoAns' | 'percentualCobertura'> &
    Partial<Pick<Convenio, 'telefone' | 'modalidade' | 'ativo'>>
> = [
  {
    nome: 'Saúde Mais',
    codigoAns: '123456',
    percentualCobertura: 80,
    telefone: '(51) 90000-0101',
  },
  {
    nome: 'Vida Plena',
    codigoAns: '234567',
    percentualCobertura: 70,
    telefone: '(51) 90000-0102',
    modalidade: 'coletivo',
  },
  {
    nome: 'Bem Cuidar',
    codigoAns: '345678',
    percentualCobertura: 100,
    telefone: '(51) 90000-0103',
  },
  {
    nome: 'Proteção Familiar',
    codigoAns: '045678',
    percentualCobertura: 50,
    modalidade: 'coletivo',
  },
  {
    nome: 'Horizonte Saúde',
    codigoAns: '567890',
    percentualCobertura: 0,
    ativo: false,
  },
];
