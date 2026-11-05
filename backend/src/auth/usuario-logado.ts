import { Request } from 'express';
import { PerfilUsuario } from '../usuarios/schemas/usuario.schema';

export interface UsuarioLogado {
  sub: string;
  nome: string;
  perfil: PerfilUsuario;
  iat: number;
  exp: number;
}

export interface RequisicaoAutenticada extends Request {
  usuario: UsuarioLogado;
}
