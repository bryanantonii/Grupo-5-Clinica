import { SetMetadata } from '@nestjs/common';
import { PerfilUsuario } from '../../usuarios/schemas/usuario.schema';
export type Perfil = PerfilUsuario;
export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);
