import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-gestao-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<section class="container c1-shell">
    <header class="c1-shell-heading">
      <div>
        <p class="eyebrow">Clinora</p>
        <h2>Gestão da clínica</h2>
      </div>
      <span class="c1-demo-badge">Gestão conectada</span>
    </header>
    <div class="c1-workspace">
      <nav class="c1-module-menu" aria-label="Módulos de gestão">
        <a
          routerLink="/gestao"
          routerLinkActive="selected"
          [routerLinkActiveOptions]="{ exact: true }"
          ariaCurrentWhenActive="page"
          >Visão geral</a
        >
        @for (modulo of modulosVisiveis(); track modulo.rota) {
          <a
            [routerLink]="['/gestao', modulo.rota]"
            routerLinkActive="selected"
            ariaCurrentWhenActive="page"
            >{{ modulo.nome }}</a
          >
        }
      </nav>
      <div class="c1-content"><router-outlet /></div>
    </div>
    @if (auth.aviso()) {
      <p class="notice" role="status">{{ auth.aviso() }}</p>
    }
  </section>`,
})
export class GestaoLayout {
  readonly auth = inject(AuthService);
  modulosVisiveis() {
    return this.modulos.filter((m) => m.rota !== 'relatorios' || this.auth.administrador());
  }
  readonly modulos = [
    { rota: 'pacientes', nome: 'Pacientes' },
    { rota: 'profissionais', nome: 'Profissionais' },
    { rota: 'consultas', nome: 'Consultas' },
    { rota: 'especialidades', nome: 'Especialidades' },
    { rota: 'convenios', nome: 'Convênios' },
    { rota: 'relatorios', nome: 'Relatórios' },
  ];
}
