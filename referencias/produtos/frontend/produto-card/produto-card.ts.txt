import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto } from '../produto.model';

/**
 * Componente REUTILIZÁVEL: mostra um produto em formato de cartão (PDF 02, cap. 4 e 5).
 * - Recebe dados do componente pai com input()  → [produto]="p"
 * - Avisa o pai que algo aconteceu com output() → (excluir)="excluir($event)"
 * Ele não sabe de onde vêm os produtos nem como excluir: quem decide é o pai.
 */
@Component({
  selector: 'app-produto-card',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './produto-card.html',
})
export class ProdutoCard {
  /** Obrigatório: o pai SEMPRE precisa informar o produto. */
  readonly produto = input.required<Produto>();

  /** Evento que o cartão emite quando o usuário clica em "Excluir". */
  readonly excluir = output<Produto>();

  protected pedirExclusao(): void {
    this.excluir.emit(this.produto());
  }
}
