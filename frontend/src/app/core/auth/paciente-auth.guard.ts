import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { PacienteAuthService, retornoPacienteSeguro } from './paciente-auth.service';

export const pacienteAuthGuard: CanActivateFn = (_, state) => {
  const auth = inject(PacienteAuthService);
  const router = inject(Router);
  const entrar = () =>
    router.createUrlTree(['/entrar'], {
      queryParams: { retorno: retornoPacienteSeguro(state.url) },
    });
  if (!auth.token()) return entrar();
  // Confere a conta no servidor: o perfil de demonstração no cache não libera a área.
  return auth.carregar().pipe(
    map(() => true),
    catchError(() => of(entrar())),
  );
};
