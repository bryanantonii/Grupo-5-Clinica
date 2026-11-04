import { Convenio } from './schemas/convenio.schema';

export type CriarConvenioEntrada = Pick<
  Convenio,
  'nome' | 'codigoAns' | 'percentualCobertura' | 'telefone'
> &
  Partial<Pick<Convenio, 'modalidade'>>;

export type AtualizarConvenioEntrada = Partial<CriarConvenioEntrada> &
  Partial<Pick<Convenio, 'ativo'>>;
