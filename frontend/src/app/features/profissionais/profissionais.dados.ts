import { Profissional, ProfissionalCardDados } from './profissional.model';
import { idDe } from '../../core/models/referencia';

export const ESPECIALIDADES_DEMO = [
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

export const PROFISSIONAIS_INICIAIS: Profissional[] = [
  {
    _id: 'mariana-costa',
    nome: 'Dra. Mariana Costa',
    registro: 'DEMO-001',
    especialidade: 'clinica-geral',
    email: 'mariana.costa@example.com',
    telefone: '(51) 90000-0001',
    ativo: true,
  },
  {
    _id: 'rafael-mendes',
    nome: 'Dr. Rafael Mendes',
    registro: 'DEMO-002',
    especialidade: 'cardiologia',
    email: 'rafael.mendes@example.com',
    telefone: '(51) 90000-0002',
    ativo: true,
  },
  {
    _id: 'camila-oliveira',
    nome: 'Dra. Camila Oliveira',
    registro: 'DEMO-003',
    especialidade: 'dermatologia',
    email: 'camila.oliveira@example.com',
    telefone: '(51) 90000-0003',
    ativo: true,
  },
];

const textos: Record<string, { descricao: string; titulo: string }> = {
  'mariana-costa': {
    descricao: 'Escuta e cuidado em todas as fases da vida.',
    titulo: 'Um cuidado próximo, em cada fase da vida.',
  },
  'rafael-mendes': {
    descricao: 'Um olhar atento para a saúde do coração.',
    titulo: 'Atenção ao que faz seu coração bater.',
  },
  'camila-oliveira': {
    descricao: 'Cuidado com a pele e com o seu bem-estar.',
    titulo: 'Cuidar da sua pele também é cuidar de você.',
  },
};

/** Campos visuais ficam separados do contrato de cadastro. */
export function paraCartao(profissional: Profissional): ProfissionalCardDados {
  const palavras = profissional.nome
    .replace(/^(dra?\.?\s+)/i, '')
    .trim()
    .split(/\s+/);
  return {
    ...profissional,
    especialidade: idDe(profissional.especialidade),
    iniciais: palavras
      .slice(0, 2)
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase(),
    ...(textos[profissional._id] ?? {
      descricao: 'Atendimento com escuta, cuidado e atenção.',
      titulo: 'Cuidado próximo para a sua saúde.',
    }),
  };
}
