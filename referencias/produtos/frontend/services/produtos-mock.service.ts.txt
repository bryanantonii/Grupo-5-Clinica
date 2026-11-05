import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Categoria, Produto, ProdutoEntrada } from '../produto.model';
import { ProdutosService } from './produtos.service';

/**
 * Serviço MOCK: guarda os produtos em memória e simula a API,
 * inclusive o tempo de resposta e as mesmas regras de negócio.
 * Usado enquanto o back-end ainda não existe (aulas 02 a 12).
 */
@Injectable()
export class ProdutosMockService extends ProdutosService {
  private produtos: Produto[] = [
    { _id: '1', nome: 'Arroz integral 1 kg', preco: 8.9, estoque: 25, categoria: 'alimento', ativo: true },
    { _id: '2', nome: 'Feijão preto 1 kg', preco: 7.5, estoque: 40, categoria: 'alimento', ativo: true },
    { _id: '3', nome: 'Sabonete neutro', preco: 2.99, estoque: 60, categoria: 'higiene', ativo: true },
    { _id: '4', nome: 'Detergente 500 ml', preco: 3.49, estoque: 0, categoria: 'limpeza', ativo: true },
  ];
  private proximoId = 5;
  private readonly atraso = 400; // ms, para enxergar o "carregando..."

  listar(categoria?: Categoria): Observable<Produto[]> {
    const lista = categoria ? this.produtos.filter((p) => p.categoria === categoria) : this.produtos;
    return of([...lista].sort((a, b) => a.nome.localeCompare(b.nome))).pipe(delay(this.atraso));
  }

  buscarPorId(id: string): Observable<Produto> {
    const produto = this.produtos.find((p) => p._id === id);
    return produto
      ? of({ ...produto }).pipe(delay(this.atraso))
      : throwError(() => new Error(`Produto ${id} não encontrado`));
  }

  criar(dados: ProdutoEntrada): Observable<Produto> {
    if (this.produtos.some((p) => p.nome === dados.nome)) {
      return throwError(() => new Error(`Já existe um produto com o nome "${dados.nome}"`));
    }
    const novo: Produto = { ...dados, _id: String(this.proximoId++), ativo: dados.ativo ?? true };
    this.produtos.push(novo);
    return of(novo).pipe(delay(this.atraso));
  }

  atualizar(id: string, dados: Partial<ProdutoEntrada>): Observable<Produto> {
    const indice = this.produtos.findIndex((p) => p._id === id);
    if (indice < 0) {
      return throwError(() => new Error(`Produto ${id} não encontrado`));
    }
    this.produtos[indice] = { ...this.produtos[indice], ...dados };
    return of(this.produtos[indice]).pipe(delay(this.atraso));
  }

  remover(id: string): Observable<void> {
    const produto = this.produtos.find((p) => p._id === id);
    if (produto && produto.estoque > 0) {
      return throwError(
        () => new Error('Não é possível excluir um produto com estoque. Zere o estoque ou inative o produto.'),
      );
    }
    this.produtos = this.produtos.filter((p) => p._id !== id);
    return of(undefined).pipe(delay(this.atraso));
  }
}
