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

  async login(
    email: string,
    senha: string,
    acesso: 'equipe' | 'paciente' = 'equipe',
  ) {
    const usuario = await this.usuarios.buscarPorEmailComSenha(email);
    const confere = await bcrypt.compare(
      senha,
      usuario?.senhaHash ?? this.hashAusente,
    );
    const perfilPermitido =
      acesso === 'paciente'
        ? usuario?.perfil === 'paciente'
        : usuario?.perfil === 'admin' || usuario?.perfil === 'atendente';
    if (!usuario || !confere || usuario.ativo === false || !perfilPermitido)
      throw new UnauthorizedException('Credenciais inválidas');
    const payload = {
      sub: String(usuario._id),
      nome: usuario.nome,
      perfil: usuario.perfil,
    };
    const accessToken = usuario.versaoSessao
      ? await this.jwt.signAsync(payload, { jwtid: usuario.versaoSessao })
      : await this.jwt.signAsync(payload);
    return {
      accessToken,
      usuario: {
        _id: payload.sub,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ...(usuario.perfil === 'paciente'
          ? { telefone: usuario.telefone ?? '' }
          : {}),
      },
    };
  }
}
