/**
 * Popula o banco com dados de exemplo.
 * Uso: npm run seed
 * Cada aluno acrescenta aqui os dados do seu módulo (aula 08).
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Produto as ProdutoEntidade,
  ProdutoSchema,
} from '../produtos/schemas/produto.schema';
import { Convenio, ConvenioSchema } from '../convenios/schemas/convenio.schema';
import { CONVENIOS_EXEMPLO } from '../convenios/seed/convenios.dados';
import { inserirExemplos } from './inserir-exemplos';

const produtos: Partial<ProdutoEntidade>[] = [
  {
    nome: 'Arroz integral 1 kg',
    preco: 8.9,
    estoque: 25,
    categoria: 'alimento',
  },
  { nome: 'Feijão preto 1 kg', preco: 7.5, estoque: 40, categoria: 'alimento' },
  { nome: 'Sabonete neutro', preco: 2.99, estoque: 60, categoria: 'higiene' },
  { nome: 'Detergente 500 ml', preco: 3.49, estoque: 0, categoria: 'limpeza' },
  { nome: 'Pilha AA (par)', preco: 12.0, estoque: 15, categoria: 'outros' },
];

async function seed() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/projeto-integrador';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log(`Banco: ${mongoose.connection.name}`);
    const Produto = mongoose.model('Produto', ProdutoSchema, 'produtos');
    const ConvenioModel = mongoose.model(Convenio.name, ConvenioSchema);
    const resultadoProdutos = await inserirExemplos(Produto, produtos, 'nome');
    const resultadoConvenios = await inserirExemplos(
      ConvenioModel,
      CONVENIOS_EXEMPLO,
      'codigoAns',
    );
    console.log('Produtos:', resultadoProdutos);
    console.log('Convênios:', resultadoConvenios);
    console.log(`Total de convênios: ${await ConvenioModel.countDocuments()}`);
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((erro: unknown) => {
  const nome = erro instanceof Error ? erro.name : 'Erro desconhecido';
  console.error(`Falha no seed (${nome}). Confira conexão, dados e índices.`);
  process.exitCode = 1;
});
