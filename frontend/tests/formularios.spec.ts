import { VERSION } from '@angular/compiler';
import { Injector } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { firstValueFrom } from 'rxjs';
import { criarFormularioProfissional } from '../src/app/features/profissionais/profissional-form/profissional.validadores';
import { ESPECIALIDADES_DEMO } from '../src/app/features/profissionais/profissionais.dados';
import { ProfissionaisMockService } from '../src/app/features/profissionais/services/profissionais-mock.service';
import { ErroProfissional } from '../src/app/features/profissionais/services/profissionais.service';
import { ProfissionaisStore } from '../src/app/features/profissionais/services/profissionais.store';
import { criarFormularioAcesso } from '../src/app/features/clinora/acesso.formulario';
import { ClinoraService } from '../src/app/features/clinora/clinora.service';
import { dataHoraFutura } from '../src/app/shared/form-validadores';
import { idDe } from '../src/app/core/models/referencia';

class MemoriaStorage {
  private dados = new Map<string, string>();
  getItem(chave: string) {
    return this.dados.get(chave) ?? null;
  }
  setItem(chave: string, valor: string) {
    this.dados.set(chave, valor);
  }
  removeItem(chave: string) {
    this.dados.delete(chave);
  }
}
let injector: ReturnType<typeof Injector.create>;
let storage: MemoriaStorage;
let service: ProfissionaisMockService;
let store: ProfissionaisStore;
beforeEach(() => {
  storage = new MemoriaStorage();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
  injector = Injector.create({
    providers: [ProfissionaisStore, ProfissionaisMockService, ClinoraService],
  });
  service = injector.get(ProfissionaisMockService);
  store = injector.get(ProfissionaisStore);
});
afterEach(() => injector.destroy());
const valido = () => ({
  nome: 'Dra. Ana Lima',
  registro: 'crm-rs 45678',
  especialidade: 'clinica-geral',
  email: 'ana.lima@example.com',
  telefone: '(51) 99876-5432',
});
const formulario = () => criarFormularioProfissional(new FormBuilder(), () => ESPECIALIDADES_DEMO);

