import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { PacienteAuthService } from '../../core/auth/paciente-auth.service';
import { mensagemDaApi } from '../../shared/erros-api';
import { ClinoraService } from './clinora.service';
import { Consulta, ROTULOS_CONSULTA } from './clinora.models';
import { Icon } from './shared/icon';
@Component({
  selector: 'app-area-paciente',
  imports: [RouterLink, Icon, ReactiveFormsModule, DatePipe],
  templateUrl: './area-paciente.html',
})
export class AreaPaciente implements OnDestroy {
  protected readonly dados = inject(ClinoraService);
  private readonly auth = inject(PacienteAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly modo: string = this.route.snapshot.data['modo'] ?? 'area';
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly primeiroNome = computed(() => this.auth.usuario()?.nome.split(' ')[0] ?? '');
  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly consulta = computed(() => this.dados.consulta(this.id));
  protected readonly rotulos = ROTULOS_CONSULTA;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: [
      this.auth.usuario()?.nome ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    ],
    email: [this.auth.usuario()?.email ?? '', [Validators.required, Validators.email]],
    telefone: [
      this.auth.usuario()?.telefone ?? '',
      Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/),
    ],
  });
  private readonly atividades = new Subscription();
  constructor() {
    this.carregar();
  }
  protected carregar() {
    if (this.modo === 'dados') return;
    if (this.modo === 'area') this.atividades.add(this.dados.carregarConsultas().subscribe());
    else this.atividades.add(this.dados.carregarConsulta(this.id).subscribe());
  }
  protected invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
  protected podeCancelar(c: Consulta) {
    return ['marcada', 'confirmada'].includes(c.status) && Date.parse(c.dataHora) > Date.now();
  }
  protected salvar() {
    if (this.salvando()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.erro.set('');
    this.atividades.add(
      this.auth
        .atualizar(this.form.getRawValue())
        .pipe(finalize(() => this.salvando.set(false)))
        .subscribe({
          next: () => void this.router.navigate(['/dados-atualizados']),
          error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
        }),
    );
  }
  protected cancelar(id: string) {
    if (this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');
    this.atividades.add(
      this.dados
        .cancelar(id)
        .pipe(finalize(() => this.salvando.set(false)))
        .subscribe({
          next: () => void this.router.navigate(['/consulta-cancelada']),
          error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
        }),
    );
  }
  ngOnDestroy() {
    this.atividades.unsubscribe();
  }
}
