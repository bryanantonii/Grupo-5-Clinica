import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService, retornoSeguro } from '../../core/auth/auth.service';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly mostrarSenha = signal(false);
  readonly expirada = this.route.snapshot.queryParamMap.has('expirada');
  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  entrar() {
    if (this.carregando()) return;
    this.form.markAllAsTouched();
    this.erro.set('');
    if (this.form.invalid) {
      this.erro.set('Informe um e-mail válido e sua senha.');
      return;
    }
    this.carregando.set(true);
    const { email, senha } = this.form.getRawValue();
    this.auth
      .login(email, senha)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          this.form.controls.senha.reset();
          void this.router.navigateByUrl(
            retornoSeguro(this.route.snapshot.queryParamMap.get('retorno')),
          );
        },
        error: (e: unknown) =>
          this.erro.set(
            e instanceof HttpErrorResponse && e.status === 401
              ? 'E-mail ou senha inválidos. Confira seus dados.'
              : 'Não foi possível entrar. Confira a conexão com a clínica e tente novamente.',
          ),
      });
  }
}
