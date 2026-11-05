import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { Relatorio, RelatoriosService } from './relatorios.service';
@Component({
  selector: 'app-relatorios-painel',
  imports: [RouterLink],
  templateUrl: './relatorios-painel.html',
})
export class RelatoriosPainel implements OnInit, OnDestroy {
  private readonly servico = inject(RelatoriosService);
  private readonly route = inject(ActivatedRoute);
  readonly inicio = !!this.route.snapshot.data['inicio'];
  readonly relatorio = signal<Relatorio | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal('');
  private operacao?: Subscription;
  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('simularErro') === '1') this.servico.simularFalha();
    this.carregar();
  }
  carregar() {
    this.operacao?.unsubscribe();
    this.carregando.set(true);
    this.erro.set('');
    this.operacao = this.servico
      .carregar(this.route.snapshot.queryParamMap.get('cenario') === 'vazio')
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (d) => this.relatorio.set(d),
        error: (e: Error) => this.erro.set(e.message),
      });
  }
  ngOnDestroy() {
    this.operacao?.unsubscribe();
  }
}
