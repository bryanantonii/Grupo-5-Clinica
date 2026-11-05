export const CATEGORIAS = ['alimento', 'higiene', 'limpeza', 'outros'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Produto como a API devolve (segue o contrato da API). */
export interface Produto {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  categoria: Categoria;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Dados enviados para criar ou editar (sem _id e datas). */
export type ProdutoEntrada = Omit<Produto, '_id' | 'ativo' | 'createdAt' | 'updatedAt'> & {
  ativo?: boolean;
};
