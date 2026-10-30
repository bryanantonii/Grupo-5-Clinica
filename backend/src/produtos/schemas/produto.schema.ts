import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const CATEGORIAS = ['alimento', 'higiene', 'limpeza', 'outros'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type ProdutoDocument = HydratedDocument<Produto>;

// timestamps: true cria createdAt e updatedAt automaticamente (aula 08, slide 14)
@Schema({ timestamps: true, collection: 'produtos' })
export class Produto {
  @Prop({
    required: [true, 'O nome é obrigatório'],
    trim: true,
    minlength: [3, 'O nome deve ter pelo menos 3 caracteres'],
    maxlength: [80, 'O nome pode ter no máximo 80 caracteres'],
    unique: true,
  })
  nome: string;

  @Prop({ trim: true, maxlength: 300 })
  descricao?: string;

  @Prop({ required: true, min: [0, 'O preço não pode ser negativo'] })
  preco: number;

  @Prop({
    required: true,
    min: [0, 'O estoque não pode ser negativo'],
    default: 0,
  })
  estoque: number;

  // type: String é obrigatório em uniões de tipos para o Mongoose saber o tipo em tempo de execução (aula 08, slide 12)
  @Prop({
    type: String,
    required: true,
    enum: {
      values: CATEGORIAS,
      message: 'Categoria inválida: {VALUE}',
    },
  })
  categoria: Categoria;

  @Prop({ default: true })
  ativo: boolean;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);

// Índice para acelerar o filtro mais usado na listagem: ?categoria=alimento (aula 08, slide 13)
ProdutoSchema.index({ categoria: 1 });
