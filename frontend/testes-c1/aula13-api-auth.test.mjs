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
const { Router } = await import('@angular/router');
const { HttpClient, HttpRequest, HttpResponse, HttpErrorResponse } = await import('@angular/common/http');
const { of, throwError, firstValueFrom, Subject } = await import('rxjs');
const { AuthService, tokenVigente, retornoSeguro } = await import(moduloTs(path.join(raiz,'core/auth/auth.service.ts')));
const { authInterceptor, requisicaoDaApi } = await import(moduloTs(path.join(raiz,'core/auth/auth.interceptor.ts')));
const id='665f1c2b9a1e4b0012345680';
const usuario={_id:id,nome:'Ana da Equipe',email:'ana@example.com',perfil:'admin'};
const jwt=(exp=Math.floor(Date.now()/1000)+3600,extra={})=>Buffer.from('{}').toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:id,nome:usuario.nome,perfil:usuario.perfil,exp,...extra})).toString('base64url')+'.assinatura';
let memoria, injector, chamadas, router;
beforeEach(()=>{
  injector=undefined;
  memoria=new Map(); chamadas=[];
  Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:k=>memoria.get(k) ?? null,setItem:(k,v)=>memoria.set(k,v),removeItem:k=>memoria.delete(k)}});
  router={url:'/gestao/pacientes',navigate:(...args)=>{chamadas.push(args);return Promise.resolve(true);}};
});
afterEach(()=>injector?.destroy());
function preparar(http={post:()=>of({dados:{accessToken:jwt(),usuario}})}) {
  injector=Injector.create({providers:[{provide:HttpClient,useValue:http},{provide:Router,useValue:router},{provide:AuthService,useFactory:()=>new AuthService()}]});
  return injector.get(AuthService);
}
test('login normaliza e-mail, preserva a senha e restaura somente a sessão da aba',async()=>{
  let enviado;
  const auth=preparar({post:(url,dados)=>{enviado={url,dados};return of({dados:{accessToken:jwt(),usuario}});}});
  await firstValueFrom(auth.login(' ANA@EXAMPLE.COM ',' senha com espaços '));
  assert.ok(enviado.url.endsWith('/auth/login'));
  assert.deepEqual(enviado.dados,{email:'ana@example.com',senha:' senha com espaços '});
  assert.ok(auth.estaAutenticado());
  assert.equal(auth.usuario().perfil,'admin');
  assert.equal(memoria.size,1);
  const restaurada=runInInjectionContext(injector,()=>new AuthService());
  assert.equal(restaurada.usuario()._id,id);
  auth.logout();assert.equal(auth.token(),null);assert.equal(memoria.size,0);
  assert.deepEqual(chamadas[0][0],['/login']);
});
test('sessão corrompida e token expirado não autenticam',()=>{
  memoria.set('clinora.auth.v1','{inválido');
  let auth=preparar();assert.equal(auth.estaAutenticado(),false);injector.destroy();
  memoria.set('clinora.auth.v1',JSON.stringify({accessToken:jwt(1),usuario}));
  auth=preparar();assert.equal(auth.usuario(),null);
  assert.equal(tokenVigente('token-sem-payload'),null);
});
test('falha do sessionStorage conserva o login em memória e informa a limitação',async()=>{
  const auth=preparar();
  sessionStorage.setItem=()=>{throw new Error('QuotaExceededError');};
  await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  assert.ok(auth.estaAutenticado());assert.match(auth.aviso(),/somente/);
});
test('retorno do login aceita somente caminhos internos da gestão',()=>{
  for(const url of ['https://outro.example','//outro.example','/entrar','/gestaomaliciosa',null])assert.equal(retornoSeguro(url),'/gestao');
  assert.equal(retornoSeguro('/gestao/pacientes?busca=Ana'),'/gestao/pacientes?busca=Ana');
});
test('interceptor envia JWT somente para as rotas privadas da API configurada',async()=>{
  const auth=preparar();await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  for(const [url,enviar] of [['http://localhost:3000/api/v1/pacientes',true],['https://outro.example/api/v1/pacientes',false],['http://localhost:3000/api/v10/pacientes',false],['http://localhost:3000/api/v1/auth/login',false],['http://localhost:3000/api/v1/catalogo/profissionais',false]]){
    let recebida;
    await firstValueFrom(runInInjectionContext(injector,()=>authInterceptor(new HttpRequest('GET',url),req=>{recebida=req;return of(new HttpResponse({status:200}));})));
    assert.equal(recebida.headers.has('Authorization'),enviar,url);
  }
  assert.equal(requisicaoDaApi('http://localhost:3000/api/v1-externa'),false);
});
test('401 protegido limpa a sessão e volta ao login; 403 conserva a sessão',async()=>{
  const auth=preparar();await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  const req=new HttpRequest('GET','http://localhost:3000/api/v1/pacientes');
  const executar=status=>runInInjectionContext(injector,()=>authInterceptor(req,()=>throwError(()=>new HttpErrorResponse({status}))));
  await assert.rejects(firstValueFrom(executar(403)));assert.ok(auth.token());assert.equal(chamadas.length,0);
  await assert.rejects(firstValueFrom(executar(401)));assert.equal(auth.token(),null);assert.equal(chamadas.length,1);
});
test('401 do login não cria um ciclo de redirecionamentos',async()=>{
  const auth=preparar();
  await assert.rejects(firstValueFrom(runInInjectionContext(injector,()=>authInterceptor(new HttpRequest('POST','http://localhost:3000/api/v1/auth/login',{}),()=>throwError(()=>new HttpErrorResponse({status:401}))))));
  assert.equal(auth.token(),null);assert.equal(chamadas.length,0);
});
test('401 de uma requisição antiga não encerra um login mais recente',async()=>{
  let sequencia=0;
  const auth=preparar({post:()=>of({dados:{accessToken:jwt(undefined,{sequencia:++sequencia}),usuario}})});
  await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  const pendente=new Subject();
  const resposta=firstValueFrom(runInInjectionContext(injector,()=>authInterceptor(new HttpRequest('GET','http://localhost:3000/api/v1/pacientes'),()=>pendente)));
  await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  pendente.error(new HttpErrorResponse({status:401}));
  await assert.rejects(resposta);assert.ok(auth.token());assert.equal(chamadas.length,0);
});
test('token que expira durante a requisição também encerra a sessão no primeiro 401',async()=>{
  const auth=preparar();await firstValueFrom(auth.login(usuario.email,'Senha fictícia'));
  const pendente=new Subject();
  const resposta=firstValueFrom(runInInjectionContext(injector,()=>authInterceptor(new HttpRequest('GET','http://localhost:3000/api/v1/pacientes'),()=>pendente)));
  const agora=Date.now;
  try {
    Date.now=()=>agora()+7200000;
    pendente.error(new HttpErrorResponse({status:401}));
    await assert.rejects(resposta);assert.equal(auth.usuario(),null);assert.equal(chamadas.length,1);
  } finally {Date.now=agora;}
});
const classes={};
for(const [modulo,classe] of [['pacientes','Pacientes'],['consultas','Consultas'],['especialidades','Especialidades'],['convenios','Convenios']]) {
  classes[modulo]=(await import(moduloTs(path.join(raiz,`features/${modulo}/services/${modulo}-api.service.ts`))))[classe+'ApiService'];
}
for(const modulo of Object.keys(classes))test(`${modulo} usa HTTP para listar, cadastrar e editar com IDs reais`,async()=>{
  const pedidos=[];
  const item={_id:id,nome:'Registro da clínica',ativo:true,dataNascimento:'1990-05-21T00:00:00.000Z',convenio:null};
  const http={get:(url,opcoes)=>{pedidos.push({metodo:'GET',url,opcoes});return of({dados:[item]});},post:(url,dados)=>{pedidos.push({metodo:'POST',url,dados});return of({dados:item});},patch:(url,dados)=>{pedidos.push({metodo:'PATCH',url,dados});return of({dados:item});}};
  injector=Injector.create({providers:[{provide:HttpClient,useValue:http}]});
  const service=runInInjectionContext(injector,()=>new classes[modulo]());
  const lista=await firstValueFrom(service.listar({busca:' Ana ',mostrarInativos:true}));
  assert.ok(pedidos[0].url.endsWith('/'+modulo));assert.equal(pedidos[0].opcoes.params.get('busca'),'Ana');assert.equal(pedidos[0].opcoes.params.get('todos'),'true');assert.equal(lista[0]._id,id);
  const entrada={nome:'Ana Lima',convenio:'',dataHora:'2026-12-01T10:30'};
  await firstValueFrom(service.criar(entrada));await firstValueFrom(service.atualizar(id,entrada));
  assert.ok(pedidos[2].url.endsWith('/'+id));
  if(modulo==='pacientes'){assert.equal(lista[0].dataNascimento,'1990-05-21');assert.equal(pedidos[1].dados.convenio,null);}
  if(modulo==='consultas')assert.equal(pedidos[1].dados.dataHora,new Date(entrada.dataHora).toISOString());
});
test('cancelamento de consulta usa a transição de status, sem apagar seu histórico',async()=>{
  let pedido;
  injector=Injector.create({providers:[{provide:HttpClient,useValue:{patch:(url,dados)=>{pedido={url,dados};return of({dados:{_id:id,status:'cancelada'}});}}}]});
  const service=runInInjectionContext(injector,()=>new classes.consultas());
  await firstValueFrom(service.remover(id));assert.ok(pedido.url.endsWith('/'+id+'/status'));assert.deepEqual(pedido.dados,{status:'cancelada'});
});
test('relatórios da API preenchem status sem dados com zero e preservam os agrupamentos',async()=>{
  const {RelatoriosApiService}=await import(moduloTs(path.join(raiz,'features/relatorios/relatorios-api.service.ts')));
  const respostas={'resumo':{pacientes:2,consultasMarcadas:1,faltas:0},'consultas-por-status':[{_id:'marcada',quantidade:1}],'consultas-por-especialidade':[{especialidade:'Clínica geral',quantidade:3}]};
  injector=Injector.create({providers:[{provide:HttpClient,useValue:{get:url=>of({dados:respostas[url.split('/').at(-1)]})}}]});
  const service=runInInjectionContext(injector,()=>new RelatoriosApiService());
  const dados=await firstValueFrom(service.carregar());assert.equal(dados.porStatus.length,5);assert.equal(dados.porStatus[1].quantidade,0);assert.deepEqual(dados.porEspecialidade,[{nome:'Clínica geral',quantidade:3}]);assert.equal(dados.resumo.pacientes,2);
});
