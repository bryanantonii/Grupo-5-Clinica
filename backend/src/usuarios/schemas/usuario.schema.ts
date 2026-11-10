import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const PERFIS_USUARIO = ['admin', 'atendente', 'paciente'] as const;
export type PerfilUsuario = (typeof PERFIS_USUARIO)[number];
export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ collection: 'usuarios', timestamps: true, strict: 'throw' })
export class Usuario {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 80 })
  nome: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ type: String, select: false }) versaoSessao?: string;

  @Prop({ required: true, select: false })
  senhaHash: string;

  @Prop({ type: String, trim: true, maxlength: 20, default: '' })
  telefone?: string;

  @Prop({
    type: String,
    enum: PERFIS_USUARIO,
    default: 'atendente',
    required: true,
  })
  perfil: PerfilUsuario;

  @Prop({ type: Boolean, default: true, required: true })
  ativo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
UsuarioSchema.index(
  { email: 1 },
  { unique: true, name: 'usuarios_email_unico' },
);
