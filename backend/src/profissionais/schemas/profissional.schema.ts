import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongoSchema } from 'mongoose';

export type ProfissionalDocument = HydratedDocument<Profissional>;

@Schema({ timestamps: true, collection: 'profissionais' })
export class Profissional {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 80 })
  nome: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    minlength: 4,
    maxlength: 20,
    unique: true,
  })
  registro: string;

  @Prop({ type: MongoSchema.Types.ObjectId, required: true })
  especialidade: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  @Prop({ required: true, trim: true, match: /^\(\d{2}\) \d{4,5}-\d{4}$/ })
  telefone: string;

  @Prop({ default: true })
  ativo: boolean;
}

export const ProfissionalSchema = SchemaFactory.createForClass(Profissional);
ProfissionalSchema.index({ especialidade: 1, ativo: 1 });
