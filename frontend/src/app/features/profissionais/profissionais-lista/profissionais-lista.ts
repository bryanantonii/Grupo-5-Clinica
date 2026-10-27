import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { Icon } from '../../clinora/shared/icon';
import { ProfissionalCard } from '../profissional-card/profissional-card';
import { ProfissionalCardDados } from '../profissional.model';
import { paraCartao } from '../profissionais.dados';
import { EspecialidadeOpcao, ProfissionaisService } from '../services/profissionais.service';

/** Página smart: consulta o contrato, controla estados e trata eventos do cartão. */
@Component({
  selector: 'app-profissionais-lista',
  imports: [ReactiveFormsModule, RouterLink, ProfissionalCard, Icon],
  templateUrl: './profissionais-lista.html',
})
export class ProfissionaisLista implements OnInit {
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly service = inject(ProfissionaisService);
  private readonly destruir = inject(DestroyRef);
  private requisicao?: Subscription;
  protected readonly gestao = this.rota.snapshot.data['gestao'] === true;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    busca: [''],
    especialidade: [''],
  });
  protected readonly profissionais = signal<ProfissionalCardDados[]>([]);
  protected readonly especialidades = signal<EspecialidadeOpcao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  protected readonly erroOperacao = signal('');
  protected readonly confirmacao = signal<ProfissionalCardDados | null>(null);
  protected readonly inativando = signal(false);

  ngOnInit(): void {
    const resultado = this.rota.snapshot.queryParamMap.get('resultado');
    if (resultado === 'cadastrado') this.sucesso.set('Profissional cadastrado com sucesso.');
    if (resultado === 'atualizado')
      this.sucesso.set('Dados do profissional atualizados com sucesso.');
    this.carregar();
  }

  protected nomeEspecialidade(id: string): string {
    return this.especialidades().find((e) => e._id === id)?.nome ?? id;
  }

  protected carregar(): void {
    this.requisicao?.unsubscribe();
    this.carregando.set(true);
    this.erro.set('');
    this.confirmacao.set(null);
    this.requisicao = forkJoin({
      lista: this.service.listar(this.form.getRawValue()),
      especialidades: this.service.especialidades(),
    })
      .pipe(takeUntilDestroyed(this.destruir))
      .subscribe({
        next: ({ lista, especialidades }) => {
          this.profissionais.set(lista.map(paraCartao));
          this.especialidades.set(especialidades);
          this.carregando.set(false);
        },
        error: (erro: Error) => {
          this.erro.set(erro.message || 'Não foi possível carregar os profissionais.');
          this.carregando.set(false);
        },
      });
  }

  protected abrirPerfil(profissional: ProfissionalCardDados): void {
    void this.router.navigate(['/profissionais', profissional._id]);
  }
  protected editar(profissional: ProfissionalCardDados): void {
    void this.router.navigate(['/profissionais', profissional._id, 'editar']);
  }
  protected pedirInativacao(profissional: ProfissionalCardDados): void {
    this.erroOperacao.set('');
    this.confirmacao.set(profissional);
    setTimeout(() => document.getElementById('confirmar-inativacao')?.focus());
  }
  protected confirmarInativacao(): void {
    const profissional = this.confirmacao();
    if (!profissional || this.inativando()) return;
    this.erroOperacao.set('');
    this.inativando.set(true);
    this.service
      .remover(profissional._id)
      .pipe(takeUntilDestroyed(this.destruir))
      .subscribe({
        next: () => {
          this.inativando.set(false);
          this.sucesso.set('Profissional inativado com sucesso.');
          this.carregar();
        },
        error: (erro: Error) => {
          this.inativando.set(false);
          this.erroOperacao.set(erro.message || 'Não foi possível inativar este profissional.');
        },
      });
  }
  protected buscar(): void {
    this.carregar();
  }
  protected limpar(): void {
    this.form.reset();
    this.carregar();
  }
}
