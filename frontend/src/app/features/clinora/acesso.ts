import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinoraService } from './clinora.service';
import { Icon } from './shared/icon';
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
                  aria-describedby="nome-erro"
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
                  autocomplete="email"
                  placeholder="voce@exemplo.com"
                  [attr.aria-invalid]="invalido('email')"
                  aria-describedby="email-erro"
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
                    aria-describedby="senha-ajuda senha-erro"
                  /><button
                    type="button"
                    (click)="mostrar.set(!mostrar())"
                    [attr.aria-pressed]="mostrar()"
                  >
                    {{ mostrar() ? 'Ocultar' : 'Mostrar' }}
                  </button>
                </div>
                <span id="senha-ajuda" class="form-hint"
                  >Use uma senha fictícia com pelo menos 8 caracteres.</span
                >
                @if (invalido('senha')) {
                  <span id="senha-erro" class="field-error"
                    >A senha deve ter pelo menos 8 caracteres.</span
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
                    form.controls.confirmar.touched && form.hasError('senhasDiferentes')
                  "
                  aria-describedby="confirmar-erro"
                />
                @if (form.controls.confirmar.touched && form.hasError('senhasDiferentes')) {
                  <span id="confirmar-erro" class="field-error"
                    >As senhas precisam ser iguais.</span
                  >
                }
              </div>
            }
            @if (modo === 'entrar') {
              <div class="auth-forgot">
                <a routerLink="/recuperar-acesso" class="text-link">Esqueci minha senha</a>
              </div>
            }
            @if (modo === 'cadastro') {
              <label class="checkbox-label"
                ><input type="checkbox" formControlName="ciente" /><span
                  >Estou ciente de que este é um projeto acadêmico e usarei dados fictícios.</span
                ></label
              >
              @if (invalido('ciente')) {
                <p class="field-error">Confirme que usará dados fictícios.</p>
              }
            }
            <div class="demo-note">
              <app-icon name="info" />
              <p>
                Modo demonstração.
                {{
                  modo === 'entrar'
                    ? 'Use seu e-mail e uma senha fictícia para explorar as telas.'
                    : 'Nenhuma senha é armazenada e nenhum e-mail é enviado.'
                }}
              </p>
            </div>
            <button type="submit" class="btn full-width">
              {{ botao }} <app-icon name="arrow" />
            </button>
          </form>
          @if (modo === 'entrar') {
            <a routerLink="/criar-conta" class="text-link auth-switch"
              >Ainda não tenho conta. Criar conta</a
            >
            <div class="divider"></div>
            <p>Só precisa de uma consulta?</p>
            <a routerLink="/agendar" class="text-link"
              >Agendar sem criar conta <app-icon name="arrow"
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
  private readonly dados = inject(ClinoraService);
  protected readonly modo: string = this.route.snapshot.data['modo'] ?? 'entrar';
  protected readonly mostrar = signal(false);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: [''],
    email: [''],
    senha: [''],
    confirmar: [''],
    ciente: [false],
  });
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
  constructor() {
    if (this.modo !== 'nova-senha')
      this.form.controls.email.setValidators([Validators.required, Validators.email]);
    if (this.modo !== 'recuperar')
      this.form.controls.senha.setValidators([Validators.required, Validators.minLength(8)]);
    if (this.modo === 'cadastro') {
      this.form.controls.nome.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
      ]);
      this.form.controls.ciente.setValidators(Validators.requiredTrue);
    }
    if (this.modo === 'cadastro' || this.modo === 'nova-senha')
      this.form.setValidators((g) =>
        g.get('senha')?.value === g.get('confirmar')?.value ? null : { senhasDiferentes: true },
      );
    // Recalcula também os controles ainda vazios após configurar os validadores.
    for (const control of Object.values(this.form.controls)) control.updateValueAndValidity();
  }
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected enviar() {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.modo === 'recuperar') {
      void this.router.navigate(['/link-enviado']);
      return;
    }
    if (this.modo === 'nova-senha') {
      this.form.reset();
      void this.router.navigate(['/senha-atualizada']);
      return;
    }
    const anterior = this.dados.perfil();
    const nome =
      v.nome.trim() ||
      (anterior?.email.toLowerCase() === v.email.trim().toLowerCase()
        ? anterior.nome
        : v.email
            .split('@')[0]
            .replace(/[._-]/g, ' ')
            .replace(/^./, (c) => c.toUpperCase()));
    this.dados.entrar({
      nome,
      email: v.email.trim().toLowerCase(),
      telefone:
        anterior?.email.toLowerCase() === v.email.trim().toLowerCase() ? anterior.telefone : '',
    });
    this.form.reset();
    const destino = this.route.snapshot.queryParamMap.get('retorno');
    void this.router.navigateByUrl(
      this.modo === 'cadastro'
        ? '/confirmar-email'
        : destino?.startsWith('/') && !destino.startsWith('//')
          ? destino
          : '/minha-area',
    );
  }
}
