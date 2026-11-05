import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROTA_PUBLICA } from '../decorators/publico.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JWT real no guard global', () => {
  const secret = 'segredo-exclusivo-de-teste-sem-uso-na-clinica'.repeat(2);
  const jwt = new JwtService({
    secret,
    signOptions: { expiresIn: '1h', algorithm: 'HS256' },
  });
  const guard = new JwtAuthGuard(jwt, new Reflector());
  const identidade = {
    sub: '65f000000000000000000001',
    nome: 'Ana Lima',
    perfil: 'admin',
  };
  function contexto(authorization?: string) {
    const request: { headers: { authorization?: string }; usuario?: unknown } =
      { headers: { authorization } };
    const handler = () => undefined;
    class Controle {}
    return {
      request,
      handler,
      Controle,
      exec: {
        getHandler: () => handler,
        getClass: () => Controle,
        switchToHttp: () => ({ getRequest: () => request }),
      } as unknown as ExecutionContext,
    };
  }
  it('libera somente a rota marcada como pública', async () => {
    const ctx = contexto();
    Reflect.defineMetadata(ROTA_PUBLICA, true, ctx.handler);
    await expect(guard.canActivate(ctx.exec)).resolves.toBe(true);
    expect(ctx.request.usuario).toBeUndefined();
  });
  it('respeita a marcação pública no controller', async () => {
    const ctx = contexto();
    Reflect.defineMetadata(ROTA_PUBLICA, true, ctx.Controle);
    await expect(guard.canActivate(ctx.exec)).resolves.toBe(true);
  });
  it('recusa ausência de token com 401', async () => {
    await expect(guard.canActivate(contexto().exec)).rejects.toThrow(
      new UnauthorizedException('Token não informado'),
    );
  });
  for (const valor of ['Basic abc', 'Bearer', 'Bearer a b', 'abc']) {
    it(`recusa cabeçalho malformado ${valor}`, async () => {
      await expect(guard.canActivate(contexto(valor).exec)).rejects.toThrow(
        new UnauthorizedException('Token malformado'),
      );
    });
  }
  it('confere assinatura e preenche a identidade da requisição', async () => {
    const token = await jwt.signAsync(identidade);
    const ctx = contexto(`Bearer ${token}`);
    await expect(guard.canActivate(ctx.exec)).resolves.toBe(true);
    expect(ctx.request.usuario).toMatchObject(identidade);
  });
  it('recusa assinatura feita com outro segredo', async () => {
    const outro = new JwtService({
      secret: 'outro-segredo-de-teste'.repeat(3),
    });
    await expect(
      guard.canActivate(
        contexto(
          `Bearer ${await outro.signAsync(identidade, { expiresIn: '1h' })}`,
        ).exec,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('recusa token expirado', async () => {
    const token = await jwt.signAsync(identidade, { expiresIn: -1 });
    await expect(
      guard.canActivate(contexto(`Bearer ${token}`).exec),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('recusa token sem expiração mesmo com assinatura válida', async () => {
    const semPrazo = new JwtService({ secret });
    const token = await semPrazo.signAsync(identidade);
    await expect(
      guard.canActivate(contexto(`Bearer ${token}`).exec),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('recusa perfil ou ID fora do contrato', async () => {
    for (const dados of [
      { ...identidade, perfil: 'desconhecido' },
      { ...identidade, sub: '1' },
    ]) {
      const token = await jwt.signAsync(dados);
      await expect(
        guard.canActivate(contexto(`Bearer ${token}`).exec),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    }
  });
});
