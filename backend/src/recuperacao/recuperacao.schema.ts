import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongoSchema, Types } from 'mongoose';
@Schema({ collection: 'recuperacoes', timestamps: true, strict: 'throw' })
export class Recuperacao {
  @Prop({ type: MongoSchema.Types.ObjectId, required: true, ref: 'Usuario' })
  usuario: Types.ObjectId;
  @Prop({ required: true, select: false }) tokenHash: string;
  @Prop({ type: Date, required: true }) expiraEm: Date;
  createdAt: Date;
  updatedAt: Date;
}
export const RecuperacaoSchema = SchemaFactory.createForClass(Recuperacao);
RecuperacaoSchema.index({ usuario: 1 }, { unique: true });
RecuperacaoSchema.index({ tokenHash: 1 }, { unique: true });
RecuperacaoSchema.index({ expiraEm: 1 }, { expireAfterSeconds: 0 });
