import '@angular/compiler';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injector, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { firstValueFrom, of, throwError } from 'rxjs';
import { criarFormularioAcesso } from '../src/app/features/clinora/acesso.formulario';
import { ClinoraService } from '../src/app/features/clinora/clinora.service';
import { Consulta, AgendamentoEntrada } from '../src/app/features/clinora/clinora.models';
import { PacienteAuthService, ContaPaciente } from '../src/app/core/auth/paciente-auth.service';
import { ProfissionaisCatalogoService } from '../src/app/features/profissionais/services/profissionais-catalogo.service';
import { dataHoraFutura } from '../src/app/shared/form-validadores';
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
let clinora: ClinoraService;
let storage: MemoriaStorage;
let falha: HttpErrorResponse | null;
let requisicoes: { metodo: string; url: string; corpo?: Record<string, unknown> }[];
const usuario = signal<ContaPaciente | null>(null);
const profissional = '665f1c2b9a1e4b0012345680';
const especialidade = '665f1c2b9a1e4b0012345678';
const dados = (): AgendamentoEntrada => ({
  profissional,
  especialidade,
  data: '2099-12-20',
  horario: '08:00',
  convenio: null,
  telefone: '(51) 99999-9999',
  dataNascimento: '2000-01-01',
  ciente: true,
});
const resposta = (): Consulta => ({
  _id: '665f1c2b9a1e4b0012345699',
  profissional,
  profissionalNome: 'Dra. Ana',
  especialidade,
  especialidadeNome: 'Clínica geral',
  dataHora: '2099-12-20T11:00:00.000Z',
  data: '2099-12-20',
  horario: '08:00',
  convenio: 'Particular',
  convenioId: null,
  paciente: { nome: 'Ana', email: 'ana@example.com', telefone: '(51) 99999-9999' },
  status: 'marcada',
});
beforeEach(() => {
  storage = new MemoriaStorage();
  falha = null;
  requisicoes = [];
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
  usuario.set({
    _id: '665f1c2b9a1e4b0012345610',
    nome: 'Ana Portal',
    email: 'ana@example.com',
    perfil: 'paciente',
    telefone: '(51) 99999-9999',
  });
  injector = Injector.create({
    providers: [
      { provide: PacienteAuthService, useValue: { usuario, sair: () => usuario.set(null) } },
      {
        provide: HttpClient,
        useValue: {
          get: (url: string) => {
            requisicoes.push({ metodo: 'GET', url });
            return of({
              sucesso: true,
              dados: url.endsWith('/conta/consultas') ? [resposta()] : resposta(),
            });
          },
          post: (url: string, corpo: Record<string, unknown>) => {
            requisicoes.push({ metodo: 'POST', url, corpo });
            return falha ? throwError(() => falha) : of({ sucesso: true, dados: resposta() });
          },
          patch: (url: string) => {
            requisicoes.push({ metodo: 'PATCH', url });
            return falha
              ? throwError(() => falha)
              : of({ sucesso: true, dados: { ...resposta(), status: 'cancelada' } });
          },
        },
      },
      {
        provide: ProfissionaisCatalogoService,
        useValue: {
          profissionais: signal([{ _id: profissional, especialidade, ativo: true }]),
          especialidades: signal([{ _id: especialidade, nome: 'Clínica geral' }]),
          convenios: signal([]),
          carregando: signal(false),
          erro: signal(''),
          carregarEquipe: () => of(undefined),
        },
      },
      { provide: ClinoraService, useFactory: () => new ClinoraService() },
    ],
  });
  clinora = injector.get(ClinoraService);
});
afterEach(() => injector.destroy());
test('login exige e-mail válido e senha com oito caracteres', () => {
  const form = criarFormularioAcesso(new FormBuilder(), 'entrar');
  form.patchValue({ email: 'invalido', senha: '123' });
  assert.equal(form.invalid, true);
  form.patchValue({ email: 'teste@example.com', senha: 'senha123' });
  assert.equal(form.valid, true);
});

