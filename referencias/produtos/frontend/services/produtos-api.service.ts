import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaApi } from '../../../core/models/resposta-api';
import { Categoria, Produto, ProdutoEntrada } from '../produto.model';
import { ProdutosService } from './produtos.service';

/**
 * Serviço que conversa com a API NestJS de verdade (PDF 02, cap. 9).
 * Ativado quando environment.usarMock = false.
 */
@Injectable()
export class ProdutosApiService extends ProdutosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/produtos`;

  listar(categoria?: Categoria): Observable<Produto[]> {
    const params = categoria ? new HttpParams().set('categoria', categoria) : undefined;
    return this.http.get<RespostaApi<Produto[]>>(this.url, { params }).pipe(
      map((r) => r.dados),
      catchError(this.tratarErro),
    );
  }

  buscarPorId(id: string): Observable<Produto> {
    return this.http.get<RespostaApi<Produto>>(`${this.url}/${id}`).pipe(
      map((r) => r.dados),
      catchError(this.tratarErro),
    );
  }

  criar(dados: ProdutoEntrada): Observable<Produto> {
    return this.http.post<RespostaApi<Produto>>(this.url, dados).pipe(
      map((r) => r.dados),
      catchError(this.tratarErro),
    );
  }

  atualizar(id: string, dados: Partial<ProdutoEntrada>): Observable<Produto> {
    return this.http.patch<RespostaApi<Produto>>(`${this.url}/${id}`, dados).pipe(
      map((r) => r.dados),
      catchError(this.tratarErro),
    );
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(catchError(this.tratarErro));
  }

  /** Converte o erro HTTP em uma mensagem amigável para a tela. */
  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    let mensagem = 'Não foi possível falar com o servidor. Tente novamente.';
    const corpo = erro.error as { message?: string | string[] } | null;
    if (erro.status > 0 && corpo?.message) {
      mensagem = Array.isArray(corpo.message) ? corpo.message.join(' · ') : corpo.message;
    }
    return throwError(() => new Error(mensagem));
  }
}
