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

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
let router: Router;
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      provideLocationMocks(),
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
