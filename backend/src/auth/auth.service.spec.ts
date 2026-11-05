import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from './auth.service';

describe('AuthService (testes que precisam passar na aula 12)', () => {
  let service: AuthService;
  const usuariosService = { buscarPorEmailComSenha: jest.fn() };
  const jwtService = { signAsync: jest.fn().mockResolvedValue('token-falso') };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = modulo.get(AuthService);
  });

  const usuarioNoBanco = async () => ({
    _id: '65f000000000000000000001',
    nome: 'Maria',
    email: 'maria@email.com',
    perfil: 'admin',
    senhaHash: await bcrypt.hash('Senha@123', 10),
  });

  it('devolve token e dados do usuário quando a senha confere', async () => {
    usuariosService.buscarPorEmailComSenha.mockResolvedValue(
      await usuarioNoBanco(),
    );
    const resultado = await service.login('maria@email.com', 'Senha@123');
    expect(resultado.accessToken).toBe('token-falso');
    expect(resultado.usuario).toMatchObject({ nome: 'Maria', perfil: 'admin' });
  });

  it('coloca no token só id, nome e perfil (payload mínimo)', async () => {
    usuariosService.buscarPorEmailComSenha.mockResolvedValue(
      await usuarioNoBanco(),
    );
    await service.login('maria@email.com', 'Senha@123');
    const payload = (
      jwtService.signAsync.mock.calls as unknown[][]
    )[0][0] as object;
    expect(Object.keys(payload).sort()).toEqual(['nome', 'perfil', 'sub']);
  });

  it('nunca devolve o hash da senha', async () => {
    usuariosService.buscarPorEmailComSenha.mockResolvedValue(
      await usuarioNoBanco(),
    );
    const resultado = await service.login('maria@email.com', 'Senha@123');
    expect(JSON.stringify(resultado)).not.toContain('senhaHash');
  });

  it('recusa senha errada com a mensagem genérica "Credenciais inválidas"', async () => {
    usuariosService.buscarPorEmailComSenha.mockResolvedValue(
      await usuarioNoBanco(),
    );
    await expect(service.login('maria@email.com', 'errada')).rejects.toThrow(
      new UnauthorizedException('Credenciais inválidas'),
    );
  });

  it('recusa e-mail inexistente com a MESMA mensagem (não revela se o e-mail existe)', async () => {
    usuariosService.buscarPorEmailComSenha.mockResolvedValue(null);
    await expect(service.login('ninguem@email.com', 'x')).rejects.toThrow(
      new UnauthorizedException('Credenciais inválidas'),
    );
  });
});
