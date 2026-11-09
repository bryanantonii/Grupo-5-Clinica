import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { mensagemDaApi } from '../../shared/erros-api';
import { Icon } from './shared/icon';
import { criarFormularioAcesso } from './acesso.formulario';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { PacienteAuthService, retornoPacienteSeguro } from '../../core/auth/paciente-auth.service';
@Component({
  selector: 'app-acesso',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <div class="auth-shell">
      <aside class="auth-aside">
        <div class="auth-decoration" aria-hidden="true"><app-icon name="heart" /></div>
        <div>
          <p class="eyebrow">Sua área de cuidado</p>
          <h2>Mais perto de você,<br />em cada etapa.</h2>
          <p>Acompanhe seus agendamentos<br />e encontre o seu próximo cuidado.</p>
          <p class="privacy-note">
            <app-icon name="shield" /> Seus dados merecem cuidado e privacidade.
          </p>
        </div>
      </aside>
      <section class="auth-form-wrap">
        <div class="auth-form">
          <p class="eyebrow">Área do paciente</p>
          <h1>{{ titulo }}</h1>
          <p class="auth-subtitle">{{ subtitulo }}</p>
          <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
            @if (modo === 'cadastro') {
              <div class="field">
                <label for="nome">Nome completo *</label
                ><input
                  id="nome"
                  formControlName="nome"
                  autocomplete="name"
                  placeholder="Como podemos chamar você?"
                  [attr.aria-invalid]="invalido('nome')"
                  [attr.aria-describedby]="invalido('nome') ? 'nome-erro' : null"
                />
                @if (invalido('nome')) {
                  <span id="nome-erro" class="field-error"
                    >Informe seu nome, entre 3 e 80 caracteres.</span
                  >
                }
              </div>
            }
            @if (modo !== 'nova-senha') {
              <div class="field">
                <label for="email">E-mail *</label
                ><input
                  id="email"
                  type="email"
                  formControlName="email"
                  (blur)="normalizarEmail()"
                  autocomplete="email"
                  placeholder="voce@exemplo.com"
                  [attr.aria-invalid]="invalido('email')"
                  [attr.aria-describedby]="invalido('email') ? 'email-erro' : null"
                />
                @if (invalido('email')) {
                  <span id="email-erro" class="field-error">Informe um e-mail válido.</span>
                }
              </div>
            }
            @if (modo !== 'recuperar') {
              <div class="field">
                <label for="senha">{{ modo === 'nova-senha' ? 'Nova senha' : 'Senha' }} *</label>
                <div class="password-input">
                  <input
                    id="senha"
                    [type]="mostrar() ? 'text' : 'password'"
                    formControlName="senha"
                    [autocomplete]="modo === 'entrar' ? 'current-password' : 'new-password'"
                    placeholder="Pelo menos 8 caracteres"
                    [attr.aria-invalid]="invalido('senha')"
                    [attr.aria-describedby]="
                      invalido('senha') ? 'senha-ajuda senha-erro' : 'senha-ajuda'
                    "
                  /><button
                    type="button"
                    (click)="mostrar.set(!mostrar())"
                    [attr.aria-pressed]="mostrar()"
                  >
                    {{ mostrar() ? 'Ocultar' : 'Mostrar' }}
                  </button>
                </div>
                <span id="senha-ajuda" class="form-hint"
                  >Use uma senha de teste com pelo menos 8 caracteres e até 72 bytes.</span
                >
                @if (invalido('senha')) {
                  <span id="senha-erro" class="field-error"
                    >A senha deve ter pelo menos 8 caracteres e até 72 bytes.</span
                  >
                }
              </div>
            }
            @if (modo === 'cadastro' || modo === 'nova-senha') {
              <div class="field">
                <label for="confirmar"
                  >Confirmar {{ modo === 'nova-senha' ? 'nova senha' : 'senha' }} *</label
                ><input
                  id="confirmar"
                  [type]="mostrar() ? 'text' : 'password'"
                  formControlName="confirmar"
                  autocomplete="new-password"
                  placeholder="Digite a senha novamente"
                  [attr.aria-invalid]="
                    form.controls.confirmar.touched &&
                    (form.controls.confirmar.invalid || form.hasError('senhasDiferentes'))
                  "
                  [attr.aria-describedby]="
                    form.controls.confirmar.touched &&
                    (form.controls.confirmar.invalid || form.hasError('senhasDiferentes'))
                      ? 'confirmar-erro'
                      : null
                  "
                />
                @if (
                  form.controls.confirmar.touched &&
                  (form.controls.confirmar.invalid || form.hasError('senhasDiferentes'))
                ) {
                  <span id="confirmar-erro" class="field-error">{{
                    form.controls.confirmar.hasError('required')
                      ? 'Confirme a senha.'
                      : 'As senhas precisam ser iguais.'
                  }}</span>
                }
              </div>
            }
            @if (modo === 'entrar') {
              <div class="auth-forgot">
                <a routerLink="/recuperar-acesso" class="text-link">Esqueci minha senha</a>
              </div>
            }
            @if (modo === 'cadastro') {
              <label class="checkbox-label" for="cadastro-ciente"
                ><input id="cadastro-ciente" type="checkbox" formControlName="ciente" /><span
                  >Estou ciente de que este é um projeto acadêmico e usarei dados fictícios.</span
                ></label
              >
              @if (invalido('ciente')) {
                <p class="field-error" role="status">Confirme que usará dados fictícios.</p>
              }
            }
            <div class="demo-note" role="status">
              <app-icon name="info" />
              <p>
                {{
                  modo === 'entrar' || modo === 'cadastro'
                    ? 'Sua conta será validada pela clínica. Projeto acadêmico: use dados e senha de teste.'
                    : 'A recuperação usa um link de uso único enviado ao seu e-mail.'
                }}
              </p>
            </div>
            @if (erro()) {
              <p class="field-error" role="alert">{{ erro() }}</p>
            }
            @if (auth.aviso()) {
              <p class="notice" role="status">{{ auth.aviso() }}</p>
            }
            <button
              type="submit"
              class="btn full-width"
              [attr.aria-busy]="salvando()"
              [disabled]="form.invalid || form.pending || salvando()"
            >
              {{ salvando() ? 'Aguarde…' : botao }} <app-icon name="arrow" />
            </button>
          </form>
          @if (modo === 'entrar') {
            <a
              routerLink="/criar-conta"
              [queryParams]="{ retorno: retorno }"
              class="text-link auth-switch"
              >Ainda não tenho conta. Criar conta</a
            >
            <div class="divider"></div>
            <p>Só precisa de uma consulta?</p>
            <a routerLink="/agendar" class="text-link"
              >Consultar horários e agendar <app-icon name="arrow"
            /></a>
          } @else {
            <a routerLink="/entrar" class="text-link auth-switch"
              ><app-icon name="back" /> Voltar para entrar</a
            >
          }
        </div>
      </section>
    </div>
  `,
})
export class Acesso {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly retorno = this.route.snapshot.queryParamMap.get('retorno');
  private readonly tokenRecuperacao = this.route.snapshot.queryParamMap.get('token') ?? '';
  protected readonly auth = inject(PacienteAuthService);
  protected readonly salvando = signal(false);
  protected readonly erro = signal(
    this.route.snapshot.queryParamMap.has('expirada') ? 'Sua sessão expirou. Entre novamente.' : '',
  );
  protected readonly modo: string = this.route.snapshot.data['modo'] ?? 'entrar';
  protected readonly mostrar = signal(false);
  protected readonly form = criarFormularioAcesso(inject(FormBuilder), this.modo);
  protected readonly titulo =
    this.modo === 'cadastro'
      ? 'Seu cuidado começa aqui.'
      : this.modo === 'recuperar'
        ? 'Vamos recuperar seu acesso.'
        : this.modo === 'nova-senha'
          ? 'Uma nova senha, um novo começo.'
          : 'Bom ter você aqui.';
  protected readonly subtitulo =
    this.modo === 'cadastro'
      ? 'Crie sua conta e fique mais perto do seu cuidado.'
      : this.modo === 'recuperar'
        ? 'Informe seu e-mail para continuar.'
        : this.modo === 'nova-senha'
          ? 'Escolha uma nova senha para sua conta.'
          : 'Entre para acompanhar suas consultas.';
  protected readonly botao =
    this.modo === 'cadastro'
      ? 'Criar minha conta'
      : this.modo === 'recuperar'
        ? 'Enviar link de recuperação'
        : this.modo === 'nova-senha'
          ? 'Salvar nova senha'
          : 'Entrar';
  protected normalizarEmail(): void {
    this.form.controls.email.setValue(this.form.controls.email.value.trim().toLowerCase());
  }
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected enviar() {
    if (this.salvando()) return;
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.modo === 'recuperar' || this.modo === 'nova-senha') {
      if (this.modo === 'nova-senha' && !/^[a-f\d]{64}$/.test(this.tokenRecuperacao)) {
        this.erro.set(
          'Abra o link de recuperação recebido por e-mail. Se ele expirou, solicite outro.',
        );
        return;
      }
      this.erro.set('');
      this.salvando.set(true);
      const operacao =
        this.modo === 'recuperar'
          ? this.auth.recuperar(v.email)
          : this.auth.redefinir(this.tokenRecuperacao, v.senha);
      operacao.pipe(finalize(() => this.salvando.set(false))).subscribe({
        next: () => {
          if (this.modo === 'nova-senha') this.auth.sair();
          this.form.reset();
          void this.router.navigate([
            this.modo === 'recuperar' ? '/link-enviado' : '/senha-atualizada',
          ]);
        },
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
      return;
    }
    this.erro.set('');
    this.salvando.set(true);
    const operacao =
      this.modo === 'cadastro'
        ? this.auth.cadastrar(v.nome, v.email, v.senha)
        : this.auth.entrar(v.email, v.senha);
    operacao.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => {
        this.form.reset();
        void this.router.navigateByUrl(
          this.modo === 'cadastro' && !this.retorno
            ? '/confirmar-email'
            : retornoPacienteSeguro(this.retorno),
        );
      },
      error: (e: unknown) =>
        this.erro.set(
          e instanceof HttpErrorResponse && e.status === 409
            ? 'Já existe uma conta com este e-mail. Entre com sua senha.'
            : e instanceof HttpErrorResponse && e.status === 401
              ? 'E-mail ou senha inválidos para a área do paciente.'
              : e instanceof HttpErrorResponse && e.status === 400
                ? 'Confira o nome, o e-mail e a senha informados.'
                : 'Não foi possível concluir. Confira a conexão com a clínica e tente novamente.',
        ),
    });
  }
}
