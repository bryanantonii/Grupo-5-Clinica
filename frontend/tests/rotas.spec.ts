import '@angular/compiler';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { DOCUMENT } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { ActivatedRouteSnapshot, provideRouter, Router } from '@angular/router';
import { routes } from '../src/app/app.routes';
import { AuthService } from '../src/app/core/auth/auth.service';
import { PacienteAuthService } from '../src/app/core/auth/paciente-auth.service';
import { ClinoraService } from '../src/app/features/clinora/clinora.service';
import { of, throwError } from 'rxjs';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
let router: Router;
let logado = true;
let perfil = 'admin';
let pacienteLogado = false;
let contaDisponivel = true;
beforeEach(() => {
  pacienteLogado = false;
  contaDisponivel = true;
  logado = true;
  perfil = 'admin';
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      provideLocationMocks(),
      { provide: AuthService, useValue: { estaAutenticado: () => logado, usuario: () => ({perfil}), administrador: () => perfil === 'admin' } },
      { provide: PacienteAuthService, useValue: { token: () => pacienteLogado ? 'jwt-paciente' : null, carregar: () => contaDisponivel ? of({nome:'Paciente Teste',email:'paciente@example.com',telefone:''}) : throwError(() => new Error('Conta indisponível')) } },
      { provide: ClinoraService, useValue: { entrar: () => {} } },
      { provide: DOCUMENT, useValue: {} },
      { provide: Title, useValue: { getTitle: () => '', setTitle: () => {} } },
    ],
  });
  router = TestBed.inject(Router);
});
afterEach(() => TestBed.resetTestingModule());

function destino(): ActivatedRouteSnapshot {
  let atual = router.routerState.snapshot.root;
  while (atual.firstChild) atual = atual.firstChild;
  return atual;
}

const id = '665f1c2b9a1e4b0012345680';
for (const modulo of ['pacientes', 'profissionais', 'consultas', 'especialidades', 'convenios']) {
  for (const sufixo of ['', '/cadastrar', `/editar/${id}`]) {
    const url = `/gestao/${modulo}${sufixo}`;
    test(`navega para ${url}`, async () => {
      assert.equal(await router.navigateByUrl(url), true);
      assert.equal(router.url, url);
      assert.equal(destino().data['config'].modulo, modulo);
      if (sufixo.startsWith('/editar/')) assert.equal(destino().params['id'], id);
    });
  }
}

for (const [origem, destinoEsperado] of [
  ['/profissionais/gerenciar', '/gestao/profissionais'],
  ['/profissionais/novo', '/gestao/profissionais/cadastrar'],
  [`/profissionais/${id}/editar`, `/gestao/profissionais/editar/${id}`],
]) {
  test(`redireciona ${origem} conservando os parâmetros`, async () => {
    await router.navigateByUrl(origem);
    assert.equal(router.url, destinoEsperado);
    if (origem.includes(id)) assert.equal(destino().params['id'], id);
  });
}

for (const url of ['/produtos', '/produtos/novo', `/produtos/${id}/editar`, '/gestao/produtos']) {
  test(`trata ${url} como página não encontrada`, async () => {
    await router.navigateByUrl(url);
    assert.equal(destino().routeConfig?.path, '**');
    assert.equal(destino().data['etiqueta'], 'Página não encontrada');
  });
}

test('acesso da equipe e relatórios usam o layout de gestão', async () => {
  await router.navigateByUrl('/gestao');
  assert.equal(destino().data['inicio'], true);
  await router.navigateByUrl('/gestao/relatorios');
  assert.equal(destino().title, 'Relatórios | Clinora');
});

test('gestão sem sessão leva ao login e conserva o endereço solicitado', async () => {
  logado = false;
  await router.navigateByUrl('/gestao/pacientes');
  assert.equal(destino().routeConfig?.path, 'login');
  assert.equal(destino().queryParams['retorno'], '/gestao/pacientes');
});

test('atendente navega nos cadastros e não acessa relatórios pelo endereço', async () => {
  perfil = 'atendente';
  await router.navigateByUrl('/gestao/convenios');
  assert.equal(destino().data['config'].modulo, 'convenios');
  await router.navigateByUrl('/gestao/relatorios');
  assert.equal(destino().routeConfig?.path, 'sem-permissao');
});

test('sessão perdida é conferida também ao navegar entre filhos da gestão', async () => {
  await router.navigateByUrl('/gestao/pacientes');
  logado = false;
  await router.navigateByUrl('/gestao/profissionais');
  assert.equal(destino().routeConfig?.path, 'login');
});

test('login da equipe e catálogo público não exigem sessão', async () => {
  logado = false;
  await router.navigateByUrl('/login');
  assert.equal(destino().routeConfig?.path, 'login');
  await router.navigateByUrl('/profissionais');
  assert.equal(destino().routeConfig?.path, 'profissionais');
});

for (const url of ['/minha-area', '/meus-dados', '/confirmar-email']) {
  test(`conta sem sessão não abre ${url}`, async () => {
    await router.navigateByUrl(url);
    assert.equal(destino().routeConfig?.path, 'entrar');
  });
}
test('paciente autenticado acessa Meus dados após confirmação no servidor', async () => {
  pacienteLogado = true;
  await router.navigateByUrl('/meus-dados');
  assert.equal(destino().routeConfig?.path, 'meus-dados');
});
test('token em cache não libera a área quando a conta é recusada pelo servidor', async () => {
  pacienteLogado = true;
  contaDisponivel = false;
  await router.navigateByUrl('/minha-area');
  assert.equal(destino().routeConfig?.path, 'entrar');
});
