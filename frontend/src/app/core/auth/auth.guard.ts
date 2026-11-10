import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthService).estaAutenticado() ||
  inject(Router).createUrlTree(['/login'], { queryParams: { retorno: state.url } });
export const perfilGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const perfis = route.data['perfis'] as string[] | undefined;
  return (
    !perfis?.length ||
    perfis.includes(auth.usuario()?.perfil ?? '') ||
    inject(Router).createUrlTree(['/sem-permissao'])
  );
};
