import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import {
  CadastroPacienteDto,
  AtualizarContaPacienteDto,
} from '../usuarios/dto/conta-paciente.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from './auth.service';
import { PerfisGuard } from './guards/perfis.guard';
import { PERFIS_KEY } from './decorators/perfis.decorator';

describe('Isolamento da conta pública', () => {
  const guard = new PerfisGuard(new Reflector());
  function contexto(perfis?: string[]) {
    const handler = () => undefined;
    if (perfis) Reflect.defineMetadata(PERFIS_KEY, perfis, handler);
    return {
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ usuario: { perfil: 'paciente' } }),
      }),
    } as unknown as ExecutionContext;
  }
  it('recusa paciente em rotas sem perfil explícito da equipe', () => {
    expect(() => guard.canActivate(contexto())).toThrow(ForbiddenException);
  });
  it('recusa paciente em rotas administrativas', () => {
    expect(() => guard.canActivate(contexto(['admin']))).toThrow(
      ForbiddenException,
    );
  });
  it('permite paciente na própria conta', () => {
    expect(guard.canActivate(contexto(['paciente']))).toBe(true);
  });
  it('não aceita perfil, ID ou status enviados no cadastro público', async () => {
    const dto = plainToInstance(CadastroPacienteDto, {
      nome: 'Paciente Teste',
      email: 'teste@example.com',
      senha: 'Senha@123',
      perfil: 'admin',
      _id: '65f000000000000000000001',
      ativo: true,
    });
    const erros = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(erros.map((e) => e.property).sort()).toEqual([
      '_id',
      'ativo',
      'perfil',
    ]);
  });
  it('recusa campos de senha, perfil e ID na edição da conta', async () => {
    const dto = plainToInstance(AtualizarContaPacienteDto, {
      nome: 'Paciente Teste',
      email: 'teste@example.com',
      senhaHash: 'injetado',
      perfil: 'admin',
      _id: '65f000000000000000000001',
    });
    expect(
      (await validate(dto, { whitelist: true, forbidNonWhitelisted: true }))
        .map((e) => e.property)
        .sort(),
    ).toEqual(['_id', 'perfil', 'senhaHash']);
  });
  it('recusa senha que excede o limite de bytes do bcrypt', async () => {
    const dto = plainToInstance(CadastroPacienteDto, {
      nome: 'Paciente Teste',
      email: 'teste@example.com',
      senha: 'á'.repeat(40),
    });
    expect((await validate(dto)).map((e) => e.property)).toContain('senha');
  });
  it.each([
    ['paciente', 'equipe'],
    ['admin', 'paciente'],
    ['atendente', 'paciente'],
  ] as const)(
    'perfil %s não autentica no acesso %s',
    async (perfil, acesso) => {
      const usuarios = {
        buscarPorEmailComSenha: jest.fn().mockResolvedValue({
          _id: '65f000000000000000000001',
          nome: 'Conta Teste',
          email: 'teste@example.com',
          perfil,
          ativo: true,
          senhaHash: await bcrypt.hash('Senha@123', 10),
        }),
      };
      const jwt = { signAsync: jest.fn() };
      const auth = new AuthService(
        usuarios as unknown as UsuariosService,
        jwt as unknown as JwtService,
      );
      await expect(
        auth.login('teste@example.com', 'Senha@123', acesso),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    },
  );
});
