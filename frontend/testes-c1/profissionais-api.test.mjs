import assert from 'node:assert/strict';
import { test } from 'node:test';
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
const { Injector, runInInjectionContext } = await import('@angular/core');
const { HttpClient, HttpErrorResponse } = await import('@angular/common/http');
const { of, throwError, firstValueFrom } = await import('rxjs');
const { ProfissionaisApiService } = await import(
  moduloTs(path.join(raiz, 'profissionais/services/profissionais-api.service.ts'))
);
const { ProfissionaisCatalogoService } = await import(
  moduloTs(path.join(raiz, 'profissionais/services/profissionais-catalogo.service.ts'))
);
const { ProfissionaisService } = await import(
  moduloTs(path.join(raiz, 'profissionais/services/profissionais.service.ts'))
);
const item = {
  _id: '665f1c2b9a1e4b0012345680',
  nome: 'Dra. Ana Lima',
  registro: 'DEMO-010',
  especialidade: { _id: '665f1c2b9a1e4b0012345678', nome: 'Cardiologia' },
  email: 'ana@example.com',
  telefone: '(51) 99999-1234',
  ativo: true,
};
function criar(http, providers = []) {
  const injector = Injector.create({
    providers: [{ provide: HttpClient, useValue: http }, ...providers],
  });
  return {
    injector,
    service: runInInjectionContext(injector, () => new ProfissionaisApiService()),
  };
}
test('API traduz os filtros do C1 e conserva o ID real da referência', async () => {
  let parametros;
  const { service, injector } = criar({
    get: (url, options) => {
      assert.ok(url.endsWith('/profissionais'));
      parametros = options.params;
      return of({ sucesso: true, dados: [item] });
    },
  });
  const lista = await firstValueFrom(service.listar({ busca: ' Ana ', mostrarInativos: true }));
  assert.equal(parametros.get('busca'), 'Ana');
  assert.equal(parametros.get('todos'), 'true');
  assert.equal(lista[0]['especialidade'], item.especialidade._id);
  assert.equal(lista[0]['nomeEspecialidade'], 'Cardiologia');
  injector.destroy();
});
test('API envia POST e PATCH e aceita DELETE 204 sem envelope', async () => {
  const chamadas = [];
  const http = Object.fromEntries(
    ['post', 'patch', 'delete'].map((metodo) => [
      metodo,
      (url, dados) => {
        chamadas.push({ metodo, url, dados });
        return of(metodo === 'delete' ? undefined : { sucesso: true, dados: item });
      },
    ]),
  );
  const { service, injector } = criar(http);
  const entrada = { nome: item.nome, especialidade: item.especialidade._id };
  assert.equal((await firstValueFrom(service.criar(entrada)))._id, item._id);
  await firstValueFrom(service.atualizar(item._id, entrada));
  assert.equal(await firstValueFrom(service.remover(item._id)), undefined);
  assert.deepEqual(
    chamadas.map((c) => c.metodo),
    ['post', 'patch', 'delete'],
  );
  assert.equal(chamadas[1].url.split('/').pop(), item._id);
  assert.deepEqual(chamadas[0].dados, entrada);
  injector.destroy();
});
test('API mantém as mensagens de validação e conflito para a view', async () => {
  for (const [status, message, esperado] of [
    [400, ['Nome inválido', 'Telefone inválido'], 'Nome inválido · Telefone inválido'],
    [409, 'Registro duplicado', 'Registro duplicado'],
  ]) {
    const { service, injector } = criar({
      get: () => throwError(() => new HttpErrorResponse({ status, error: { message } })),
    });
    await assert.rejects(firstValueFrom(service.listar()), (e) => e.message === esperado);
    injector.destroy();
  }
});
test('API indisponível informa erro de conexão e permite repetir', async () => {
  let chamadas = 0;
  const { service, injector } = criar({
    get: () =>
      ++chamadas === 1
        ? throwError(() => new HttpErrorResponse({ status: 0 }))
        : of({ sucesso: true, dados: [] }),
  });
  await assert.rejects(firstValueFrom(service.listar()), /Não foi possível conectar à API/);
  assert.deepEqual(await firstValueFrom(service.listar()), []);
  injector.destroy();
});
test('Catálogo carrega especialidades reais e usa os IDs no formulário e no site', async () => {
  const { injector } = criar({ get: () => of({ sucesso: true, dados: [item.especialidade] }) }, [
    {
      provide: ProfissionaisService,
      useValue: { listar: () => of([{ ...item, especialidade: item.especialidade._id }]) },
    },
  ]);
  const catalogo = runInInjectionContext(injector, () => new ProfissionaisCatalogoService());
  await firstValueFrom(catalogo.carregarEquipe());
  assert.deepEqual(catalogo.opcoes('especialidades'), [
    { id: item.especialidade._id, nome: 'Cardiologia' },
  ]);
  assert.equal(catalogo.profissionais()[0].especialidade, item.especialidade._id);
  assert.equal(catalogo.nome('especialidades', item.especialidade._id), 'Cardiologia');
  assert.equal(catalogo.carregando(), false);
  assert.equal(catalogo.erro(), '');
  catalogo.registrarAtual({
    _id: item._id,
    especialidade: '665f1c2b9a1e4b0012345799',
    nomeEspecialidade: 'Especialidade anterior',
  });
  assert.equal(
    catalogo.opcoes('especialidades').find((e) => e.id.endsWith('5799')).nome,
    'Especialidade anterior (inativa)',
  );
  injector.destroy();
});