test('senha respeita o limite de 72 bytes inclusive com caracteres acentuados', () => {
  const form = criarFormularioAcesso(new FormBuilder(), 'cadastro');
  form.controls.senha.setValue('á'.repeat(37));
  assert.equal(form.controls.senha.hasError('limiteBcrypt'), true);
  form.controls.senha.setValue('á'.repeat(36));
  assert.equal(form.controls.senha.valid, true);
});
test('cadastro exige confirmação de senha e ciência do uso de dados fictícios', () => {
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

test('portal usa o catálogo compartilhado sem instanciar cadastros mock', async () => {
  await firstValueFrom(clinora.carregarEquipe());
  assert.equal(clinora.profissional(profissional)?.especialidade, especialidade);
  assert.equal(clinora.especialidade(especialidade), 'Clínica geral');
});
test('agendamento envia os campos da API, preserva o ID e não grava consultas na sessão', async () => {
  const c = await firstValueFrom(
    clinora.agendar({ ...dados(), paciente: 'id-de-terceiro' } as AgendamentoEntrada),
  );
  assert.equal(c.status, 'marcada');
  assert.equal(c._id, resposta()._id);
  assert.equal(requisicoes[0].url.endsWith('/conta/consultas'), true);
  assert.equal(requisicoes[0].corpo?.['dataHora'], '2099-12-20T08:00:00-03:00');
  assert.equal('paciente' in requisicoes[0].corpo!, false);
  assert.equal(storage.getItem('clinora.consultas'), null);
});
test('recusa de profissional ou especialidade pela API não confirma agendamento', async () => {
  falha = new HttpErrorResponse({ status: 400, error: { message: 'Profissional indisponível' } });
  await assert.rejects(
    firstValueFrom(clinora.agendar(dados())),
    (e) => e instanceof HttpErrorResponse && e.status === 400,
  );
  assert.equal(clinora.consultas().length, 0);
  assert.equal(clinora.ultimaConsulta(), null);
});
test('conflito de horário retorna ao chamador sem inventar um segundo cadastro', async () => {
  await firstValueFrom(clinora.agendar(dados()));
  falha = new HttpErrorResponse({ status: 409, error: { message: 'Horário ocupado' } });
  await assert.rejects(
    firstValueFrom(clinora.agendar(dados())),
    (e) => e instanceof HttpErrorResponse && e.status === 409,
  );
  assert.equal(clinora.consultas().length, 1);
});
test('lista e detalhe são recarregados pelas rotas reais da conta', async () => {
  await firstValueFrom(clinora.carregarConsultas());
  assert.equal(clinora.consultas().length, 1);
  await firstValueFrom(clinora.carregarConsulta(resposta()._id));
  assert.equal(requisicoes[0].metodo, 'GET');
  assert.equal(requisicoes[1].url.endsWith('/' + resposta()._id), true);
  assert.equal(clinora.carregandoConsultas(), false);
});
test('cancelamento somente altera a tela após a resposta bem-sucedida da API', async () => {
  await firstValueFrom(clinora.agendar(dados()));
  falha = new HttpErrorResponse({ status: 500 });
  await assert.rejects(firstValueFrom(clinora.cancelar(resposta()._id)));
  assert.equal(clinora.consultas()[0].status, 'marcada');
  falha = null;
  await firstValueFrom(clinora.cancelar(resposta()._id));
  assert.equal(clinora.consultas()[0].status, 'cancelada');
});
test('trocar a conta não mostra consultas guardadas para o usuário anterior', async () => {
  await firstValueFrom(clinora.agendar(dados()));
  assert.equal(clinora.consultas().length, 1);
  usuario.set({ ...usuario()!, _id: '665f1c2b9a1e4b0012345611' });
  assert.equal(clinora.consultas().length, 0);
});
