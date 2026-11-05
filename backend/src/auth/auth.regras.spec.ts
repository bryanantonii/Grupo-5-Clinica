import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from './auth.service';

it('não autentica um usuário inativo mesmo com a senha correta', async () => {
  const usuarios = {
    buscarPorEmailComSenha: jest.fn().mockResolvedValue({
      _id: '65f000000000000000000001',
      nome: 'Ana',
      email: 'ana@example.com',
      perfil: 'atendente',
      ativo: false,
      senhaHash: await bcrypt.hash('Senha@123', 10),
    }),
  };
  const jwt = { signAsync: jest.fn() };
  const auth = new AuthService(
    usuarios as unknown as UsuariosService,
    jwt as unknown as JwtService,
  );
  await expect(auth.login('ana@example.com', 'Senha@123')).rejects.toThrow(
    new UnauthorizedException('Credenciais inválidas'),
  );
  expect(jwt.signAsync).not.toHaveBeenCalled();
});
