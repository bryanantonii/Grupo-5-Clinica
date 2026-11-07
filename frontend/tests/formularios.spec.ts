import '@angular/compiler';
import { computed, inject, Injector, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { firstValueFrom, of } from 'rxjs';
import { criarFormularioAcesso } from '../src/app/features/clinora/acesso.formulario';
import { ClinoraService } from '../src/app/features/clinora/clinora.service';
import { ProfissionaisCatalogoService } from '../src/app/features/profissionais/services/profissionais-catalogo.service';
import { ClinicaMockStore } from '../src/app/features/gestao/services/clinica-mock.store';
import { dataHoraFutura } from '../src/app/shared/form-validadores';

class MemoriaStorage {
  private dados = new Map<string, string>();
  getItem(chave: string) { return this.dados.get(chave) ?? null; }
  setItem(chave: string, valor: string) { this.dados.set(chave, valor); }
  removeItem(chave: string) { this.dados.delete(chave); }
}
let injector: ReturnType<typeof Injector.create>;
let storage: MemoriaStorage;
let store: ClinicaMockStore;
let clinora: ClinoraService;
beforeEach(() => {
  storage = new MemoriaStorage();
  Object.defineProperty(globalThis, 'sessionStorage', {configurable: true, value: storage});
  injector = Injector.create({providers: [
    {provide: ClinicaMockStore, useFactory: () => new ClinicaMockStore()},
    {provide: ProfissionaisCatalogoService, useFactory: () => {
      const cadastros = inject(ClinicaMockStore);
      return {
        profissionais: computed(() => cadastros.profissionais().filter(p => p.ativo)),
        especialidades: computed(() => cadastros.especialidades().filter(e => e.ativo)),
        carregando: signal(false), erro: signal(''), carregarEquipe: () => of(undefined),
      };
    }},
    {provide: ClinoraService, useFactory: () => new ClinoraService()},
  ]});
  store = injector.get(ClinicaMockStore);
  clinora = injector.get(ClinoraService);
});
afterEach(() => injector.destroy());
const dados = () => ({
  profissional: 'mariana-costa', especialidade: 'clinica-geral',
  data: '2099-12-20', horario: '09:00', convenio: 'Particular',
  paciente: {nome: 'Ana Lima', email: 'ana@example.com', telefone: '(51) 99999-9999'},
});

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

test('agendamento usa o catálogo carregado pela integração HTTP', async () => {
  await firstValueFrom(clinora.carregarEquipe());
  assert.equal(clinora.profissionais.length, 3);
  assert.equal(clinora.profissional('mariana-costa')?.especialidade, 'clinica-geral');
  assert.equal(clinora.especialidade('cardiologia'), 'Cardiologia');
});
test('agendamento rejeita profissional inativo ou especialidade incompatível', () => {
  assert.throws(() => clinora.agendar({...dados(), especialidade: 'cardiologia'}), /profissional disponível/);
  store.remover('profissionais', 'mariana-costa');
  assert.throws(() => clinora.agendar(dados()), /profissional disponível/);
});
test('agendamento rejeita data passada antes de gravar na sessão', () => {
  assert.throws(() => clinora.agendar({...dados(), data: '2000-01-01'}), /futuros/);
  assert.equal(storage.getItem('clinora.consultas'), null);
});
test('agendamento conserva o ID do catálogo e evita reservar duas vezes', () => {
  const consulta = clinora.agendar(dados());
  assert.equal(consulta.profissional, 'mariana-costa');
  assert.equal(consulta.status, 'confirmada');
  assert.throws(() => clinora.agendar(dados()), /reservado/);
});
