import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
await import(pathToFileURL(require.resolve('@angular/compiler')).href);
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/app');
const cache = new Map();
function moduloTs(arquivo) {
  if (cache.has(arquivo)) return cache.get(arquivo);
  let codigo = ts.transpileModule(fs.readFileSync(arquivo, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, experimentalDecorators: true },
  }).outputText;
  codigo = codigo.replace(/from (['"])([^'"]+)\1/g, (_, aspas, nome) => {
    const url = nome.startsWith('.') ? moduloTs(path.resolve(path.dirname(arquivo), `${nome}.ts`)) : pathToFileURL(require.resolve(nome)).href;
    return `from ${JSON.stringify(url)}`;
  });
  const url = `data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`;
  cache.set(arquivo, url);
  return url;
}
const { Injector, runInInjectionContext } = await import('@angular/core');
const { Router } = await import('@angular/router');
const { HttpClient, HttpRequest, HttpResponse, HttpErrorResponse } = await import('@angular/common/http');
const { of, throwError, firstValueFrom, Subject } = await import('rxjs');
const { PacienteAuthService, tokenPacienteVigente, retornoPacienteSeguro } = await import(moduloTs(path.join(raiz, 'core/auth/paciente-auth.service.ts')));
const { pacienteAuthInterceptor } = await import(moduloTs(path.join(raiz, 'core/auth/paciente-auth.interceptor.ts')));
const { authInterceptor } = await import(moduloTs(path.join(raiz, 'core/auth/auth.interceptor.ts')));
const { AuthService } = await import(moduloTs(path.join(raiz, 'core/auth/auth.service.ts')));
const id = '665f1c2b9a1e4b0012345680';
const usuario = { _id: id, nome: 'Paciente Teste', email: 'paciente@example.com', perfil: 'paciente', telefone: '' };
const jwt = (extra = {}) => Buffer.from('{}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: id, perfil: 'paciente', exp: Math.floor(Date.now() / 1000) + 3600, ...extra })).toString('base64url') + '.assinatura';
let memoria, injector, navegacoes, router;
beforeEach(() => {
  injector = undefined; memoria = new Map(); navegacoes = [];
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: k => memoria.get(k) ?? null, setItem: (k, v) => memoria.set(k, v), removeItem: k => memoria.delete(k) } });
  router = { url: '/minha-area', navigate: (...args) => { navegacoes.push(args); return Promise.resolve(true); } };
});
afterEach(() => injector?.destroy());
function preparar(http = { post: () => of({ dados: { accessToken: jwt(), usuario } }) }) {
  injector = Injector.create({ providers: [
    { provide: HttpClient, useValue: http }, { provide: Router, useValue: router },
    { provide: PacienteAuthService, useFactory: () => new PacienteAuthService() },
    { provide: AuthService, useValue: { token: () => 'jwt-da-equipe', pertenceASessao: () => true, logout: () => { throw Error('Não deveria sair da equipe.'); } } },
  ] });
  return injector.get(PacienteAuthService);
}
test('cadastro público chama a API e guarda somente token e campos públicos', async () => {
  let pedido;
  const auth = preparar({ post: (url, dados) => { pedido = { url, dados }; return of({ dados: { accessToken: jwt(), usuario: { ...usuario, senhaHash: 'nunca-armazenar' } } }); } });
  await firstValueFrom(auth.cadastrar(' Paciente Teste ', ' PACIENTE@EXAMPLE.COM ', 'Senha@123'));
  assert.ok(pedido.url.endsWith('/auth/cadastro-paciente'));
  assert.deepEqual(pedido.dados, { nome: usuario.nome, email: usuario.email, senha: 'Senha@123' });
  const salvo = memoria.get('clinora.paciente.auth.v1');
  assert.ok(salvo && !salvo.includes('Senha@123') && !salvo.includes('senhaHash'));
  assert.equal(auth.usuario()._id, id);
});
test('senha recusada pela API não cria sessão', async () => {
  const auth = preparar({ post: () => throwError(() => new HttpErrorResponse({ status: 401 })) });
  await assert.rejects(firstValueFrom(auth.entrar(usuario.email, 'Errada@123')));
  assert.equal(auth.token(), null); assert.equal(auth.usuario(), null);
});
test('perfil da demonstração no cache não autentica no portal', () => {
  memoria.set('clinora.perfil', JSON.stringify(usuario));
  const auth = preparar(); assert.equal(auth.usuario(), null); assert.equal(auth.token(), null);
});
test('restauração exige token de paciente vigente e ID correspondente', () => {
  memoria.set('clinora.paciente.auth.v1', JSON.stringify({ accessToken: jwt(), usuario }));
  const auth = preparar(); assert.equal(auth.usuario()._id, id); assert.ok(auth.token());
  assert.equal(tokenPacienteVigente(jwt({ perfil: 'admin' })), null);
  assert.equal(tokenPacienteVigente(jwt({ exp: 1 })), null);
  assert.equal(tokenPacienteVigente('invalido'), null);
});
test('sessão da equipe recebida no login do paciente é recusada', async () => {
  const auth = preparar({ post: () => of({ dados: { accessToken: jwt({ perfil: 'admin' }), usuario: { ...usuario, perfil: 'admin' } } }) });
  await assert.rejects(firstValueFrom(auth.entrar(usuario.email, 'Senha@123')));
  assert.equal(auth.usuario(), null);
});
test('Meus dados faz GET e PATCH e envia somente os campos permitidos', async () => {
  const pedidos = [];
  const atualizado = { ...usuario, nome: 'Paciente Atualizado', telefone: '(51) 99999-1013' };
  const auth = preparar({ post: () => of({ dados: { accessToken: jwt(), usuario } }), get: url => { pedidos.push({ url }); return of({ dados: usuario }); }, patch: (url, dados) => { pedidos.push({ url, dados }); return of({ dados: atualizado }); } });
  await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  await firstValueFrom(auth.carregar());
  await firstValueFrom(auth.atualizar({ ...atualizado, nome: ' Paciente Atualizado ', email: ' PACIENTE@EXAMPLE.COM ', perfil: 'admin' }));
  assert.ok(pedidos.every(p => p.url.endsWith('/conta')));
  assert.deepEqual(pedidos[1].dados, { nome: atualizado.nome, email: usuario.email, telefone: atualizado.telefone });
  assert.equal(auth.usuario().nome, atualizado.nome);
});
test('resposta de outra conta não substitui a identidade atual', async () => {
  const auth = preparar({ post: () => of({ dados: { accessToken: jwt(), usuario } }), get: () => of({ dados: { ...usuario, _id: '665f1c2b9a1e4b0012345681' } }) });
  await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  await assert.rejects(firstValueFrom(auth.carregar())); assert.equal(auth.usuario()._id, id);
});
test('JWT do paciente vai somente para /conta na API configurada', async () => {
  const auth = preparar(); await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  for (const [url, enviar] of [['http://localhost:3000/api/v1/conta', true], ['https://outro.example/api/v1/conta', false], ['http://localhost:3000/api/v10/conta', false], ['http://localhost:3000/api/v1/pacientes', false], ['http://localhost:3000/api/v1/auth/login-paciente', false]]) {
    let pedido;
    await firstValueFrom(runInInjectionContext(injector, () => pacienteAuthInterceptor(new HttpRequest('GET', url), req => { pedido = req; return of(new HttpResponse()); })));
    assert.equal(pedido.headers.has('Authorization'), enviar);
  }
});
test('JWT da equipe não é enviado para /conta nem para o cadastro ou login públicos', async () => {
  preparar();
  for (const url of ['http://localhost:3000/api/v1/conta', 'http://localhost:3000/api/v1/auth/login-paciente', 'http://localhost:3000/api/v1/auth/cadastro-paciente']) {
    let pedido;
    await firstValueFrom(runInInjectionContext(injector, () => authInterceptor(new HttpRequest('POST', url, {}), req => { pedido = req; return of(new HttpResponse()); })));
    assert.equal(pedido.headers.has('Authorization'), false);
  }
});
test('403 da conta conserva a sessão e 401 encerra somente a sessão do paciente', async () => {
  const auth = preparar(); await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  for (const status of [403, 401]) {
    await assert.rejects(firstValueFrom(runInInjectionContext(injector, () => pacienteAuthInterceptor(new HttpRequest('GET', 'http://localhost:3000/api/v1/conta'), () => throwError(() => new HttpErrorResponse({ status }))))));
    assert.equal(!!auth.usuario(), status === 403);
  }
  assert.equal(navegacoes.at(-1)[0][0], '/entrar');
});
test('401 de requisição antiga não encerra um login novo', async () => {
  let sessao = { accessToken: jwt(), usuario };
  const auth = preparar({ post: () => of({ dados: sessao }) });
  await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  const pendente = new Subject();
  const resposta = firstValueFrom(runInInjectionContext(injector, () => pacienteAuthInterceptor(new HttpRequest('GET', 'http://localhost:3000/api/v1/conta'), () => pendente)));
  sessao = { accessToken: jwt({ exp: Math.floor(Date.now() / 1000) + 7000 }), usuario };
  await firstValueFrom(auth.entrar(usuario.email, 'Senha@123'));
  pendente.error(new HttpErrorResponse({ status: 401 }));
  await assert.rejects(resposta); assert.equal(auth.token(), sessao.accessToken); assert.equal(navegacoes.length, 0);
});
test('retorno do paciente aceita somente endereços da própria área', () => {
  for (const url of ['https://outro.example', '//outro.example', '/gestao', '/\\outro.example', '/minha-area-maliciosa']) assert.equal(retornoPacienteSeguro(url), '/minha-area');
  assert.equal(retornoPacienteSeguro('/meus-dados'), '/meus-dados');
  assert.equal(retornoPacienteSeguro('/consultas/abc/cancelar'), '/consultas/abc/cancelar');
});
