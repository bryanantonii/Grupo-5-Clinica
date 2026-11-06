import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaApi } from '../../../core/models/resposta-api';
import { Filtro, Modulo, Registro, StatusConsulta, ValorCampo } from '../gestao.models';
import { GestaoService } from './gestao.service';
export abstract class GestaoApiService extends GestaoService {
  protected abstract readonly modulo: Modulo;
  protected readonly http = inject(HttpClient);
  private falhar = false;
  protected get url() {
    return environment.apiUrl + '/' + this.modulo;
  }
  listar(filtro: Filtro = {}): Observable<Registro[]> {
    if (this.falhar) {
      this.falhar = false;
      return throwError(() => new Error('Falha simulada. Tente novamente.'));
    }
    let params = new HttpParams();
    if (filtro.busca?.trim()) params = params.set('busca', filtro.busca.trim());
    if (filtro.mostrarInativos) params = params.set('todos', 'true');
    if (filtro.status) params = params.set('status', filtro.status);
    return this.http.get<RespostaApi<Registro[]>>(this.url, { params }).pipe(
      map((r) => r.dados.map((item) => this.normalizar(item))),
      catchError(this.tratarErro),
    );
  }
  buscarPorId(id: string) {
    return this.http.get<RespostaApi<Registro>>(this.url + '/' + encodeURIComponent(id)).pipe(
      map((r) => this.normalizar(r.dados)),
      catchError(this.tratarErro),
    );
  }
  criar(dados: Record<string, ValorCampo>) {
    return this.http.post<RespostaApi<Registro>>(this.url, this.preparar(dados)).pipe(
      map((r) => this.normalizar(r.dados)),
      catchError(this.tratarErro),
    );
  }
  atualizar(id: string, dados: Record<string, ValorCampo>) {
    return this.http
      .patch<RespostaApi<Registro>>(this.url + '/' + encodeURIComponent(id), this.preparar(dados))
      .pipe(
        map((r) => this.normalizar(r.dados)),
        catchError(this.tratarErro),
      );
  }
  remover(id: string): Observable<void> {
    return this.http
      .delete<void>(this.url + '/' + encodeURIComponent(id))
      .pipe(catchError(this.tratarErro));
  }
  mudarStatus(id: string, status: StatusConsulta): Observable<Registro> {
    return this.http
      .patch<RespostaApi<Registro>>(this.url + '/' + encodeURIComponent(id) + '/status', { status })
      .pipe(
        map((r) => this.normalizar(r.dados)),
        catchError(this.tratarErro),
      );
  }
  simularFalha() {
    this.falhar = true;
  }
  protected preparar(dados: Record<string, ValorCampo>): Record<string, unknown> {
    const entrada: Record<string, unknown> = { ...dados };
    if (this.modulo === 'pacientes') entrada['convenio'] = dados['convenio'] || null;
    if (this.modulo === 'consultas' && dados['dataHora'])
      entrada['dataHora'] = new Date(String(dados['dataHora'])).toISOString();
    return entrada;
  }
  protected normalizar(item: Registro): Registro {
    return this.modulo === 'pacientes'
      ? {
          ...item,
          dataNascimento: String(item['dataNascimento']).slice(0, 10),
          convenio: typeof item['convenio'] === 'string' ? item['convenio'] : '',
        }
      : item;
  }
  protected tratarErro(erro: HttpErrorResponse): Observable<never> {
    const corpo = erro.error as { message?: string | string[] } | null;
    const mensagem =
      erro.status === 403
        ? 'Seu perfil não tem permissão para esta ação.'
        : erro.status > 0 && corpo?.message
          ? Array.isArray(corpo.message)
            ? corpo.message.join(' · ')
            : corpo.message
          : 'Não foi possível conectar à clínica. Confira se a API está disponível e tente novamente.';
    return throwError(() => new Error(mensagem));
  }
}
