import { Observable } from 'rxjs';
import { Filtro, Registro, StatusConsulta, ValorCampo } from '../gestao.models';

/** Os componentes usam este contrato. No C1 os providers apontam para os mocks. */
export abstract class GestaoService {
  abstract listar(filtro?: Filtro): Observable<Registro[]>;
  abstract buscarPorId(id: string): Observable<Registro>;
  abstract criar(dados: Record<string, ValorCampo>): Observable<Registro>;
  abstract atualizar(id: string, dados: Record<string, ValorCampo>): Observable<Registro>;
  abstract remover(id: string): Observable<void>;
  abstract mudarStatus(id: string, status: StatusConsulta): Observable<Registro>;
  abstract simularFalha(): void;
}
