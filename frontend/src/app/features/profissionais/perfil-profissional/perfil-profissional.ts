import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClinoraService } from '../../clinora/clinora.service';
import { Icon } from '../../clinora/shared/icon';

@Component({
  selector: 'app-perfil-profissional',
  imports: [RouterLink, Icon],
  template: `
    <div class="container page-content">
      <a routerLink="/profissionais" class="text-link back-link"
        ><app-icon name="back" /> Voltar aos profissionais</a
      >
      @if (profissional; as p) {
        <div class="profile-heading">
          <div class="avatar avatar-large" aria-hidden="true">{{ p.iniciais }}</div>
          <div>
            <p class="eyebrow">{{ dados.especialidade(p.especialidade) }}</p>
            <h1>{{ p.nome }}</h1>
            <p>Perfil demonstrativo · {{ p.registro }}</p>
          </div>
        </div>
        <div class="profile-grid">
          <div>
            <h2>{{ p.titulo }}</h2>
            <p class="lead">{{ p.descricao }} Atendimento com escuta e orientação clara.</p>
            <div class="divider"></div>
            <h3>Sobre o atendimento</h3>
            <ul class="check-list">
              <li><app-icon name="check" /> Consulta presencial</li>
              <li><app-icon name="check" /> {{ dados.especialidade(p.especialidade) }}</li>
              <li><app-icon name="check" /> Acompanhamento e prevenção</li>
            </ul>
          </div>
          <aside class="panel mint-panel">
            <span class="icon-tile"><app-icon name="calendar" /></span>
            <h2>Vamos agendar?</h2>
            <p>Veja os horários disponíveis e escolha o melhor para você.</p>
            <a
              routerLink="/agendar"
              [queryParams]="{ especialidade: p.especialidade, profissional: p._id }"
              class="btn"
              >Ver horários <app-icon name="arrow"
            /></a>
          </aside>
        </div>
      } @else {
        <div class="empty-state">
          <h1>Profissional não encontrado.</h1>
          <p>Consulte os perfis disponíveis na nossa equipe.</p>
          <a routerLink="/profissionais" class="btn">Ver profissionais</a>
        </div>
      }
    </div>
  `,
})
export class PerfilProfissional {
  protected readonly dados = inject(ClinoraService);
  private readonly encontrado = this.dados.profissional(
    inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '',
  );
  protected readonly profissional = this.encontrado?.ativo ? this.encontrado : undefined;
}
