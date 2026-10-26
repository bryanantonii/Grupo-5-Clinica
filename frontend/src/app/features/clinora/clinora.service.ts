import { computed, Injectable, signal } from '@angular/core';
import { Consulta, Especialidade, PerfilPaciente, Profissional } from './clinora.models';

/** Camada de demonstração isolada. Não armazena senhas e não chama o backend.
 * Os dados duram a sessão da aba. Consulte o README para integrar a API. */
@Injectable({ providedIn: 'root' })
export class ClinoraService {
  readonly especialidades: Especialidade[] = [
    {
      _id: 'clinica-geral',
      nome: 'Clínica geral',
      descricao: 'Acompanhamento da sua saúde.',
      icone: 'stethoscope',
    },
    {
      _id: 'cardiologia',
      nome: 'Cardiologia',
      descricao: 'Atenção à saúde do coração.',
      icone: 'heart',
    },
    {
      _id: 'dermatologia',
      nome: 'Dermatologia',
      descricao: 'Cuidado com a sua pele.',
      icone: 'sparkles',
    },
  ];
  readonly profissionais: Profissional[] = [
    {
      _id: 'mariana-costa',
      registro: 'DEMO-001',
      email: 'mariana.costa@example.com',
      telefone: '(51) 90000-0001',
      ativo: true,
      nome: 'Dra. Mariana Costa',
      iniciais: 'MC',
      especialidade: 'clinica-geral',
      descricao: 'Escuta e cuidado em todas as fases da vida.',
      titulo: 'Um cuidado próximo, em cada fase da vida.',
    },
    {
      _id: 'rafael-mendes',
      registro: 'DEMO-002',
      email: 'rafael.mendes@example.com',
      telefone: '(51) 90000-0002',
      ativo: true,
      nome: 'Dr. Rafael Mendes',
      iniciais: 'RM',
      especialidade: 'cardiologia',
      descricao: 'Um olhar atento para a saúde do coração.',
      titulo: 'Atenção ao que faz seu coração bater.',
    },
    {
      _id: 'camila-oliveira',
      registro: 'DEMO-003',
      email: 'camila.oliveira@example.com',
      telefone: '(51) 90000-0003',
      ativo: true,
      nome: 'Dra. Camila Oliveira',
      iniciais: 'CO',
      especialidade: 'dermatologia',
      descricao: 'Cuidado com a pele e com o seu bem-estar.',
      titulo: 'Cuidar da sua pele também é cuidar de você.',
    },
  ];
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
