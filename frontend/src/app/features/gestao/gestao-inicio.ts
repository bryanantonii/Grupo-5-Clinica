import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RelatoriosPainel } from '../relatorios/relatorios-painel';
@Component({
  selector: 'app-gestao-inicio',
  imports: [RouterLink, RelatoriosPainel],
  template: `@if (auth.administrador()) {
      <app-relatorios-painel />
    } @else {
      <header class="c1-page-heading">
        <div>
          <p class="eyebrow">Bem-vindo à gestão</p>
          <h1>Olá, {{ auth.usuario()?.nome }}</h1>
          <p>Acompanhe a agenda e organize os cadastros da clínica.</p>
        </div>
      </header>
      <div class="c1-kpis">
        <article>
          <h2>Agenda</h2>
          <p>Consulte e atualize os atendimentos.</p>
          <a routerLink="/gestao/consultas">Abrir consultas →</a>
        </article>
        <article>
          <h2>Pacientes</h2>
          <p>Consulte contatos e convênios.</p>
          <a routerLink="/gestao/pacientes">Abrir pacientes →</a>
        </article>
        <article>
          <h2>Equipe</h2>
          <p>Acompanhe os profissionais da clínica.</p>
          <a routerLink="/gestao/profissionais">Abrir profissionais →</a>
        </article>
      </div>
    }`,
})
export class GestaoInicio {
  readonly auth = inject(AuthService);
}
