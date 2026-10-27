import { Component, input, output } from '@angular/core';
import { ProfissionalCardDados } from '../profissional.model';
import { Icon } from '../../clinora/shared/icon';

/** Componente de apresentação: recebe os dados e avisa o pai sobre a ação. */
@Component({
  selector: 'app-profissional-card',
  imports: [Icon],
  templateUrl: './profissional-card.html',
  styleUrl: './profissional-card.css',
})
export class ProfissionalCard {
  readonly profissional = input.required<ProfissionalCardDados>();
  readonly nomeEspecialidade = input.required<string>();
  readonly conhecer = output<ProfissionalCardDados>();
  readonly gerenciar = input(false);
  readonly ocupado = input(false);
  readonly editar = output<ProfissionalCardDados>();
  readonly inativar = output<ProfissionalCardDados>();

  protected pedirPerfil(): void {
    this.conhecer.emit(this.profissional());
  }
}
