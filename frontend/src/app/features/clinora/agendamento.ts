import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Subscription } from 'rxjs';
import { ClinoraService } from './clinora.service';
import { ROTULOS_CONSULTA } from './clinora.models';
import { mensagemDaApi } from '../../shared/erros-api';
import { Icon } from './shared/icon';

function iso(data: Date) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, '0'),
    String(data.getDate()).padStart(2, '0'),
  ].join('-');
}
function primeiroDia(semana = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 1 + semana * 7);
  while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1);
  return d;
}
const nascimentoValido: ValidatorFn = (campo) => {
  if (!campo.value) return null;
  const data = new Date(String(campo.value) + 'T12:00:00');
  return !Number.isFinite(data.getTime()) ||
    iso(data) !== campo.value ||
    campo.value > iso(new Date())
    ? { nascimento: true }
    : null;
};

@Component({
  selector: 'app-agendamento',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon],
  templateUrl: './agendamento.html',
})
export class Agendamento implements OnDestroy {
  protected readonly dados = inject(ClinoraService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly etapa = signal(1);
  protected readonly etapas = ['Cuidado', 'Horário', 'Seus dados', 'Revisão'];
  protected readonly especialidade = signal('');
  protected readonly profissional = signal('');
  protected readonly semana = signal(0);
  protected readonly data = signal(iso(primeiroDia()));
  protected readonly horario = signal('');
  protected readonly erro = signal('');
  protected readonly salvando = signal(false);
  protected readonly horarios = signal<string[]>([]);
  protected readonly carregandoHorarios = signal(false);
  protected readonly erroHorarios = signal('');
  protected readonly profissionais = computed(() =>
    this.dados.profissionais.filter((p) => p.especialidade === this.especialidade()),
  );
  protected readonly dias = computed(() => {
    const d = primeiroDia(this.semana());
    const dias = [];
    while (dias.length < 5) {
      if (![0, 6].includes(d.getDay()))
        dias.push({
          iso: iso(d),
          numero: d.getDate(),
          dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        });
      d.setDate(d.getDate() + 1);
    }
    return dias;
  });
  protected readonly mes = computed(() =>
    new Date(this.dias()[0].iso + 'T12:00:00').toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    }),
  );
  protected readonly dataExtensa = computed(() =>
    new Date(this.data() + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  );
  protected readonly hoje = iso(new Date());
  protected readonly form = inject(FormBuilder).nonNullable.group({
    nome: [
      this.dados.perfil()?.nome ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    ],
    email: [this.dados.perfil()?.email ?? '', [Validators.required, Validators.email]],
    telefone: [
      this.dados.perfil()?.telefone ?? '',
      [Validators.required, Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)],
    ],
    dataNascimento: ['', [Validators.required, nascimentoValido]],
    convenio: [''],
    ciente: [false, Validators.requiredTrue],
  });
  private horariosSub?: Subscription;
  private readonly atividades = new Subscription();
  constructor() {
    this.atividades.add(
      this.dados.carregarEquipe().subscribe(() => {
        const q = this.route.snapshot.queryParamMap;
        const e = q.get('especialidade');
        this.especialidade.set(
          this.dados.especialidades.some((item) => item._id === e)
            ? e!
            : (this.dados.especialidades[0]?._id ?? ''),
        );
        const p = this.dados.profissional(q.get('profissional') ?? '');
        if (p?.ativo) {
          this.especialidade.set(p.especialidade);
          this.profissional.set(p._id);
          this.etapa.set(2);
        } else this.profissional.set(this.profissionais()[0]?._id ?? '');
        this.atualizarHorarios();
      }),
    );
    this.atividades.add(
      this.dados.carregarCadastro().subscribe({
        next: (p) =>
          this.form.patchValue({
            dataNascimento: p.dataNascimento,
            convenio: p.convenio ?? '',
            telefone: p.telefone || this.form.controls.telefone.value,
          }),
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      }),
    );
  }
  protected atualizarHorarios() {
    this.horariosSub?.unsubscribe();
    this.horario.set('');
    this.horarios.set([]);
    this.erroHorarios.set('');
    if (!this.profissional()) return;
    this.carregandoHorarios.set(true);
    this.horariosSub = this.dados
      .horarios(this.profissional(), this.data())
      .pipe(finalize(() => this.carregandoHorarios.set(false)))
      .subscribe({
        next: (horarios) => this.horarios.set(horarios),
        error: (e: unknown) => this.erroHorarios.set(mensagemDaApi(e)),
      });
  }
  protected escolherEspecialidade(id: string) {
    this.especialidade.set(id);
    this.profissional.set(this.profissionais()[0]?._id ?? '');
    this.atualizarHorarios();
  }
  protected escolherProfissional(id: string) {
    this.profissional.set(id);
    this.atualizarHorarios();
  }
  protected escolherData(data: string) {
    this.data.set(data);
    this.erro.set('');
    this.atualizarHorarios();
  }
  protected mudarSemana(delta: number) {
    this.semana.update((s) => Math.max(0, s + delta));
    this.escolherData(this.dias()[0].iso);
  }
  protected invalido(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }
  protected ir(etapa: number) {
    this.etapa.set(etapa);
    this.erro.set('');
    setTimeout(() => document.getElementById('titulo-etapa')?.focus());
  }
  protected continuar() {
    if (!this.profissional()) {
      this.erro.set('Não há profissionais disponíveis para esta especialidade.');
      return;
    }
    if (this.etapa() === 2 && !this.horarios().includes(this.horario())) {
      this.erro.set('Escolha um horário disponível.');
      return;
    }
    if (this.etapa() === 3) {
      this.form.markAllAsTouched();
      if (this.form.invalid) {
        this.erro.set('Confira os campos indicados.');
        return;
      }
    }
    this.ir(this.etapa() + 1);
  }
  protected confirmar() {
    if (this.salvando()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.ir(3);
      return;
    }
    if (!this.horarios().includes(this.horario())) {
      this.ir(2);
      return;
    }
    this.salvando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    this.atividades.add(
      this.dados
        .agendar({
          profissional: this.profissional(),
          especialidade: this.especialidade(),
          data: this.data(),
          horario: this.horario(),
          telefone: v.telefone,
          dataNascimento: v.dataNascimento,
          convenio: v.convenio || null,
          ciente: v.ciente,
        })
        .pipe(finalize(() => this.salvando.set(false)))
        .subscribe({
          next: (c) =>
            void this.router.navigate(['/agendamento-concluido'], { queryParams: { id: c._id } }),
          error: (e: unknown) => {
            if (e instanceof HttpErrorResponse && e.status === 409) {
              this.ir(2);
              this.atualizarHorarios();
            }
            this.erro.set(mensagemDaApi(e, 'Não foi possível agendar. Tente novamente.'));
          },
        }),
    );
  }
  ngOnDestroy() {
    this.horariosSub?.unsubscribe();
    this.atividades.unsubscribe();
  }
}

