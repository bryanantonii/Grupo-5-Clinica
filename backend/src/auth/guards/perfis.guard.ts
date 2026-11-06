import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY, Perfil } from '../decorators/perfis.decorator';
import { RequisicaoAutenticada } from '../usuario-logado';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(contexto: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Perfil[]>(PERFIS_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!exigidos?.length) return true;
    const { usuario } = contexto
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();
    if (!usuario || !exigidos.includes(usuario.perfil))
      throw new ForbiddenException(
        'Seu perfil não tem permissão para esta ação',
      );
    return true;
  }
}
