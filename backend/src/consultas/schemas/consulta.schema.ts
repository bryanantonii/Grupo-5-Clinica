import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongoSchema, Types } from 'mongoose';
export const STATUS = [
  'marcada',
  'confirmada',
  'realizada',
  'falta',
  'cancelada',
] as const;
export type Status = (typeof STATUS)[number];
export const TRANSICOES: Record<Status, readonly Status[]> = {
  marcada: ['confirmada', 'cancelada'],
  confirmada: ['realizada', 'falta', 'cancelada'],
  realizada: [],
  falta: [],
  cancelada: [],
};
@Schema({ collection: 'consultas', timestamps: true, strict: 'throw' })
export class Consulta {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Especialidade' })
  especialidade?: Types.ObjectId;
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Convenio' })
  convenio?: Types.ObjectId | null;
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Paciente', required: true })
  paciente: Types.ObjectId;
  @Prop({
    type: MongoSchema.Types.ObjectId,
    ref: 'Profissional',
    required: true,
  })
  profissional: Types.ObjectId;
  @Prop({ type: Date, required: true }) dataHora: Date;
  @Prop({ trim: true, maxlength: 300, default: '' }) motivo: string;
  @Prop({ type: String, enum: STATUS, required: true, default: 'marcada' })
  status: Status;
}
export const ConsultaSchema = SchemaFactory.createForClass(Consulta);
ConsultaSchema.index(
  { profissional: 1, dataHora: 1 },
  {
    name: 'consultas_horario_unico',
    unique: true,
    partialFilterExpression: {
      status: { $in: ['marcada', 'confirmada', 'realizada', 'falta'] },
    },
  },
);
ConsultaSchema.index({ status: 1, dataHora: 1 });
