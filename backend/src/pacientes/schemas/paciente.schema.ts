import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongoSchema } from 'mongoose';
@Schema({ collection: 'pacientes', timestamps: true, strict: 'throw' })
export class Paciente {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Usuario' })
  usuario?: Types.ObjectId;
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 80 })
  nome: string;
  @Prop({ required: true, trim: true, lowercase: true }) email: string;
  @Prop({ required: true, trim: true }) telefone: string;
  @Prop({ required: true, type: Date }) dataNascimento: Date;
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Convenio', default: null })
  convenio: Types.ObjectId | null;
  @Prop({ required: true, type: Boolean, default: true }) ativo: boolean;
}
export const PacienteSchema = SchemaFactory.createForClass(Paciente);
PacienteSchema.index(
  { email: 1 },
  { unique: true, name: 'pacientes_email_unico' },
);

PacienteSchema.index(
  { usuario: 1 },
  {
    unique: true,
    name: 'pacientes_usuario_unico',
    partialFilterExpression: { usuario: { $type: 'objectId' } },
  },
);
