import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Icon } from './shared/icon';
@Component({
  selector: 'app-resultado',
  imports: [RouterLink, Icon],
  template: `
    <section class="result-page container">
      <div class="result-icon"><app-icon [name]="pagina['icone'] ?? 'check'" /></div>
      <p class="eyebrow">{{ pagina['etiqueta'] ?? 'Tudo certo por aqui' }}</p>
      <h1>{{ pagina['titulo'] }}</h1>
      <p class="lead">{{ pagina['descricao'] }}</p>
      @if (pagina['aviso']) {
        <p class="notice"><app-icon name="info" />{{ pagina['aviso'] }}</p>
      }
      <a [routerLink]="pagina['destino']" class="btn"
        >{{ pagina['botao'] }} <app-icon name="arrow"
      /></a>
      @if (pagina['secundario']) {
        <a [routerLink]="pagina['secundario']" class="text-link result-secondary">{{
          pagina['textoSecundario']
        }}</a>
      }
    </section>
  `,
})
export class Resultado {
  protected readonly pagina = inject(ActivatedRoute).snapshot.data;
}
