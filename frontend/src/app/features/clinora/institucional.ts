import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinoraService } from './clinora.service';
import { Icon } from './shared/icon';
@Component({
  selector: 'app-sobre',
  imports: [RouterLink, Icon],
  template: `
    <div class="container page-content about-page">
      <p class="eyebrow">Conheça a Clinora</p>
      <h1>Mais que uma clínica, um cuidado integrado.</h1>
      <p class="lead">Acolhimento, tecnologia e atenção à sua saúde em todas as fases da vida.</p>
      <div class="split-grid about-story">
        <img
          src="/images/recepcao.jpg"
          alt="Recepção da Clinora, com espaço de espera e balcão de atendimento"
          width="612"
          height="394"
        />
        <div>
          <h2>
            Cuidar começa<br />
            com escutar.
          </h2>
          <p class="lead">
            Na Clinora, reunimos clínica geral e especialidades em uma experiência próxima e
            simples. Queremos que você entenda seu cuidado e se sinta à vontade para perguntar.
          </p>
          <a routerLink="/profissionais" class="btn"
            >Conhecer os profissionais <app-icon name="arrow"
          /></a>
        </div>
      </div>
      <div class="three-grid about-values">
        <article class="panel">
          <span class="icon-tile"><app-icon name="heart" /></span>
          <h3>Atendimento humano</h3>
          <p>Escuta atenta e respeito às suas necessidades.</p>
        </article>
        <article class="panel">
          <span class="icon-tile"><app-icon name="message" /></span>
          <h3>Informação clara</h3>
          <p>Orientações para decidir com tranquilidade.</p>
        </article>
        <article class="panel">
          <span class="icon-tile"><app-icon name="stethoscope" /></span>
          <h3>Cuidado integrado</h3>
          <p>Especialidades e acompanhamento em um só lugar.</p>
        </article>
      </div>
    </div>
  `,
})
export class Sobre {}
@Component({
  selector: 'app-convenios',
  imports: [ReactiveFormsModule, RouterLink, Icon],
  template: `
    <div class="container page-content">
      <p class="eyebrow">Convênios e particular</p>
      <h1 class="convenios-title">Vamos encontrar a melhor forma de cuidar de você.</h1>
      <p class="lead">
        A cobertura depende do seu plano e da especialidade. Confirme com a equipe antes de agendar.
      </p>
      <div class="insurance-grid">
        <form class="panel insurance-form" [formGroup]="form" (ngSubmit)="solicitar()" novalidate>
          <span class="icon-tile"><app-icon name="shield" /></span>
          <div class="field">
            <label for="plano">Nome do seu convênio *</label
            ><input
              id="plano"
              formControlName="plano"
              placeholder="Digite o nome do plano"
              [attr.aria-invalid]="invalido('plano')"
              aria-describedby="plano-erro"
            />
            @if (invalido('plano')) {
              <span id="plano-erro" class="field-error"
                >Informe o nome do convênio (pelo menos 3 caracteres).</span
              >
            }
          </div>
          <div class="insurance-fields">
            <div class="field">
              <label for="especialidade">Especialidade</label
              ><select id="especialidade" formControlName="especialidade">
                @for (e of dados.especialidades; track e._id) {
                  <option [value]="e.nome">{{ e.nome }}</option>
                }
              </select>
            </div>
            <button type="submit" class="btn">
              Solicitar confirmação <app-icon name="arrow" />
            </button>
          </div>
          <p class="small-text">
            <app-icon name="info" /> Não encontrou seu plano? Nossa equipe pode orientar você.
          </p>
        </form>
        <aside class="panel mint-panel">
          <span class="icon-tile"><app-icon name="heart" /></span>
          <h2>
            Atendimento<br />
            particular
          </h2>
          <p>Consulte valores e formas de pagamento com a equipe.</p>
          <a routerLink="/contato" class="text-link"
            >Falar com a clínica <app-icon name="arrow"
          /></a>
        </aside>
      </div>
    </div>
  `,
})
export class Convenios {
  protected readonly dados = inject(ClinoraService);
  private readonly router = inject(Router);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    plano: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    especialidade: ['Clínica geral'],
  });
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected solicitar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    void this.router.navigate(['/contato'], {
      queryParams: {
        assunto: 'Convênios',
        mensagem: `Olá! Gostaria de confirmar a cobertura do convênio ${v.plano.trim()} para ${v.especialidade}.`,
      },
    });
  }
}
@Component({
  selector: 'app-contato',
  imports: [ReactiveFormsModule, Icon],
  template: `
    <div class="container page-content">
      <p class="eyebrow">Estamos aqui para você</p>
      <h1>Vamos conversar?</h1>
      <p class="lead">Tire dúvidas sobre agendamento, convênios e acesso à clínica.</p>
      <div class="contact-grid">
        <aside>
          <article class="panel mint-panel">
            <span class="icon-tile"><app-icon name="phone" /></span>
            <h2>Fale com a equipe</h2>
            <p class="contact-label">Telefone e WhatsApp</p>
            <p>Número a informar</p>
            <div class="divider"></div>
            <p class="contact-label">Segunda a sexta</p>
            <p>Horários a confirmar</p>
          </article>
          <article class="panel location-panel">
            <span class="icon-tile"><app-icon name="pin" /></span>
            <h2>Como chegar</h2>
            <p>
              Endereço da clínica a informar. Confirme as condições de acesso com a equipe antes da
              visita.
            </p>
          </article>
        </aside>
        <form [formGroup]="form" (ngSubmit)="enviar()" class="contact-form" novalidate>
          <h2>Envie uma mensagem</h2>
          <p class="form-hint">Os campos com * são obrigatórios.</p>
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
                >Informe seu nome, com pelo menos 3 caracteres.</span
              >
            }
          </div>
          <div class="form-row">
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
            <div class="field">
              <label for="assunto">Assunto *</label
              ><select
                id="assunto"
                formControlName="assunto"
                [attr.aria-invalid]="invalido('assunto')"
                aria-describedby="assunto-erro"
              >
                <option value="">Selecione um assunto</option>
                <option>Agendamento</option>
                <option>Convênios</option>
                <option>Acesso à clínica</option>
                <option>Outros assuntos</option>
              </select>
              @if (invalido('assunto')) {
                <span id="assunto-erro" class="field-error">Selecione o assunto.</span>
              }
            </div>
          </div>
          <div class="field">
            <label for="mensagem">Mensagem *</label
            ><textarea
              id="mensagem"
              formControlName="mensagem"
              rows="6"
              maxlength="2000"
              placeholder="Conte como podemos ajudar. Evite incluir informações de saúde."
              [attr.aria-invalid]="invalido('mensagem')"
              aria-describedby="mensagem-erro"
            ></textarea>
            @if (invalido('mensagem')) {
              <span id="mensagem-erro" class="field-error"
                >Escreva uma mensagem entre 10 e 2.000 caracteres.</span
              >
            }
          </div>
          <p class="privacy-note">
            <app-icon name="shield" /> Usaremos seus dados apenas para responder ao seu contato.
          </p>
          <p class="form-hint">Demonstração acadêmica: nenhuma mensagem será enviada.</p>
          <div class="form-actions">
            <button type="submit" class="btn">Enviar mensagem <app-icon name="arrow" /></button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class Contato {
  private readonly router = inject(Router);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    assunto: [this.query.get('assunto') ?? '', Validators.required],
    mensagem: [
      this.query.get('mensagem') ?? '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
    ],
  });
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected enviar() {
    this.form.markAllAsTouched();
    if (this.form.valid) void this.router.navigate(['/mensagem-enviada']);
  }
}