@Component({
  selector: 'app-agendamento-concluido',
  imports: [RouterLink, DatePipe, Icon],
  template:
    '<section class="result-page booking-success container">' +
    '@if (dados.carregandoConsultas()) { <p class="notice" role="status">Carregando agendamento...</p> }' +
    '@else if (dados.erroConsultas()) { <p class="error-notice" role="alert">{{ dados.erroConsultas() }}</p><button class="btn" (click)="carregar()">Tentar novamente</button> }' +
    '@else if (consulta(); as c) {' +
    '<div class="result-icon"><app-icon name="check" /></div><p class="eyebrow">Agendamento registrado</p><h1>Seu próximo cuidado está marcado.</h1>' +
    '<p class="lead">Tudo certo, {{ c.paciente.nome.split(" ")[0] }}. Confira as informações da sua consulta.</p>' +
    '<div class="panel success-summary"><span class="status">{{ rotulos[c.status] }}</span><h2>{{ c.especialidadeNome }}</h2><p>{{ c.profissionalNome }} · Presencial</p>' +
    '<p class="appointment-date"><app-icon name="calendar" /> {{ c.data + "T12:00:00" | date: "dd/MM/yyyy" }} · {{ c.horario }}</p>' +
    '<div class="divider"></div><p>Atendimento: {{ c.convenio }}.</p></div>' +
    '<p class="notice">Você pode acompanhar as atualizações da consulta na sua área.</p>' +
    '<a routerLink="/consultas/{{ c._id }}" class="btn">Ver minha consulta <app-icon name="arrow" /></a>' +
    '} @else { <h1>Vamos cuidar de você?</h1><a routerLink="/agendar" class="btn">Agendar consulta</a> }' +
    '<p><a routerLink="/minha-area" class="text-link">Acessar minha área</a></p></section>',
})
export class AgendamentoConcluido {
  protected readonly dados = inject(ClinoraService);
  protected readonly rotulos = ROTULOS_CONSULTA;
  private readonly id = inject(ActivatedRoute).snapshot.queryParamMap.get('id') ?? '';
  protected readonly consulta = computed(() => this.dados.consulta(this.id));
  constructor() {
    if (this.id) this.carregar();
  }
  protected carregar() {
    this.dados.carregarConsulta(this.id).subscribe();
  }
}
