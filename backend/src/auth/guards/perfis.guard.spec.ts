import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PerfisGuard } from './perfis.guard';

describe('PerfisGuard (testes que precisam passar na aula 13)', () => {
  const reflector = new Reflector();
  const guard = new PerfisGuard(reflector);

  const contexto = (usuario?: { perfil: string }): ExecutionContext =>
    ({
      getHandler: () => () => undefined,
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => ({ usuario }) }),
    }) as unknown as ExecutionContext;

  it('libera a rota quando ela não exige perfil', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(contexto({ perfil: 'atendente' }))).toBe(true);
  });

  it('libera quando o perfil do usuário está entre os exigidos', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(guard.canActivate(contexto({ perfil: 'admin' }))).toBe(true);
  });

  it('bloqueia com 403 quando o perfil não tem permissão', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(contexto({ perfil: 'atendente' }))).toThrow(
      ForbiddenException,
    );
  });
});
