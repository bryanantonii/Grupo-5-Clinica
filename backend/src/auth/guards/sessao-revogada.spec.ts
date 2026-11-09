import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('Revogação de sessão no servidor', () => {
  const jwt = new JwtService({
    secret: 'segredo-exclusivo-deste-teste'.repeat(3),
    signOptions: { expiresIn: '1h' },
  });
  const identidade = {
    sub: '665f1c2b9a1e4b0012345680',
    nome: 'Paciente Teste',
    perfil: 'paciente',
  };
  const usuarios = { buscarEstadoSessao: jest.fn() };
  const guard = new JwtAuthGuard(
    jwt,
    new Reflector(),
    usuarios as unknown as UsuariosService,
  );
  async function contexto(versao?: string) {
    const token = await jwt.signAsync(
      identidade,
      versao ? { jwtid: versao } : {},
    );
    return {
      getHandler: () => contexto,
      getClass: () => JwtAuthGuard,
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer ' + token } }),
      }),
    } as unknown as ExecutionContext;
  }
  it('permite o JWT que corresponde à versão atual da conta', async () => {
    usuarios.buscarEstadoSessao.mockResolvedValue({
      ativo: true,
      perfil: 'paciente',
      versaoSessao: 'atual',
    });
    await expect(guard.canActivate(await contexto('atual'))).resolves.toBe(
      true,
    );
  });
  it('revoga o JWT anterior depois da recuperação de senha', async () => {
    usuarios.buscarEstadoSessao.mockResolvedValue({
      ativo: true,
      perfil: 'paciente',
      versaoSessao: 'nova',
    });
    await expect(
      guard.canActivate(await contexto('anterior')),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(guard.canActivate(await contexto())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it.each([
    null,
    { ativo: false, perfil: 'paciente' },
    { ativo: true, perfil: 'atendente' },
  ])(
    'recusa conta inexistente, inativa ou com perfil alterado: %j',
    async (estado) => {
      usuarios.buscarEstadoSessao.mockResolvedValue(estado);
      await expect(guard.canActivate(await contexto())).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    },
  );
});
