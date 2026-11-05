import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProdutoCard } from '../produto-card/produto-card';
import { CATEGORIAS, Categoria, Produto } from '../produto.model';
import { ProdutosService } from '../services/produtos.service';

/** Tela de listagem (componente de página — PDF 02, cap. 4). */
@Component({
  selector: 'app-produtos-lista',
  imports: [RouterLink, CurrencyPipe, ProdutoCard],
  templateUrl: './produtos-lista.html',
})
export class ProdutosLista implements OnInit {
  private readonly produtosService = inject(ProdutosService);

  protected readonly categorias = CATEGORIAS;
  // Estado da tela com signals (PDF 02, cap. 11)
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly carregando = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly sucesso = signal<string | null>(null);
  protected readonly filtro = signal<Categoria | ''>('');
  // Estado LOCAL da tela: como mostrar a lista (aula 02 — @if e componente filho)
  protected readonly modo = signal<'tabela' | 'cartoes'>('tabela');

  ngOnInit(): void {
    this.carregar();
  }

  protected filtrar(valor: string): void {
    this.filtro.set(valor as Categoria | '');
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.produtosService.listar(this.filtro() || undefined).subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
      },
      error: (e: Error) => {
        this.erro.set(e.message);
        this.carregando.set(false);
      },
    });
  }

  protected excluir(produto: Produto): void {
    if (!confirm(`Excluir o produto "${produto.nome}"?`)) {
      return;
    }
    this.erro.set(null);
    this.sucesso.set(null);
    this.produtosService.remover(produto._id).subscribe({
      next: () => {
        this.sucesso.set(`Produto "${produto.nome}" excluído.`);
        this.carregar();
      },
      error: (e: Error) => this.erro.set(e.message),
    });
  }
}