test('usa o Angular do projeto', () => assert.equal(VERSION.major, '21'));
test('começa inválido, com cinco campos obrigatórios ainda não tocados', () => {
  const form = formulario();
  assert.equal(form.invalid, true);
  assert.equal(form.untouched, true);
  for (const c of Object.values(form.controls)) assert.equal(c.hasError('required'), true);
});
for (const [campo, valor] of [
  ['nome', 'An'],
  ['nome', 'N'.repeat(81)],
  ['nome', '   '],
  ['registro', 'CRM'],
  ['registro', 'R'.repeat(21)],
  ['registro', '    '],
  ['email', 'invalido'],
  ['telefone', '51999999999'],
  ['especialidade', 'inexistente'],
] as const) {
  test(
    'rejeita ' + campo + ': ' + (valor.length > 25 ? 'acima do limite' : JSON.stringify(valor)),
    () => {
      const form = formulario();
      form.setValue(valido());
      form.controls[campo].setValue(valor);
      assert.equal(form.controls[campo].invalid, true);
      assert.equal(form.invalid, true);
    },
  );
}
test('aceita os limites mínimos e máximos de nome e registro', () => {
  const form = formulario();
  form.setValue(valido());
  for (const [nome, registro] of [
    ['Ana', 'ABCD'],
    ['N'.repeat(80), 'R'.repeat(20)],
  ]) {
    form.patchValue({ nome, registro });
    assert.equal(form.valid, true);
  }
});
test('aceita telefone fixo e celular com DDD', () => {
  const form = formulario();
  form.setValue(valido());
  for (const telefone of ['(51) 9999-9999', '(51) 99999-9999']) {
    form.controls.telefone.setValue(telefone);
    assert.equal(form.valid, true);
  }
});
test('touched e dirty são independentes da validade e reset restaura o estado', () => {
  const form = formulario();
  const nome = form.controls.nome;
  nome.markAsTouched();
  assert.equal(nome.touched, true);
  assert.equal(nome.dirty, false);
  nome.markAsDirty();
  assert.equal(nome.dirty, true);
  assert.equal(nome.invalid, true);
  form.setValue(valido());
  assert.equal(form.valid, true);
  form.reset();
  assert.equal(form.pristine, true);
  assert.equal(form.untouched, true);
});
test('referência preenchida é convertida em ID para editar', () => {
  const form = formulario();
  form.setValue({ ...valido(), especialidade: idDe({ _id: 'cardiologia', nome: 'Cardiologia' }) });
  assert.equal(form.controls.especialidade.value, 'cardiologia');
  assert.equal(form.valid, true);
});
test('mock rejeita um estado que não seja booleano', async () => {
  await assert.rejects(
    firstValueFrom(service.atualizar('mariana-costa', { ativo: 'pendente' as never })),
    (e: unknown) => e instanceof ErroProfissional && e.campo === 'ativo',
  );
});
test('mock possui três registros e devolve cópias', async () => {
  const lista = await firstValueFrom(service.listar());
  assert.equal(lista.length, 3);
  lista[0].nome = 'Alterado fora do serviço';
  assert.equal(store.profissionais()[0].nome, 'Dra. Mariana Costa');
});
test('cadastro normaliza os campos, ativa o registro e persiste na sessão', async () => {
  const p = await firstValueFrom(service.criar({ ...valido(), email: 'ANA.LIMA@EXAMPLE.COM' }));
  assert.equal(p.registro, 'CRM-RS 45678');
  assert.equal(p.email, 'ana.lima@example.com');
  assert.equal(p.ativo, true);
  assert.equal(store.profissionais().length, 4);
  assert.equal(new ProfissionaisStore().profissionais().length, 4);
});
test('rejeita registro duplicado sem diferenciar maiúsculas', async () => {
  await assert.rejects(
    firstValueFrom(service.criar({ ...valido(), registro: ' demo-001 ' })),
    (e: unknown) => e instanceof ErroProfissional && e.campo === 'registro',
  );
  assert.equal(store.profissionais().length, 3);
});
test('rejeita e-mail duplicado sem diferenciar maiúsculas', async () => {
  await assert.rejects(
    firstValueFrom(service.criar({ ...valido(), email: 'MARIANA.COSTA@EXAMPLE.COM' })),
    (e: unknown) => e instanceof ErroProfissional && e.campo === 'email',
  );
});
test('mock também rejeita especialidade inexistente e campos inválidos', async () => {
  for (const dados of [
    { ...valido(), especialidade: 'inexistente' },
    { ...valido(), nome: ' ' },
  ])
    await assert.rejects(firstValueFrom(service.criar(dados)), ErroProfissional);
});
test('editar mantém ID e o próprio registro sem acusar duplicidade', async () => {
  const p = await firstValueFrom(
    service.atualizar('mariana-costa', { nome: 'Dra. Mariana Souza' }),
  );
  assert.equal(p._id, 'mariana-costa');
  assert.equal(p.registro, 'DEMO-001');
  assert.equal(p.nome, 'Dra. Mariana Souza');
  assert.equal(store.profissionais().length, 3);
});
test('editar não permite copiar o registro de outro profissional', async () => {
  await assert.rejects(
    firstValueFrom(service.atualizar('mariana-costa', { registro: 'DEMO-002' })),
    (e: unknown) => e instanceof ErroProfissional && e.campo === 'registro',
  );
});
test('busca e edição de ID inexistente devolvem erro', async () => {
  await assert.rejects(firstValueFrom(service.buscarPorId('inexistente')), /não encontrado/);
  await assert.rejects(
    firstValueFrom(service.atualizar('inexistente', { nome: 'Nome válido' })),
    /não encontrado/,
  );
});
test('inativar conserva o registro e retira o item da lista ativa', async () => {
  await firstValueFrom(service.remover('mariana-costa'));
  assert.equal((await firstValueFrom(service.listar())).length, 2);
  assert.equal((await firstValueFrom(service.listar({ todos: true }))).length, 3);
  assert.equal((await firstValueFrom(service.buscarPorId('mariana-costa'))).ativo, false);
});
test('busca normaliza acentos e respeita a especialidade', async () => {
  assert.equal((await firstValueFrom(service.listar({ busca: 'CLINICA' }))).length, 1);
  assert.equal(
    (await firstValueFrom(service.listar({ busca: 'RAFAEL', especialidade: 'dermatologia' })))
      .length,
    0,
  );
});
test('falha ao persistir não confirma cadastro que não foi salvo', async () => {
  storage.setItem = () => {
    throw new Error('Quota');
  };
  await assert.rejects(firstValueFrom(service.criar(valido())), /Não foi possível salvar/);
  assert.equal(store.profissionais().length, 3);
});
test('sessão corrompida restaura os dados demonstrativos', () => {
  storage.setItem('clinora.profissionais', 'json-invalido');
  assert.equal(new ProfissionaisStore().profissionais().length, 3);
});
test('login exige e-mail válido e senha com oito caracteres', () => {
  const form = criarFormularioAcesso(new FormBuilder(), 'entrar');
  form.patchValue({ email: 'invalido', senha: '123' });
  assert.equal(form.invalid, true);
  form.patchValue({ email: 'teste@example.com', senha: 'senha123' });
  assert.equal(form.valid, true);
});
test('cadastro exige confirmação de senha e ciência da demonstração', () => {
  const form = criarFormularioAcesso(new FormBuilder(), 'cadastro');
  form.patchValue({ nome: 'Ana Lima', email: 'ana@example.com', senha: 'senha123', ciente: true });
  assert.equal(form.controls.confirmar.hasError('required'), true);
  assert.equal(form.invalid, true);
  form.controls.confirmar.setValue('outra123');
  assert.equal(form.hasError('senhasDiferentes'), true);
  form.controls.confirmar.setValue('senha123');
  assert.equal(form.valid, true);
  form.controls.ciente.setValue(false);
  assert.equal(form.invalid, true);
});
test('cadastro rejeita nome composto apenas de espaços', () => {
  const form = criarFormularioAcesso(new FormBuilder(), 'cadastro');
  form.patchValue({
    nome: '   ',
    email: 'ana@example.com',
    senha: 'senha123',
    confirmar: 'senha123',
    ciente: true,
  });
  assert.equal(form.controls.nome.invalid, true);
});
test('recuperação pede somente e-mail; nova senha pede confirmação', () => {
  const recuperar = criarFormularioAcesso(new FormBuilder(), 'recuperar');
  recuperar.controls.email.setValue('ana@example.com');
  assert.equal(recuperar.valid, true);
  const nova = criarFormularioAcesso(new FormBuilder(), 'nova-senha');
  nova.controls.senha.setValue('senha123');
  assert.equal(nova.invalid, true);
  nova.controls.confirmar.setValue('senha123');
  assert.equal(nova.valid, true);
});
test('data e hora precisam existir e estar no futuro', () => {
  const agora = new Date(2026, 9, 26, 12);
  assert.equal(dataHoraFutura('2026-10-27', '09:00', agora), true);
  assert.equal(dataHoraFutura('2026-10-26', '11:00', agora), false);
  assert.equal(dataHoraFutura('2027-02-30', '09:00', agora), false);
  assert.equal(dataHoraFutura('2026-10-27', '25:00', agora), false);
});
test('agendamento não aceita profissional inativo ou referência incompatível', async () => {
  const clinora = injector.get(ClinoraService);
  const dados = {
    profissional: 'mariana-costa',
    especialidade: 'cardiologia',
    data: '2099-12-20',
    horario: '09:00',
    convenio: 'Particular',
    paciente: { nome: 'Ana Lima', email: 'ana@example.com', telefone: '(51) 99999-9999' },
  };
  assert.throws(() => clinora.agendar(dados), /profissional disponível/);
  await firstValueFrom(service.remover('mariana-costa'));
  assert.throws(
    () => clinora.agendar({ ...dados, especialidade: 'clinica-geral' }),
    /profissional disponível/,
  );
});
