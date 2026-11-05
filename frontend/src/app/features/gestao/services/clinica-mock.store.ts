import { computed, Injectable, signal } from '@angular/core';
import {
  DadosClinica,
  Filtro,
  Modulo,
  Registro,
  StatusConsulta,
  TRANSICOES,
  ValorCampo,
  normalizar,
} from '../gestao.models';

const CHAVE = 'clinora.c1.cadastros.v1';
const copia = <T>(dado: T): T => structuredClone(dado);
const telefoneValido = (valor: string) => /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/.test(valor);
function dataUtil(dias: number, hora = 9): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString();
}
function exemplos(): DadosClinica {
  return {
    especialidades: [
      {
        _id: 'clinica-geral',
        nome: 'Clínica geral',
        descricao: 'Acompanhamento da sua saúde.',
        duracaoConsultaMin: 30,
        valorParticular: 180,
        icone: 'stethoscope',
        ativo: true,
      },
      {
        _id: 'cardiologia',
        nome: 'Cardiologia',
        descricao: 'Atenção à saúde do coração.',
        duracaoConsultaMin: 45,
        valorParticular: 280,
        icone: 'heart',
        ativo: true,
      },
      {
        _id: 'dermatologia',
        nome: 'Dermatologia',
        descricao: 'Cuidado com a sua pele.',
        duracaoConsultaMin: 30,
        valorParticular: 220,
        icone: 'sparkles',
        ativo: true,
      },
    ],
    convenios: [
      {
        _id: 'saude-mais',
        nome: 'Saúde Mais',
        codigoAns: '123456',
        percentualCobertura: 80,
        telefone: '(51) 90000-0101',
        ativo: true,
      },
      {
        _id: 'vida-plena',
        nome: 'Vida Plena',
        codigoAns: '234567',
        percentualCobertura: 70,
        telefone: '(51) 90000-0102',
        ativo: true,
      },
      {
        _id: 'bem-cuidar',
        nome: 'Bem Cuidar',
        codigoAns: '345678',
        percentualCobertura: 100,
        telefone: '(51) 90000-0103',
        ativo: true,
      },
    ],
    profissionais: [
      {
        _id: 'mariana-costa',
        nome: 'Dra. Mariana Costa',
        registro: 'DEMO-001',
        email: 'mariana.costa@example.com',
        telefone: '(51) 90000-0001',
        especialidade: 'clinica-geral',
        ativo: true,
        iniciais: 'MC',
        descricao: 'Escuta e cuidado em todas as fases da vida.',
        titulo: 'Um cuidado próximo, em cada fase da vida.',
      },
      {
        _id: 'rafael-mendes',
        nome: 'Dr. Rafael Mendes',
        registro: 'DEMO-002',
        email: 'rafael.mendes@example.com',
        telefone: '(51) 90000-0002',
        especialidade: 'cardiologia',
        ativo: true,
        iniciais: 'RM',
        descricao: 'Um olhar atento para a saúde do coração.',
        titulo: 'Atenção ao que faz seu coração bater.',
      },
      {
        _id: 'camila-oliveira',
        nome: 'Dra. Camila Oliveira',
        registro: 'DEMO-003',
        email: 'camila.oliveira@example.com',
        telefone: '(51) 90000-0003',
        especialidade: 'dermatologia',
        ativo: true,
        iniciais: 'CO',
        descricao: 'Cuidado com a pele e com o seu bem-estar.',
        titulo: 'Cuidar da sua pele também é cuidar de você.',
      },
    ],
    pacientes: [
      {
        _id: 'ana-silva',
        nome: 'Ana Silva',
        email: 'ana@example.com',
        telefone: '(51) 99999-0001',
        dataNascimento: '1996-04-15',
        convenio: 'saude-mais',
        ativo: true,
      },
      {
        _id: 'bruno-lima',
        nome: 'Bruno Lima',
        email: 'bruno@example.com',
        telefone: '(51) 99999-0002',
        dataNascimento: '1988-09-22',
        convenio: '',
        ativo: true,
      },
      {
        _id: 'carla-souza',
        nome: 'Carla Souza',
        email: 'carla@example.com',
        telefone: '(51) 99999-0003',
        dataNascimento: '2001-02-03',
        convenio: 'vida-plena',
        ativo: true,
      },
    ],
    consultas: [
      {
        _id: 'consulta-1',
        paciente: 'ana-silva',
        profissional: 'mariana-costa',
        dataHora: dataUtil(1),
        motivo: 'Acompanhamento de rotina demonstrativo.',
        status: 'marcada',
      },
      {
        _id: 'consulta-2',
        paciente: 'bruno-lima',
        profissional: 'rafael-mendes',
        dataHora: dataUtil(2, 10),
        motivo: 'Consulta demonstrativa.',
        status: 'confirmada',
      },
      {
        _id: 'consulta-3',
        paciente: 'carla-souza',
        profissional: 'camila-oliveira',
        dataHora: dataUtil(-7, 14),
        motivo: 'Atendimento demonstrativo concluído.',
        status: 'realizada',
      },
      {
        _id: 'consulta-4',
        paciente: 'ana-silva',
        profissional: 'mariana-costa',
        dataHora: dataUtil(-5, 11),
        motivo: 'Registro demonstrativo de falta.',
        status: 'falta',
      },
    ],
  };
}

