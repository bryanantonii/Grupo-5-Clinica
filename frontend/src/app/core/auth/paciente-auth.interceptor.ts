import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { requisicaoDaApi } from './auth.interceptor';
import { PacienteAuthService } from './paciente-auth.service';

export const pacienteAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (!requisicaoDaApi(req.url)) return next(req);
  const caminho = new URL(req.url, environment.apiUrl).pathname;
  const conta = new URL(environment.apiUrl).pathname + '/conta';
  if (caminho !== conta && !caminho.startsWith(conta + '/')) return next(req);
  const auth = inject(PacienteAuthService);
  const token = auth.token();
  const autenticada = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(autenticada).pipe(catchError((erro: HttpErrorResponse) => {
    if (erro.status === 401 && auth.pertenceASessao(token)) auth.sair(true);
    return throwError(() => erro);
  }));
};
