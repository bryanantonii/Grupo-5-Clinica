import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ collection: 'especialidades', timestamps: true, strict: 'throw' })
export class Especialidade {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 50 })
  nome: string;
  @Prop({ trim: true, maxlength: 300, default: '' }) descricao: string;
  @Prop({ required: true, min: 15, max: 120, validate: Number.isInteger })
  duracaoConsultaMin: number;
  @Prop({ required: true, min: 0 }) valorParticular: number;
  @Prop({ type: Boolean, required: true, default: true }) ativo: boolean;
}
export const EspecialidadeSchema = SchemaFactory.createForClass(Especialidade);
EspecialidadeSchema.index(
  { nome: 1 },
  {
    unique: true,
    name: 'especialidades_nome_unico',
    collation: { locale: 'pt', strength: 1 },
  },
);
