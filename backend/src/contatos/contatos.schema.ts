import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema({ collection: 'contatos', timestamps: true, strict: 'throw' })
export class Contato {
  @Prop({ required: true, trim: true, minlength: 3, maxlength: 80 })
  nome: string;
  @Prop({ required: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true, trim: true, maxlength: 80 }) assunto: string;
  @Prop({ required: true, trim: true, minlength: 10, maxlength: 2000 })
  mensagem: string;
  @Prop({ type: String, enum: ['nova', 'lida'], default: 'nova' }) situacao:
    'nova' | 'lida';
}
export const ContatoSchema = SchemaFactory.createForClass(Contato);
ContatoSchema.index({ createdAt: -1 });
