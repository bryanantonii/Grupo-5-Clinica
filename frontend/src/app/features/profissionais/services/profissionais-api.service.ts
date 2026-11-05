import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaApi } from '../../../core/models/resposta-api';
import { Filtro, Registro, StatusConsulta, ValorCampo } from '../../gestao/gestao.models';
import { Profissional } from '../profissional.model';
import { ProfissionaisService } from './profissionais.service';

@Injectable()
export class ProfissionaisApiService extends ProfissionaisService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/profissionais';
  private falhar = false;

  listar(filtro: Filtro = {}): Observable<Registro[]> {
    if (this.falhar) {
      this.falhar = false;
      return throwError(() => new Error('Falha simulada. Tente carregar novamente.'));
    }
    let params = new HttpParams();
    if (filtro.busca?.trim()) params = params.set('busca', filtro.busca.trim());
    if (filtro.mostrarInativos) params = params.set('todos', 'true');
    return this.http.get<RespostaApi<Profissional[]>>(this.url, { params }).pipe(
      map((r) => r.dados.map((p) => this.registro(p))),
      catchError(this.tratarErro),
    );
  }
  buscarPorId(id: string): Observable<Registro> {
    return this.http.get<RespostaApi<Profissional>>(this.url + '/' + encodeURIComponent(id)).pipe(
      map((r) => this.registro(r.dados)),
      catchError(this.tratarErro),
    );
  }
  criar(dados: Record<string, ValorCampo>): Observable<Registro> {
    return this.http.post<RespostaApi<Profissional>>(this.url, dados).pipe(
      map((r) => this.registro(r.dados)),
      catchError(this.tratarErro),
    );
  }
  atualizar(id: string, dados: Record<string, ValorCampo>): Observable<Registro> {
    return this.http
      .patch<RespostaApi<Profissional>>(this.url + '/' + encodeURIComponent(id), dados)
      .pipe(
        map((r) => this.registro(r.dados)),
        catchError(this.tratarErro),
      );
  }
  remover(id: string): Observable<void> {
    return this.http
      .delete<void>(this.url + '/' + encodeURIComponent(id))
      .pipe(catchError(this.tratarErro));
  }
  mudarStatus(_id: string, _status: StatusConsulta): Observable<Registro> {
    return throwError(
      () => new Error('Profissionais usam ativo/inativo; não possuem status de consulta.'),
    );
  }
  simularFalha(): void {
    this.falhar = true;
  }

  private registro(p: Profissional): Registro {
    return {
      _id: p._id,
      nome: p.nome,
      registro: p.registro,
      especialidade: typeof p.especialidade === 'string' ? p.especialidade : p.especialidade._id,
      nomeEspecialidade:
        typeof p.especialidade === 'string' ? undefined : String(p.especialidade['nome'] ?? ''),
      email: p.email,
      telefone: p.telefone,
      ativo: p.ativo,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    const corpo = erro.error as { message?: string | string[] } | null;
    const mensagem =
      erro.status > 0 && corpo?.message
        ? Array.isArray(corpo.message)
          ? corpo.message.join(' · ')
          : corpo.message
        : 'Não foi possível conectar à API. Confira se o servidor está disponível e tente novamente.';
    return throwError(() => new Error(mensagem));
  }
}
