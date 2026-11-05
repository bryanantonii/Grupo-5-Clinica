import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinoraService } from './clinora.service';
import { Icon } from './shared/icon';
@Component({
  selector: 'app-area-paciente',
  imports: [RouterLink, Icon, ReactiveFormsModule, DatePipe],
  template: `
    <div class="container page-content patient-page">
      @if (modo === 'area') {
        <p class="eyebrow">Área do paciente</p>
        <div class="section-heading">
          <div>
            <h1>Olá, {{ primeiroNome }}.</h1>
            <p class="lead">Que bom cuidar de você por aqui.</p>
          </div>
          <a routerLink="/agendar" class="btn"><app-icon name="calendar" /> Agendar consulta</a>
        </div>
        <div class="patient-grid">
          <section>
            <h2 class="medium-heading">Suas consultas</h2>
            @for (c of dados.consultas(); track c._id) {
              <article class="appointment-card" [class.cancelled]="c.status === 'cancelada'">
                <div class="appointment-top">
                  <span class="icon-tile"><app-icon name="calendar" /></span
                  ><span class="status" [class.status-cancelled]="c.status === 'cancelada'"
                    ><app-icon [name]="c.status === 'confirmada' ? 'check' : 'close'" />{{
                      c.status === 'confirmada' ? 'Confirmada' : 'Cancelada'
                    }}</span
                  >
                </div>
                <h2>{{ dados.especialidade(c.especialidade) }}</h2>
                <p>{{ dados.profissional(c.profissional)?.nome }} · Presencial</p>
                <p class="appointment-date">
                  <app-icon name="clock" /> {{ c.data + 'T12:00:00' | date: "dd 'de' MMMM" }} ·
                  {{ c.horario }}
                </p>
                <a [routerLink]="['/consultas', c._id]" class="text-link"
                  >Ver detalhes da consulta <app-icon name="arrow"
                /></a>
              </article>
            } @empty {
              <div class="empty-state panel">
                <span class="icon-tile"><app-icon name="calendar" /></span>
                <h2>Seu próximo cuidado começa aqui.</h2>
                <p>Você ainda não tem consultas agendadas.</p>
                <a routerLink="/agendar" class="btn">Agendar minha primeira consulta</a>
              </div>
            }
          </section>
          <aside class="panel quick-access">
            <h2>Acesso rápido</h2>
            <a routerLink="/meus-dados" class="btn btn-outline"
              ><app-icon name="user" /> Meus dados</a
            ><a routerLink="/contato" class="btn btn-outline"
              ><app-icon name="message" /> Falar com a clínica</a
            >
            <p class="small-text">Dados fictícios para demonstração.</p>
          </aside>
        </div>
        <p class="notice">
          <app-icon name="info" /> O histórico de consultas aparecerá aqui depois dos seus
          atendimentos.
        </p>
      } @else if (modo === 'dados') {
        <a routerLink="/minha-area" class="text-link back-link"
          ><app-icon name="back" /> Voltar para minha área</a
        >
        <p class="eyebrow">Seu perfil</p>
        <h1>Meus dados</h1>
        <p class="lead">Mantenha suas informações de contato atualizadas.</p>
        <form class="profile-form panel" [formGroup]="form" (ngSubmit)="salvar()" novalidate>
          <div class="field">
            <label for="nome">Nome completo *</label
            ><input
              id="nome"
              formControlName="nome"
              autocomplete="name"
              [attr.aria-invalid]="invalido('nome')"
              aria-describedby="nome-erro"
            />
            @if (invalido('nome')) {
              <span id="nome-erro" class="field-error"
                >Informe seu nome entre 3 e 80 caracteres.</span
              >
            }
          </div>
          <div class="field">
            <label for="email">E-mail *</label
            ><input
              id="email"
              type="email"
              formControlName="email"
              autocomplete="email"
              [attr.aria-invalid]="invalido('email')"
              aria-describedby="email-erro"
            />
            @if (invalido('email')) {
              <span id="email-erro" class="field-error">Informe um e-mail válido.</span>
            }
          </div>
          <div class="field">
            <label for="telefone">Celular</label
            ><input
              id="telefone"
              type="tel"
              formControlName="telefone"
              autocomplete="tel"
              placeholder="(51) 99999-9999"
              [attr.aria-invalid]="invalido('telefone')"
              aria-describedby="telefone-erro"
            />
            @if (invalido('telefone')) {
              <span id="telefone-erro" class="field-error">Use o formato (51) 99999-9999.</span>
            }
          </div>
          <p class="privacy-note">
            <app-icon name="shield" /> Suas informações ficam somente nesta demonstração.
          </p>
          <div class="form-actions">
            <a routerLink="/minha-area" class="btn btn-outline">Voltar</a
            ><button type="submit" class="btn">Salvar alterações <app-icon name="check" /></button>
          </div>
        </form>
      } @else {
        <a routerLink="/minha-area" class="text-link back-link"
          ><app-icon name="back" /> Voltar para minhas consultas</a
        >
        @if (consulta(); as c) {
          <p class="eyebrow">{{ modo === 'cancelar' ? 'Vamos confirmar?' : 'Seu atendimento' }}</p>
          <h1>
            {{ modo === 'cancelar' ? 'Deseja cancelar esta consulta?' : 'Detalhes da consulta' }}
          </h1>
          <p class="lead">
            {{
              modo === 'cancelar'
                ? 'O horário ficará disponível para outras pessoas.'
                : 'Tudo o que você precisa saber para o seu cuidado.'
            }}
          </p>
          <article class="panel consultation-details">
            <div class="appointment-top">
              <h2>{{ dados.especialidade(c.especialidade) }}</h2>
              <span class="status" [class.status-cancelled]="c.status === 'cancelada'">{{
                c.status === 'confirmada' ? 'Confirmada' : 'Cancelada'
              }}</span>
            </div>
            <dl class="review-grid">
              <div>
                <dt>Profissional</dt>
                <dd>{{ dados.profissional(c.profissional)?.nome }}</dd>
              </div>
              <div>
                <dt>Data e horário</dt>
                <dd>
                  {{ c.data + 'T12:00:00' | date: "dd 'de' MMMM 'de' yyyy" }} · {{ c.horario }}
                </dd>
              </div>
              <div>
                <dt>Atendimento</dt>
                <dd>Presencial · {{ c.convenio }}</dd>
              </div>
              <div>
                <dt>Paciente</dt>
                <dd>{{ c.paciente.nome }}</dd>
              </div>
              <div>
                <dt>Contato</dt>
                <dd>{{ c.paciente.email }}</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>Clínica Clinora · endereço a informar</dd>
              </div>
            </dl>
          </article>
          @if (modo === 'cancelar' && c.status === 'confirmada') {
            <div class="form-actions detail-actions">
              <a [routerLink]="['/consultas', c._id]" class="btn">Manter minha consulta</a
              ><button type="button" class="btn btn-danger-outline" (click)="cancelar(c._id)">
                Confirmar cancelamento
              </button>
            </div>
          } @else {
            <p class="notice">
              <app-icon name="info" />
              {{
                c.status === 'cancelada'
                  ? 'Esta consulta foi cancelada. Você pode escolher um novo horário.'
                  : 'Chegue com 15 minutos de antecedência. Leve um documento com foto e, se houver, a carteirinha do convênio.'
              }}
            </p>
            <div class="button-row">
              @if (c.status === 'confirmada') {
                <a
                  routerLink="/agendar"
                  [queryParams]="{ especialidade: c.especialidade, profissional: c.profissional }"
                  class="btn btn-outline"
                  >Ver outros horários</a
                ><a [routerLink]="['/consultas', c._id, 'cancelar']" class="text-link danger-link"
                  >Cancelar consulta</a
                >
              } @else {
                <a routerLink="/agendar" class="btn">Agendar novo horário</a>
              }
            </div>
          }
        } @else {
          <div class="empty-state">
            <h1>Consulta não encontrada.</h1>
            <p>Veja os agendamentos disponíveis na sua área.</p>
            <a routerLink="/minha-area" class="btn">Voltar para minha área</a>
          </div>
        }
      }
    </div>
  `,
})
export class AreaPaciente {
  protected readonly dados = inject(ClinoraService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly modo: string = this.route.snapshot.data['modo'] ?? 'area';
  protected readonly primeiroNome = this.dados.perfil()?.nome.split(' ')[0] ?? '';
  protected readonly consulta = computed(() =>
    this.dados.consulta(this.route.snapshot.paramMap.get('id') ?? ''),
  );
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: [
      this.dados.perfil()?.nome ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    ],
    email: [this.dados.perfil()?.email ?? '', [Validators.required, Validators.email]],
    telefone: [
      this.dados.perfil()?.telefone ?? '',
      Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/),
    ],
  });
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected salvar() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.dados.atualizarPerfil({
      nome: v.nome.trim(),
      email: v.email.trim().toLowerCase(),
      telefone: v.telefone.trim(),
    });
    void this.router.navigate(['/dados-atualizados']);
  }
  protected cancelar(id: string) {
    this.dados.cancelar(id);
    void this.router.navigate(['/consulta-cancelada']);
  }
}
