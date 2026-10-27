import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClinoraService } from '../features/clinora/clinora.service';
import { Icon } from '../features/clinora/shared/icon';
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly router = inject(Router);
  protected readonly dados = inject(ClinoraService);
  protected readonly menuAberto = signal(false);
  private readonly url = signal(this.router.url);
  protected readonly simples = computed(() =>
    /^\/(entrar|login|criar-conta|recuperar-acesso|nova-senha|confirmar-email|link-enviado|senha-atualizada|agendar|agendamento-concluido)/.test(
      this.url(),
    ),
  );
  protected readonly area = computed(() =>
    /^\/(minha-area|meus-dados|consultas|dados-atualizados|consulta-cancelada)/.test(this.url()),
  );
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.url.set(e.urlAfterRedirects);
        this.menuAberto.set(false);
      }
    });
  }
  protected pularParaConteudo(event: Event) {
    event.preventDefault();
    document.getElementById('conteudo')?.focus();
  }
  protected sair() {
    this.dados.sair();
    void this.router.navigate(['/']);
  }
}
