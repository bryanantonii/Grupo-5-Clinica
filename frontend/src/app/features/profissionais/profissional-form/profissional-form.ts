import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { idDe } from '../../../core/models/referencia';
import { Icon } from '../../clinora/shared/icon';
import {
  ErroProfissional,
  EspecialidadeOpcao,
  ProfissionaisService,
} from '../services/profissionais.service';
import { criarFormularioProfissional } from './profissional.validadores';

@Component({
  selector: 'app-profissional-form',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  templateUrl: './profissional-form.html',
})
export class ProfissionalForm {
  readonly id = input<string>();
  private readonly service = inject(ProfissionaisService);
  private readonly router = inject(Router);
  private readonly destruir = inject(DestroyRef);
  private readonly formulario = viewChild<ElementRef<HTMLFormElement>>('formulario');
  private carregamento?: Subscription;
  protected readonly especialidades = signal<EspecialidadeOpcao[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erroCarregamento = signal('');
  protected readonly erro = signal('');
  protected readonly form = criarFormularioProfissional(inject(FormBuilder), () =>
    this.especialidades(),
  );

  constructor() {
    effect(() => this.carregar(this.id()));
  }

  protected recarregar(): void {
    this.carregar(this.id());
  }

  private carregar(id?: string): void {
    this.carregamento?.unsubscribe();
    this.carregando.set(true);
    this.erroCarregamento.set('');
    this.erro.set('');
    this.form.reset();
    this.carregamento = forkJoin({
      especialidades: this.service.especialidades(),
      profissional: id ? this.service.buscarPorId(id) : of(null),
    })
      .pipe(takeUntilDestroyed(this.destruir))
      .subscribe({
        next: ({ especialidades, profissional }) => {
          this.especialidades.set(especialidades);
          this.form.reset(
            profissional
              ? {
                  nome: profissional.nome,
                  registro: profissional.registro,
                  especialidade: idDe(profissional.especialidade),
                  email: profissional.email,
                  telefone: profissional.telefone,
                }
              : undefined,
          );
          this.form.controls.especialidade.updateValueAndValidity();
          this.carregando.set(false);
        },
        error: (erro: Error) => {
          this.erroCarregamento.set(erro.message || 'Não foi possível carregar o formulário.');
          this.carregando.set(false);
        },
      });
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && control.touched;
  }

  protected mensagem(campo: keyof typeof this.form.controls): string {
    const control = this.form.controls[campo];
    if (control.hasError('servidor')) return String(control.getError('servidor'));
    if (control.hasError('required')) return 'Este campo é obrigatório.';
    switch (campo) {
      case 'nome':
        return 'Informe um nome entre 3 e 80 caracteres, sem contar espaços nas bordas.';
      case 'registro':
        return 'Informe um registro entre 4 e 20 caracteres.';
      case 'especialidade':
        return 'Selecione uma especialidade disponível.';
      case 'email':
        return 'Informe um e-mail válido.';
      case 'telefone':
        return 'Use o formato (51) 99999-9999 ou (51) 9999-9999.';
    }
  }

  protected normalizar(campo: keyof typeof this.form.controls): void {
    const control = this.form.controls[campo];
    const texto = control.value.trim();
    if (
      control.value !==
      (campo === 'registro' ? texto.toUpperCase() : campo === 'email' ? texto.toLowerCase() : texto)
    )
      control.setValue(
        campo === 'registro'
          ? texto.toUpperCase()
          : campo === 'email'
            ? texto.toLowerCase()
            : texto,
      );
  }

  protected salvar(): void {
    if (this.salvando() || this.carregando() || this.erroCarregamento()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid || this.form.pending) {
      const campo = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[]).find(
        (nome) => this.form.controls[nome].invalid,
      );
      if (campo) this.focar(campo);
      return;
    }
    this.erro.set('');
    this.salvando.set(true);
    const dados = this.form.getRawValue();
    const id = this.id();
    const operacao = id ? this.service.atualizar(id, dados) : this.service.criar(dados);
    operacao.pipe(takeUntilDestroyed(this.destruir)).subscribe({
      next: () => {
        void this.router.navigate(['/profissionais/gerenciar'], {
          queryParams: { resultado: id ? 'atualizado' : 'cadastrado' },
        });
      },
      error: (erro: Error) => {
        this.salvando.set(false);
        this.erro.set(erro.message || 'Não foi possível salvar. Tente novamente.');
        if (erro instanceof ErroProfissional && erro.campo && this.form.contains(erro.campo)) {
          this.form.get(erro.campo)?.setErrors({ servidor: erro.message });
          this.form.get(erro.campo)?.markAsTouched();
          this.focar(erro.campo);
        }
      },
    });
  }

  private focar(campo: string): void {
    // Aguarda a renderização retirar o disabled do fieldset antes de focar.
    setTimeout(() =>
      this.formulario()
        ?.nativeElement.querySelector<HTMLElement>('[formcontrolname="' + campo + '"]')
        ?.focus(),
    );
  }
}
