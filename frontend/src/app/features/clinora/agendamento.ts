import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClinoraService } from './clinora.service';
import { Icon } from './shared/icon';
function iso(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}
function inicioSemana() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
  return d;
}
@Component({
  selector: 'app-agendamento',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icon],
  templateUrl: './agendamento.html',
})
export class Agendamento {
  protected readonly dados = inject(ClinoraService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly etapa = signal(1);
  protected readonly etapas = ['Cuidado', 'Horário', 'Seus dados', 'Revisão'];
  protected readonly especialidade = signal('clinica-geral');
  protected readonly profissional = signal('mariana-costa');
  protected readonly semana = signal(0);
  protected readonly data = signal(iso(inicioSemana()));
  protected readonly horario = signal('');
  protected readonly erro = signal('');
  protected readonly salvando = signal(false);
  protected readonly horarios = ['08:00', '09:30', '10:00', '13:30', '14:00', '15:30'];
  protected readonly profissionais = computed(() =>
    this.dados.profissionais.filter((p) => p.especialidade === this.especialidade()),
  );
  protected readonly dias = computed(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = inicioSemana();
      d.setDate(d.getDate() + this.semana() * 7 + i);
      return {
        iso: iso(d),
        numero: d.getDate(),
        dia: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      };
    }),
  );
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
  protected readonly ocupados = computed(() =>
    this.dados.horariosOcupados(this.profissional(), this.data()),
  );
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
    convenio: ['Particular'],
    ciente: [false, Validators.requiredTrue],
  });
  constructor() {
    const q = this.route.snapshot.queryParamMap;
    const e = q.get('especialidade');
    const p = this.dados.profissional(q.get('profissional') ?? '');
    if (e && this.dados.especialidades.some((x) => x._id === e)) this.especialidade.set(e);
    if (p?.ativo) {
      this.especialidade.set(p.especialidade);
      this.profissional.set(p._id);
      this.etapa.set(2);
    } else this.profissional.set(this.profissionais()[0]?._id ?? '');
  }
  protected escolherEspecialidade(id: string) {
    this.especialidade.set(id);
    this.profissional.set(this.profissionais()[0]?._id ?? '');
    this.horario.set('');
  }
  protected escolherProfissional(id: string) {
    this.profissional.set(id);
    this.horario.set('');
  }
  protected escolherData(d: string) {
    this.data.set(d);
    this.horario.set('');
    this.erro.set('');
  }
  protected mudarSemana(d: number) {
    this.semana.update((s) => Math.max(0, s + d));
    this.escolherData(this.dias()[0].iso);
  }
  protected invalido(c: string) {
    const v = this.form.get(c);
    return !!v && v.invalid && v.touched;
  }
  protected ir(etapa: number) {
    this.etapa.set(etapa);
    this.erro.set('');
    setTimeout(() => {
      document.getElementById('titulo-etapa')?.focus();
      document.getElementById('conteudo')?.scrollIntoView({ block: 'start' });
    });
  }
  protected continuar() {
    if (!this.profissional()) {
      this.erro.set('Não há profissionais disponíveis para esta especialidade.');
      return;
    }
    if (this.etapa() === 2 && !this.horario()) {
      this.erro.set('Escolha um horário para continuar.');
      return;
    }
    if (this.etapa() === 3) {
      this.form.markAllAsTouched();
      if (this.form.invalid) {
        this.erro.set('Confira os campos indicados antes de continuar.');
        return;
      }
    }
    this.ir(this.etapa() + 1);
  }
  protected confirmar() {
    if (this.salvando()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.horario()) {
      this.ir(3);
      return;
    }
    this.salvando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    try {
      this.dados.agendar({
        profissional: this.profissional(),
        especialidade: this.especialidade(),
        data: this.data(),
        horario: this.horario(),
        convenio: v.convenio,
        paciente: {
          nome: v.nome.trim(),
          email: v.email.trim().toLowerCase(),
          telefone: v.telefone.trim(),
        },
      });
      void this.router.navigate(['/agendamento-concluido']);
    } catch (e) {
      this.salvando.set(false);
      this.erro.set(e instanceof Error ? e.message : 'Não foi possível agendar. Tente novamente.');
    }
  }
}
@Component({
  selector: 'app-agendamento-concluido',
  imports: [RouterLink, DatePipe, Icon],
  template: `
    <section class="result-page booking-success container">
      <div class="result-icon"><app-icon name="check" /></div>
      <p class="eyebrow">Cuidado agendado</p>
      <h1>{{ consulta ? 'Seu próximo cuidado está marcado.' : 'Vamos cuidar de você?' }}</h1>
      @if (consulta; as c) {
        <p class="lead">
          Tudo certo, {{ c.paciente.nome.split(' ')[0] }}. Confira as informações da sua consulta.
        </p>
        <div class="panel success-summary">
          <span class="status"><app-icon name="check" /> Confirmada na demonstração</span>
          <h2>{{ dados.especialidade(c.especialidade) }}</h2>
          <p>{{ dados.profissional(c.profissional)?.nome }} · Presencial</p>
          <p class="appointment-date">
            <app-icon name="calendar" /> {{ c.data + 'T12:00:00' | date: 'dd/MM/yyyy' }} ·
            {{ c.horario }}
          </p>
          <div class="divider"></div>
          <p>Chegue com 15 minutos de antecedência e leve um documento com foto.</p>
        </div>
        <p class="notice">
          <app-icon name="info" /> Este agendamento é demonstrativo. Nenhuma consulta real foi
          marcada e nenhum e-mail foi enviado.
        </p>
        <a routerLink="/minha-area" class="btn"
          >Acompanhar minhas consultas <app-icon name="arrow"
        /></a>
        <p class="small-text">Entre com o mesmo e-mail informado no agendamento.</p>
        <a routerLink="/" class="text-link result-secondary">Voltar ao início</a>
      } @else {
        <p class="lead">Escolha a especialidade e encontre um horário para você.</p>
        <a routerLink="/agendar" class="btn">Agendar consulta</a>
      }
    </section>
  `,
})
export class AgendamentoConcluido {
  protected readonly dados = inject(ClinoraService);
  protected readonly consulta = this.dados.ultimaConsulta();
}
