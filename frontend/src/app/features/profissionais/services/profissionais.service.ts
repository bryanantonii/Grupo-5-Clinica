import { Observable } from 'rxjs';
import { Profissional, ProfissionalEntrada } from '../profissional.model';

export interface EspecialidadeOpcao {
  _id: string;
  nome: string;
}
export interface FiltroProfissionais {
  busca?: string;
  especialidade?: string;
  todos?: boolean;
}

/** As páginas usam o contrato; app.config.ts escolhe a implementação. */
export abstract class ProfissionaisService {
  abstract listar(filtro?: FiltroProfissionais): Observable<Profissional[]>;
  abstract buscarPorId(id: string): Observable<Profissional>;
  abstract especialidades(): Observable<EspecialidadeOpcao[]>;
  abstract criar(dados: ProfissionalEntrada): Observable<Profissional>;
  abstract atualizar(id: string, dados: Partial<ProfissionalEntrada>): Observable<Profissional>;
  abstract remover(id: string): Observable<void>;
}

export class ErroProfissional extends Error {
  constructor(
    mensagem: string,
    readonly campo?: keyof ProfissionalEntrada,
  ) {
    super(mensagem);
  }
}
