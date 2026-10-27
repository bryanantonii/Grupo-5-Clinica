import assert from 'node:assert/strict';
import { test, beforeEach } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const require = createRequire(import.meta.url);
await import(pathToFileURL(require.resolve('@angular/compiler')).href);
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/app/features');
const cache = new Map();
function moduloTs(arquivo) {
  if (cache.has(arquivo)) return cache.get(arquivo);
  let codigo = ts.transpileModule(fs.readFileSync(arquivo, 'utf8'), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      experimentalDecorators: true,
    },
  }).outputText;
  codigo = codigo.replace(/from (['"])([^'"]+)\1/g, (_, aspas, nome) => {
    const url = nome.startsWith('.')
      ? moduloTs(path.resolve(path.dirname(arquivo), `${nome}.ts`))
      : pathToFileURL(require.resolve(nome)).href;
    return `from ${JSON.stringify(url)}`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`;
  cache.set(arquivo, url);
  return url;
}
const { ClinicaMockStore } = await import(
  moduloTs(path.join(raiz, 'gestao/services/clinica-mock.store.ts'))
);
const { calcularRelatorio } = await import(
  moduloTs(path.join(raiz, 'relatorios/relatorios.service.ts'))
);
const armazenamento = new Map();
globalThis.sessionStorage = {
  getItem: (k) => armazenamento.get(k) ?? null,
  setItem: (k, v) => armazenamento.set(k, String(v)),
};
let store;
beforeEach(() => {
  armazenamento.clear();
  store = new ClinicaMockStore();
});
const paciente = {
  nome: 'Teste C1',
  email: 'teste@example.com',
  telefone: '(51) 99999-8888',
  dataNascimento: '2000-01-10',
  convenio: '',
};
function futuro(hora = 15, dias = 10) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  while ([0, 6].includes(d.getDay())) d.setDate(d.getDate() + 1);
  return d.toISOString();
}
const consulta = () => ({
  paciente: 'ana-silva',
  profissional: 'mariana-costa',
  dataHora: futuro(),
  motivo: 'Teste de agenda',
});

test('os cinco módulos começam com pelo menos três exemplos', () => {
  for (const modulo of ['pacientes', 'profissionais', 'consultas', 'especialidades', 'convenios'])
    assert.ok(store.listar(modulo).length >= 3);
});
test('paciente é criado, atualizado e encontrado pelo id', () => {
  const novo = store.salvar('pacientes', paciente);
  store.salvar('pacientes', { ...paciente, nome: 'Paciente atualizado' }, novo._id);
  assert.equal(store.buscar('pacientes', novo._id).nome, 'Paciente atualizado');
});
test('busca ignora maiúsculas e acentos', () =>
  assert.equal(store.listar('especialidades', { busca: 'CLINICA' }).length, 1));
test('e-mail de paciente deve ser único mesmo com caixa diferente', () => {
  store.salvar('pacientes', paciente);
  assert.throws(
    () => store.salvar('pacientes', { ...paciente, email: 'TESTE@EXAMPLE.COM' }),
    /e-mail/,
  );
});
test('nascimento futuro e nome em branco são recusados', () => {
  assert.throws(
    () => store.salvar('pacientes', { ...paciente, dataNascimento: '2999-01-01' }),
    /nascimento/,
  );
  assert.throws(() => store.salvar('pacientes', { ...paciente, nome: '   ' }), /Nome/);
});
test('profissional exige especialidade existente e registro único', () => {
  const p = {
    nome: 'Profissional Teste',
    registro: 'demo-001',
    especialidade: 'cardiologia',
    email: 'p@example.com',
    telefone: '(51) 99999-7777',
  };
  assert.throws(() => store.salvar('profissionais', p), /registro profissional/);
  assert.throws(
    () =>
      store.salvar('profissionais', { ...p, registro: 'CRM-99999', especialidade: 'inexistente' }),
    /especialidade/,
  );
});
test('especialidade exige duração inteira de 15 a 120 e valor não negativo', () => {
  const e = {
    nome: 'Especialidade Teste',
    descricao: '',
    duracaoConsultaMin: 14,
    valorParticular: 0,
  };
  assert.throws(() => store.salvar('especialidades', e), /duracao/);
  assert.throws(
    () => store.salvar('especialidades', { ...e, duracaoConsultaMin: 30, valorParticular: -1 }),
    /valorParticular/,
  );
  assert.throws(
    () => store.salvar('especialidades', { ...e, duracaoConsultaMin: 30.5 }),
    /duracao/,
  );
});
test('convênio preserva zeros do código ANS e valida cobertura', () => {
  const c = { nome: 'Plano Teste', codigoAns: '001234', percentualCobertura: 0, telefone: '' };
  assert.equal(store.salvar('convenios', c).codigoAns, '001234');
  assert.throws(
    () =>
      store.salvar('convenios', {
        ...c,
        nome: 'Outro plano',
        codigoAns: '123',
        percentualCobertura: 101,
      }),
    /ANS/,
  );
  assert.throws(
    () =>
      store.salvar('convenios', {
        ...c,
        nome: 'Outro plano',
        codigoAns: '555555',
        percentualCobertura: 101,
      }),
    /percentualCobertura/,
  );
});
test('exclusão lógica preserva o cadastro e o oculta da lista padrão', () => {
  store.remover('pacientes', 'ana-silva');
  assert.equal(store.buscar('pacientes', 'ana-silva').ativo, false);
  assert.equal(store.listar('pacientes').length, 2);
  assert.equal(store.listar('pacientes', { mostrarInativos: true }).length, 3);
});
test('consulta duplicada para o mesmo profissional e horário é recusada', () => {
  const dados = consulta();
  store.salvar('consultas', dados);
  assert.throws(
    () => store.salvar('consultas', { ...dados, paciente: 'bruno-lima' }),
    /já tem uma consulta/,
  );
});
test('consulta recusa fim de semana, passado e horário fora do expediente', () => {
  const dados = consulta();
  const sabado = new Date(futuro());
  while (sabado.getDay() !== 6) sabado.setDate(sabado.getDate() + 1);
  assert.throws(
    () => store.salvar('consultas', { ...dados, dataHora: sabado.toISOString() }),
    /segunda a sexta/,
  );
  assert.throws(
    () => store.salvar('consultas', { ...dados, dataHora: '2020-01-01T10:00:00' }),
    /futuro/,
  );
  assert.throws(
    () => store.salvar('consultas', { ...dados, dataHora: futuro(19) }),
    /segunda a sexta/,
  );
});
test('status inicial e transições respeitam o fluxo definido no guia', () => {
  const nova = store.salvar('consultas', { ...consulta(), status: 'realizada' });
  assert.equal(nova.status, 'marcada');
  assert.throws(() => store.mudarStatus(nova._id, 'realizada'), /Não é possível/);
  store.mudarStatus(nova._id, 'confirmada');
  store.mudarStatus(nova._id, 'realizada');
  assert.throws(() => store.mudarStatus(nova._id, 'cancelada'), /Não é possível/);
});
test('cancelar uma consulta libera seu horário', () => {
  const dados = consulta();
  const nova = store.salvar('consultas', dados);
  store.remover('consultas', nova._id);
  assert.equal(store.buscar('consultas', nova._id).status, 'cancelada');
  assert.equal(store.salvar('consultas', dados).status, 'marcada');
});
test('erro simulado ocorre uma vez e permite tentar novamente', () => {
  store.simularFalha('pacientes');
  assert.throws(() => store.listar('pacientes'), /Tente novamente/);
  assert.equal(store.listar('pacientes').length, 3);
});
test('relatório usa os cadastros atuais e aceita coleções vazias', () => {
  const r = calcularRelatorio(store.snapshot());
  assert.deepEqual(r.resumo, { pacientes: 3, consultasMarcadas: 1, faltas: 1 });
  assert.equal(
    r.porStatus.reduce((s, i) => s + i.quantidade, 0),
    4,
  );
  assert.equal(r.porEspecialidade[0].nome, 'Dermatologia');
  const vazio = calcularRelatorio({
    pacientes: [],
    profissionais: [],
    consultas: [],
    especialidades: [],
    convenios: [],
  });
  assert.deepEqual(vazio.resumo, { pacientes: 0, consultasMarcadas: 0, faltas: 0 });
  assert.equal(vazio.porEspecialidade.length, 0);
});
test('armazenamento inválido restaura os dados de exemplo', () => {
  armazenamento.set('clinora.c1.cadastros.v1', 'json inválido');
  assert.equal(new ClinicaMockStore().listar('pacientes').length, 3);
});
