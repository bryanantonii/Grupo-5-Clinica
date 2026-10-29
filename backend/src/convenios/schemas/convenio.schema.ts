import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const MODALIDADES_CONVENIO = ['individual', 'coletivo'] as const;
export type ModalidadeConvenio = (typeof MODALIDADES_CONVENIO)[number];
export type ConvenioDocument = HydratedDocument<Convenio>;

@Schema({
  collection: 'convenios',
  timestamps: true,
  strict: 'throw',
  strictQuery: 'throw',
})
export class Convenio {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 60 })
  nome: string;

  @Prop({
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'O código ANS deve conter exatamente seis dígitos.'],
  })
  codigoAns: string;

  @Prop({
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: Number.isInteger,
      message: 'A cobertura deve ser um número inteiro entre 0 e 100.',
    },
  })
  percentualCobertura: number;

  @Prop({
    trim: true,
    maxlength: 15,
    validate: {
      validator: (valor?: string) =>
        !valor || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(valor),
      message: 'Telefone inválido. Use o formato (51) 99999-9999.',
    },
  })
  telefone?: string;

  @Prop({
    type: String,
    enum: MODALIDADES_CONVENIO,
    default: 'individual',
    required: true,
  })
  modalidade: ModalidadeConvenio;

  @Prop({ type: Boolean, default: true, required: true })
  ativo: boolean;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export const ConvenioSchema = SchemaFactory.createForClass(Convenio);

ConvenioSchema.index(
  { nome: 1 },
  {
    name: 'convenios_nome_unico',
    unique: true,
    collation: { locale: 'pt', strength: 1 },
  },
);
ConvenioSchema.index(
  { codigoAns: 1 },
  { name: 'convenios_ans_unico', unique: true },
);
ConvenioSchema.index({ ativo: 1, nome: 1 }, { name: 'convenios_ativos_nome' });
