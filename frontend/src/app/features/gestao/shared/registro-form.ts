import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, CanDeactivateFn, Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { CampoFormulario, ModuloConfig } from '../modulo-config';
import { ClinicaMockStore } from '../services/clinica-mock.store';

const nomeValido: ValidatorFn = (c) =>
  typeof c.value === 'string' && !c.value.trim() ? { required: true } : null;
const nascimentoValido: ValidatorFn = (c) => {
  const d = new Date(`${c.value}T12:00:00`);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  return c.value && (!Number.isFinite(d.getTime()) || d > hoje) ? { nascimento: true } : null;
};
const expedienteValido: ValidatorFn = (c) => {
  if (!c.value) return null;
  const d = new Date(c.value);
  return !Number.isFinite(d.getTime()) ||
    d.getTime() <= Date.now() ||
    [0, 6].includes(d.getDay()) ||
    d.getHours() < 8 ||
    d.getHours() >= 18
    ? { expediente: true }
    : null;
};

@Component({
  selector: 'app-registro-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro-form.html',
})
export class RegistroForm implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly config = this.route.snapshot.data['config'] as ModuloConfig;
  readonly id = this.route.snapshot.paramMap.get('id');
  private readonly servico = inject(this.config.servico);
  readonly store = inject(ClinicaMockStore);
  readonly carregando = signal(!!this.id);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly encontrado = signal(!this.id);
  private salvo = false;
  readonly form = new FormGroup(this.controles());
  private leitura?: Subscription;
  private operacao?: Subscription;
  private controles(): Record<string, FormControl<string | number>> {
    return Object.fromEntries(
      this.config.campos.map((c) => {
        const validacoes: ValidatorFn[] = [];
        if (c.obrigatorio) validacoes.push(Validators.required, nomeValido);
        if (c.minLength) validacoes.push(Validators.minLength(c.minLength));
        if (c.maxLength) validacoes.push(Validators.maxLength(c.maxLength));
        if (c.min != null) validacoes.push(Validators.min(c.min));
        if (c.max != null) validacoes.push(Validators.max(c.max));
        if (c.tipo === 'email') validacoes.push(Validators.email);
        if (c.pattern) validacoes.push(Validators.pattern(c.pattern));
        if (c.inteiro) validacoes.push(Validators.pattern(/^\d+$/));
        if (c.nome === 'dataNascimento') validacoes.push(nascimentoValido);
        if (c.nome === 'dataHora') validacoes.push(expedienteValido);
        return [
          c.nome,
          new FormControl<string | number>('', { nonNullable: true, validators: validacoes }),
        ];
      }),
    );
  }
  ngOnInit() {
    if (this.id) this.carregar();
  }
  carregar() {
    if (!this.id) return;
    this.carregando.set(true);
    this.erro.set('');
    this.leitura = this.servico
      .buscarPorId(this.id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (item) => {
          if (
            this.config.modulo === 'consultas' &&
            !['marcada', 'confirmada'].includes(String(item['status']))
          ) {
            this.erro.set('Consultas encerradas não podem ser editadas.');
            this.encontrado.set(false);
            return;
          }
          for (const campo of this.config.campos) {
            let valor = item[campo.nome];
            if (campo.tipo === 'datetime-local' && typeof valor === 'string') {
              const d = new Date(valor);
              valor = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            }
            this.form.controls[campo.nome].setValue(
              typeof valor === 'number' || typeof valor === 'string' ? valor : '',
            );
          }
          this.encontrado.set(true);
          this.form.markAsPristine();
        },
        error: (e: Error) => {
          this.erro.set(e.message);
          this.encontrado.set(false);
        },
      });
  }
  invalido(campo: CampoFormulario) {
    const c = this.form.controls[campo.nome];
    return c.invalid && c.touched;
  }
  mensagem(campo: CampoFormulario) {
    const c: AbstractControl = this.form.controls[campo.nome];
    if (c.hasError('required')) return `${campo.rotulo} é obrigatório.`;
    if (c.hasError('email')) return 'Informe um e-mail válido.';
    if (c.hasError('minlength')) return `Use pelo menos ${campo.minLength} caracteres.`;
    if (c.hasError('maxlength')) return `Use até ${campo.maxLength} caracteres.`;
    if (c.hasError('min') || c.hasError('max'))
      return `Informe um valor entre ${campo.min ?? 0} e ${campo.max ?? 'o limite permitido'}.`;
    if (c.hasError('nascimento')) return 'A data de nascimento não pode estar no futuro.';
    if (c.hasError('expediente')) return 'Escolha um dia útil no futuro, entre 8h e 18h.';
    if (campo.nome === 'codigoAns') return 'Informe exatamente 6 dígitos.';
    if (campo.tipo === 'tel') return 'Informe um telefone com DDD, como (51) 99999-9999.';
    return campo.inteiro ? 'Informe um número inteiro.' : 'Confira o formato do campo.';
  }
  opcoes(campo: CampoFormulario) {
    return campo.referencia
      ? this.store.referencias(campo.referencia, String(this.form.controls[campo.nome].value))
      : [];
  }
  salvar() {
    if (this.salvando() || !this.encontrado()) return;
    this.form.markAllAsTouched();
    this.erro.set('');
    if (this.form.invalid) {
      this.erro.set('Confira os campos destacados antes de salvar.');
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    this.salvando.set(true);
    const dados = this.form.getRawValue();
    const operacao = this.id ? this.servico.atualizar(this.id, dados) : this.servico.criar(dados);
    this.operacao = operacao.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.salvo = true;
        this.form.markAsPristine();
        void this.router.navigate(['/gestao', this.config.modulo], {
          state: {
            sucesso: `${this.config.singular[0].toUpperCase() + this.config.singular.slice(1)} ${this.id ? 'atualizad' : 'cadastrad'}${this.config.artigo} com sucesso.`,
          },
        });
      },
      error: (e: Error) => this.erro.set(e.message),
    });
  }
  podeSair() {
    return (
      this.salvo ||
      !this.form.dirty ||
      window.confirm('Há alterações não salvas. Deseja sair e descartá-las?')
    );
  }
  ngOnDestroy() {
    this.leitura?.unsubscribe();
    this.operacao?.unsubscribe();
  }
}
export const alteracoesPendentes: CanDeactivateFn<RegistroForm> = (componente) =>
  componente.podeSair();
