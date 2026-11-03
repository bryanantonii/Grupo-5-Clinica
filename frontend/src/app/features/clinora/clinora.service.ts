import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfissionaisCatalogoService } from '../profissionais/services/profissionais-catalogo.service';
import { ClinicaMockStore } from '../gestao/services/clinica-mock.store';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Consulta, Especialidade, PerfilPaciente, Profissional } from './clinora.models';

/** Profissionais usa a API; acesso e agendamento continuam em demonstração na sessão. */
@Injectable({ providedIn: 'root' })
export class ClinoraService {
  private readonly cadastros = inject(ClinicaMockStore);
  private readonly catalogo = inject(ProfissionaisCatalogoService);
  readonly carregandoEquipe = this.catalogo.carregando;
  readonly erroEquipe = this.catalogo.erro;
  carregarEquipe(): Observable<void> {
    return environment.usarMockProfissionais ? of(undefined) : this.catalogo.carregarEquipe();
  }
  get especialidades(): Especialidade[] {
    return environment.usarMockProfissionais
      ? this.cadastros.especialidades().filter((e) => e.ativo)
      : this.catalogo.especialidades();
  }
  get profissionais(): Profissional[] {
    return environment.usarMockProfissionais
      ? this.cadastros.profissionais().filter((p) => p.ativo)
      : this.catalogo.profissionais();
  }
  private readonly perfilState = signal<PerfilPaciente | null>(this.ler('clinora.perfil', null));
  private readonly consultasState = signal<Consulta[]>(this.ler('clinora.consultas', []));
  readonly perfil = this.perfilState.asReadonly();
  readonly consultas = computed(() =>
    this.consultasState()
      .filter((c) => c.paciente.email.toLowerCase() === this.perfil()?.email.toLowerCase())
      .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario)),
  );
  readonly aviso = signal('');
  readonly ultimaConsulta = signal<Consulta | null>(this.ler('clinora.ultima-consulta', null));
  especialidade(id: string) {
    return this.especialidades.find((e) => e._id === id)?.nome ?? id;
  }
  profissional(id: string) {
    return this.profissionais.find((p) => p._id === id);
  }
  entrar(perfil: PerfilPaciente) {
    this.perfilState.set(perfil);
    this.gravar('clinora.perfil', perfil);
  }
  atualizarPerfil(perfil: PerfilPaciente) {
    const anterior = this.perfil()?.email;
    this.consultasState.update((l) =>
      l.map((c) => (c.paciente.email === anterior ? { ...c, paciente: { ...perfil } } : c)),
    );
    this.gravar('clinora.consultas', this.consultasState());
    this.entrar(perfil);
  }
  sair() {
    this.perfilState.set(null);
    try {
      sessionStorage.removeItem('clinora.perfil');
    } catch {}
  }
  horariosOcupados(profissional: string, data: string) {
    return this.consultasState()
      .filter(
        (c) => c.profissional === profissional && c.data === data && c.status === 'confirmada',
      )
      .map((c) => c.horario);
  }
  agendar(dados: Omit<Consulta, '_id' | 'status'>): Consulta {
    if (this.horariosOcupados(dados.profissional, dados.data).includes(dados.horario))
      throw new Error('Esse horário acabou de ser reservado. Escolha outro horário.');
    const consulta: Consulta = { ...dados, _id: crypto.randomUUID(), status: 'confirmada' };
    this.ultimaConsulta.set(consulta);
    this.gravar('clinora.ultima-consulta', consulta);
    this.consultasState.update((l) => [...l, consulta]);
    this.gravar('clinora.consultas', this.consultasState());
    return consulta;
  }
  consulta(id: string) {
    return this.consultasState().find(
      (c) => c._id === id && c.paciente.email.toLowerCase() === this.perfil()?.email.toLowerCase(),
    );
  }
  cancelar(id: string) {
    if (!this.consulta(id)) return;
    this.consultasState.update((l) =>
      l.map((c) => (c._id === id ? { ...c, status: 'cancelada' as const } : c)),
    );
    this.gravar('clinora.consultas', this.consultasState());
  }
  private ler<T>(chave: string, padrao: T): T {
    try {
      return JSON.parse(sessionStorage.getItem(chave) ?? 'null') ?? padrao;
    } catch {
      return padrao;
    }
  }
  private gravar(chave: string, valor: unknown) {
    try {
      sessionStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      this.aviso.set(
        'O navegador não permitiu salvar esta demonstração. Os dados serão mantidos enquanto a página estiver aberta.',
      );
    }
  }
}
