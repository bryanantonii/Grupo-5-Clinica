import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  // Mantém a comparação bcrypt mesmo quando o e-mail não foi encontrado.
  private readonly hashAusente = bcrypt.hashSync(
    'comparacao-de-usuario-ausente',
    10,
  );

  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.usuarios.buscarPorEmailComSenha(email);
    const confere = await bcrypt.compare(
      senha,
      usuario?.senhaHash ?? this.hashAusente,
    );
    if (!usuario || !confere || usuario.ativo === false)
      throw new UnauthorizedException('Credenciais inválidas');
    const payload = {
      sub: String(usuario._id),
      nome: usuario.nome,
      perfil: usuario.perfil,
    };
    const accessToken = await this.jwt.signAsync(payload);
    return {
      accessToken,
      usuario: {
        _id: payload.sub,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  }
}
