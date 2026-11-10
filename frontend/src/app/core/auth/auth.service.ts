import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespostaApi } from '../models/resposta-api';
export type Perfil = 'admin' | 'atendente';
export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}
export interface Sessao {
  accessToken: string;
  usuario: Usuario;
}
const CHAVE = 'clinora.auth.v1';
export function retornoSeguro(url: string | null): string {
  const interno =
    url && (url === '/gestao' || url.startsWith('/gestao/') || url.startsWith('/gestao?'));
  return interno && !url.includes(String.fromCharCode(92)) ? url : '/gestao';
}
export function tokenVigente(token: string): { sub: string; perfil: Perfil } | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const base = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')));
    return typeof payload.sub === 'string' &&
      /^[a-f\d]{24}$/i.test(payload.sub) &&
      ['admin', 'atendente'].includes(payload.perfil) &&
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now()
      ? payload
      : null;
  } catch {
    return null;
  }
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessao = signal<Sessao | null>(this.restaurar());
  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly administrador = computed(() => this.usuario()?.perfil === 'admin');
  readonly aviso = signal('');
  token(): string | null {
    const atual = this.sessao();
    return atual && tokenVigente(atual.accessToken) ? atual.accessToken : null;
  }
  estaAutenticado(): boolean {
    return !!this.token();
  }
  pertenceASessao(token: string | null): boolean {
    return this.sessao()?.accessToken === token || (!token && !this.token());
  }
  login(email: string, senha: string) {
    return this.http
      .post<RespostaApi<Sessao>>(environment.apiUrl + '/auth/login', {
        email: email.trim().toLowerCase(),
        senha,
      })
      .pipe(
        tap(({ dados }) => {
          const identidade = tokenVigente(dados.accessToken);
          if (
            !identidade ||
            identidade.sub !== dados.usuario._id ||
            identidade.perfil !== dados.usuario.perfil
          )
            throw new Error('A API retornou uma sessão inválida.');
          this.sessao.set(dados);
          this.aviso.set('');
          try {
            sessionStorage.setItem(CHAVE, JSON.stringify(dados));
          } catch {
            this.aviso.set('A sessão será mantida somente enquanto esta página estiver aberta.');
          }
        }),
      );
  }
  logout(expirada = false) {
    this.sessao.set(null);
    try {
      sessionStorage.removeItem(CHAVE);
    } catch {
      /* A sessão em memória já foi encerrada. */
    }
    void this.router.navigate(['/login'], {
      queryParams: expirada ? { expirada: 1, retorno: retornoSeguro(this.router.url) } : {},
    });
  }
  private restaurar(): Sessao | null {
    try {
      const valor = sessionStorage.getItem(CHAVE);
      if (!valor) return null;
      const dados = JSON.parse(valor) as Sessao;
      const identidade = tokenVigente(dados.accessToken);
      if (
        identidade &&
        dados.usuario &&
        dados.usuario._id === identidade.sub &&
        dados.usuario.perfil === identidade.perfil &&
        typeof dados.usuario.nome === 'string'
      )
        return dados;
      sessionStorage.removeItem(CHAVE);
    } catch {
      /* Conteúdo inválido ou armazenamento indisponível não autentica. */
    }
    return null;
  }
}
