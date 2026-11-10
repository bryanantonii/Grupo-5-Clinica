import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
export function requisicaoDaApi(url: string): boolean {
  try {
    const base = new URL(environment.apiUrl);
    const destino = new URL(url, base);
    return (
      destino.origin === base.origin &&
      (destino.pathname === base.pathname || destino.pathname.startsWith(base.pathname + '/'))
    );
  } catch {
    return false;
  }
}
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!requisicaoDaApi(req.url)) return next(req);
  const caminho = new URL(req.url, environment.apiUrl).pathname;
  const conta = new URL(environment.apiUrl).pathname + '/conta';
  if (caminho === conta || caminho.startsWith(conta + '/')) return next(req);
  const auth = inject(AuthService);
  const login =
    /\/auth\/(login|login-paciente|cadastro-paciente|recuperar-acesso|redefinir-senha)$/.test(
      caminho,
    );
  const publico =
    new URL(req.url, environment.apiUrl).pathname.includes('/catalogo/') ||
    (req.method === 'POST' && /\/contatos$/.test(caminho));
  const token = login || publico ? null : auth.token();
  const autenticada = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(autenticada).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401 && !login && !publico && auth.pertenceASessao(token))
        auth.logout(true);
      return throwError(() => erro);
    }),
  );
};