/** Fonte única dos cadastros mock. SessionStorage guarda apenas dados fictícios da aba. */
@Injectable({ providedIn: 'root' })
export class ClinicaMockStore {
  private readonly dados = signal<DadosClinica>(this.ler());
  readonly especialidades = computed(() => this.dados().especialidades);
  readonly profissionais = computed(() => this.dados().profissionais);
  readonly avisoArmazenamento = signal('');
  private readonly falhas = new Set<Modulo | 'relatorios'>();
  snapshot(): DadosClinica {
    return copia(this.dados());
  }
  simularFalha(modulo: Modulo | 'relatorios'): void {
    this.falhas.add(modulo);
  }
  verificarFalha(modulo: Modulo | 'relatorios'): void {
    if (this.falhas.delete(modulo))
      throw new Error('Não foi possível carregar os dados de exemplo. Tente novamente.');
  }
  listar(modulo: Modulo, filtro: Filtro = {}): Registro[] {
    this.verificarFalha(modulo);
    return copia(
      this.dados()[modulo].filter((item) => {
        if (!filtro.mostrarInativos && item['ativo'] === false) return false;
        if (filtro.status && item['status'] !== filtro.status) return false;
        const busca = normalizar(filtro.busca);
        const texto =
          Object.values(item).join(' ') +
          ' ' +
          this.nomeReferencia('pacientes', String(item['paciente'] ?? '')) +
          ' ' +
          this.nomeReferencia('profissionais', String(item['profissional'] ?? ''));
        return !busca || normalizar(texto).includes(busca);
      }),
    ).sort((a, b) =>
      String(a['nome'] ?? a['dataHora']).localeCompare(String(b['nome'] ?? b['dataHora']), 'pt-BR'),
    );
  }
  buscar(modulo: Modulo, id: string): Registro {
    this.verificarFalha(modulo);
    const registro = this.dados()[modulo].find((r) => r._id === id);
    if (!registro)
      throw new Error(
        'Registro não encontrado. Ele pode ter sido removido ou o endereço está incorreto.',
      );
    return copia(registro);
  }
  nomeReferencia(modulo: Modulo, id: string): string {
    const item = this.dados()[modulo].find((r) => r._id === id);
    return String(item?.['nome'] ?? (id ? 'Cadastro indisponível' : 'Particular'));
  }
  referencias(modulo: Modulo, atual?: string): { id: string; nome: string }[] {
    return this.dados()
      [modulo].filter((r) => r['ativo'] !== false || r._id === atual)
      .map((r) => ({
        id: r._id,
        nome: String(r['nome']) + (r['ativo'] === false ? ' (inativo)' : ''),
      }));
  }
  salvar(modulo: Modulo, entrada: Record<string, ValorCampo>, id?: string): Registro {
    const anterior = id ? this.buscar(modulo, id) : undefined;
    const dados = Object.fromEntries(
      Object.entries(entrada).map(([chave, valor]) => [
        chave,
        typeof valor === 'string' ? valor.trim() : valor,
      ]),
    );
    if (typeof dados['email'] === 'string') dados['email'] = dados['email'].toLowerCase();
    if (typeof dados['registro'] === 'string') dados['registro'] = dados['registro'].toUpperCase();
    this.validar(modulo, dados, anterior);
    const agora = new Date().toISOString();
    const novo: Registro = {
      ...(modulo === 'consultas' ? { status: 'marcada' } : { ativo: true }),
      ...anterior,
      ...dados,
      _id: id ?? crypto.randomUUID(),
      createdAt: anterior?.['createdAt'] ?? agora,
      updatedAt: agora,
    };
    if (modulo === 'consultas') novo['status'] = anterior?.['status'] ?? 'marcada';
    if (modulo === 'profissionais') {
      novo['iniciais'] = String(novo['nome'])
        .replace(/^(Dra?\.?\s*)/i, '')
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
      novo['descricao'] ??= 'Atendimento com escuta e orientação clara.';
      novo['titulo'] ??= 'Um cuidado próximo, em cada fase da vida.';
    }
    if (modulo === 'especialidades') novo['icone'] ??= 'stethoscope';
    this.atualizarLista(modulo, [...this.dados()[modulo].filter((r) => r._id !== novo._id), novo]);
    return copia(novo);
  }
  remover(modulo: Modulo, id: string): void {
    if (modulo === 'consultas') {
      this.mudarStatus(id, 'cancelada');
      return;
    }
    const atual = this.buscar(modulo, id);
    this.atualizarLista(
      modulo,
      this.dados()[modulo].map((r) => (r._id === id ? { ...atual, ativo: false } : r)),
    );
  }
  mudarStatus(id: string, status: StatusConsulta): Registro {
    const consulta = this.dados().consultas.find((c) => c._id === id);
    if (!consulta) throw new Error('Consulta não encontrada.');
    if (!TRANSICOES[consulta.status].includes(status))
      throw new Error(`Não é possível passar de ${consulta.status} para ${status}.`);
    const nova = { ...consulta, status };
    this.atualizarLista(
      'consultas',
      this.dados().consultas.map((c) => (c._id === id ? nova : c)),
    );
    return copia(nova);
  }
  private atualizarLista(modulo: Modulo, lista: Registro[]): void {
    // A validação acima garante os campos de cada entidade antes desta fronteira de armazenamento.
    this.dados.update((atual) => ({ ...atual, [modulo]: lista }) as DadosClinica);
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(this.dados()));
    } catch {
      this.avisoArmazenamento.set(
        'O navegador não permitiu persistir os exemplos. Os dados continuam disponíveis enquanto esta página estiver aberta.',
      );
    }
  }
  private validar(modulo: Modulo, dados: Record<string, ValorCampo>, anterior?: Registro): void {
    const texto = (campo: string) => String(dados[campo] ?? '');
    const tamanho = (campo: string, min: number, max: number, rotulo: string) => {
      if (texto(campo).length < min || texto(campo).length > max)
        throw new Error(`${rotulo}: use de ${min} a ${max} caracteres.`);
    };
    const unico = (campo: string, rotulo: string) => {
      if (
        this.dados()[modulo].some(
          (r) => r._id !== anterior?._id && normalizar(r[campo]) === normalizar(dados[campo]),
        )
      )
        throw new Error(`Já existe um cadastro com este ${rotulo}.`);
    };
    const referencia = (campo: string, tipo: Modulo, obrigatoria = true) => {
      const id = texto(campo);
      if (!id && !obrigatoria) return;
      if (
        !this.dados()[tipo].some(
          (r) => r._id === id && (r['ativo'] !== false || anterior?.[campo] === id),
        )
      )
        throw new Error(`Selecione um cadastro válido em ${campo}.`);
    };
    const numero = (campo: string, min: number, max: number, inteiro = false) => {
      const n = Number(dados[campo]);
      if (
        dados[campo] === '' ||
        dados[campo] == null ||
        !Number.isFinite(n) ||
        n < min ||
        n > max ||
        (inteiro && !Number.isInteger(n))
      )
        throw new Error(`Confira o valor de ${campo}.`);
      dados[campo] = n;
    };
    if (modulo !== 'consultas')
      tamanho(
        'nome',
        3,
        modulo === 'especialidades' ? 50 : modulo === 'convenios' ? 60 : 80,
        'Nome',
      );
    if (modulo === 'pacientes' || modulo === 'profissionais') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto('email')))
        throw new Error('Informe um e-mail válido.');
      if (!telefoneValido(texto('telefone')))
        throw new Error('Informe um telefone válido com DDD.');
      unico('email', 'e-mail');
    }
    if (modulo === 'pacientes') {
      const nascimento = texto('dataNascimento');
      const hoje = new Date();
      const data = new Date(`${nascimento}T12:00:00`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(nascimento) ||
        !Number.isFinite(data.getTime()) ||
        nascimento >
          `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
      )
        throw new Error('A data de nascimento deve ser válida e não pode estar no futuro.');
      referencia('convenio', 'convenios', false);
    }
    if (modulo === 'profissionais') {
      tamanho('registro', 4, 20, 'Registro profissional');
      unico('registro', 'registro profissional');
      referencia('especialidade', 'especialidades');
    }
    if (modulo === 'especialidades') {
      unico('nome', 'nome');
      tamanho('descricao', 0, 300, 'Descrição');
      numero('duracaoConsultaMin', 15, 120, true);
      numero('valorParticular', 0, Number.MAX_SAFE_INTEGER);
    }
    if (modulo === 'convenios') {
      unico('nome', 'nome');
      if (!/^\d{6}$/.test(texto('codigoAns')))
        throw new Error('O código ANS deve ter exatamente 6 dígitos.');
      unico('codigoAns', 'código ANS');
      numero('percentualCobertura', 0, 100, true);
      if (texto('telefone') && !telefoneValido(texto('telefone')))
        throw new Error('Informe um telefone válido com DDD.');
    }
    if (modulo === 'consultas') {
      if (anterior && !['marcada', 'confirmada'].includes(String(anterior['status'])))
        throw new Error('Consultas encerradas não podem ser editadas.');
      referencia('paciente', 'pacientes');
      referencia('profissional', 'profissionais');
      tamanho('motivo', 0, 300, 'Motivo');
      const data = new Date(texto('dataHora'));
      if (!Number.isFinite(data.getTime()) || data.getTime() <= Date.now())
        throw new Error('Escolha uma data e hora no futuro.');
      if (
        data.getDay() === 0 ||
        data.getDay() === 6 ||
        data.getHours() < 8 ||
        data.getHours() >= 18
      )
        throw new Error('A clínica atende de segunda a sexta, das 8h às 18h.');
      dados['dataHora'] = data.toISOString();
      if (
        this.dados().consultas.some(
          (c) =>
            c._id !== anterior?._id &&
            c.status !== 'cancelada' &&
            c.profissional === texto('profissional') &&
            c.dataHora === dados['dataHora'],
        )
      )
        throw new Error('O profissional já tem uma consulta neste horário.');
    }
  }
  private ler(): DadosClinica {
    try {
      const salvo: unknown = JSON.parse(sessionStorage.getItem(CHAVE) ?? 'null');
      if (
        salvo &&
        typeof salvo === 'object' &&
        ['pacientes', 'profissionais', 'consultas', 'especialidades', 'convenios'].every((k) =>
          Array.isArray((salvo as Record<string, unknown>)[k]),
        )
      )
        return salvo as DadosClinica;
    } catch {
      /* Sem armazenamento, a demonstração continua em memória. */
    }
    return exemplos();
  }
}
