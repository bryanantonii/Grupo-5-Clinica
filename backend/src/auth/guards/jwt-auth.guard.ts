import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERFIS_USUARIO } from '../../usuarios/schemas/usuario.schema';
import { ROTA_PUBLICA } from '../decorators/publico.decorator';
import { RequisicaoAutenticada, UsuarioLogado } from '../usuario-logado';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    if (
      this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
        contexto.getHandler(),
        contexto.getClass(),
      ])
    )
      return true;
    const request = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
    const header = request.headers.authorization;
    if (!header) throw new UnauthorizedException('Token não informado');
    const token =
      typeof header === 'string'
        ? /^Bearer ([^\s]+)$/i.exec(header)?.[1]
        : undefined;
    if (!token) throw new UnauthorizedException('Token malformado');
    try {
      const payload = await this.jwt.verifyAsync<UsuarioLogado>(token, {
        algorithms: ['HS256'],
      });
      if (
        !payload ||
        typeof payload.sub !== 'string' ||
        !/^[a-f\d]{24}$/i.test(payload.sub) ||
        typeof payload.nome !== 'string' ||
        !payload.nome.trim() ||
        !PERFIS_USUARIO.includes(payload.perfil) ||
        typeof payload.exp !== 'number' ||
        payload.exp <= Date.now() / 1000
      )
        throw new Error('Payload inválido.');
      request.usuario = {
        sub: payload.sub,
        nome: payload.nome,
        perfil: payload.perfil,
        iat: payload.iat,
        exp: payload.exp,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
