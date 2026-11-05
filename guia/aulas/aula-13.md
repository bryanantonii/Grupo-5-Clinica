# Aula 13 — Perfis de Acesso e Integração Front-End + API

> Apresentação: **Regras de Negócio, JWT e Criptografia — Aulas 11, 12 e 13** (slides 12 a 16, no Classroom).
> Versão usada em todo o projeto: **NestJS 11 · Angular 21 · MongoDB/Mongoose**.

Esta página fecha o bloco de integração e segurança (**Checkpoint C4**). O sistema passa a funcionar de ponta a ponta: login no front-end, tokens enviados em todas as requisições, controle de perfis de acesso e todas as telas consumindo a API NestJS com persistência no MongoDB.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 12 | Controle de acesso por perfil (`@Perfis('admin')`, `PerfisGuard`, `403 Forbidden`) | `backend/src/auth/decorators/perfis.decorator.ts` e `guards/perfis.guard.ts` |
| 12 | Teste obrigatório do `PerfisGuard` | `backend/testes-obrigatorios/perfis.guard.spec.ts` |
| 13 | Login e autenticação no Angular (`auth.service.ts`, `auth.interceptor.ts`, `auth.guard.ts`) | `frontend/src/app/core/auth/` e `frontend/src/app/pages/login/` |
| 14 | Troca transparente do mock pela API real (`usarMock: false`) | `frontend/src/environments/environment.ts` e `frontend/src/app/app.config.ts` |
| 14 | Serviço de integração HTTP com a API (`<recurso>-api.service.ts`) | `frontend/src/app/features/produtos/services/produtos-api.service.ts` |
| 15 | Segurança em camadas (tela, DTO, service, guard e banco) e armadilhas comuns | `backend/` e `frontend/` |
| 16 | Checkpoint C4: Sistema Integrado (critérios e entrega) | PR para a `develop`, testes verdes e gravação no banco |

## Experimente antes de começar

1. Abra [`frontend/src/environments/environment.ts`](../../frontend/src/environments/environment.ts) e veja a chave `usarMock: true`.
2. Abra [`frontend/src/app/app.config.ts`](../../frontend/src/app/app.config.ts):
   ```ts
   {
     provide: ProdutosService,
     useClass: environment.usarMock ? ProdutosMockService : ProdutosApiService,
   }
   ```
   Note como os componentes do Angular dependem apenas do contrato abstrato `ProdutosService`. Ao mudar `usarMock: false`, os componentes passam a usar `ProdutosApiService` sem nenhuma alteração no código das telas!

## 1. Perfis no Back-end (Segurança) (slide 12)

O papel **Segurança** implementa o decorator `@Perfis` e o `PerfisGuard`:

### `perfis.decorator.ts`
```ts
import { SetMetadata } from '@nestjs/common';
export type Perfil = 'admin' | 'atendente'; // adapte aos perfis do manual do tema
export const PERFIS_KEY = 'perfis';
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);
```

### `perfis.guard.ts`
```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY, Perfil } from '../decorators/perfis.decorator';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const exigidos = this.reflector.getAllAndOverride<Perfil[] | undefined>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!exigidos || exigidos.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const usuario = request.usuario; // preenchido pelo JwtAuthGuard
    if (!usuario || !exigidos.includes(usuario.perfil)) {
      throw new ForbiddenException('Seu perfil não tem permissão para esta ação');
    }

    return true;
  }
}
```

### Registro no `auth.module.ts` (a ordem importa!)
```ts
providers: [
  AuthService,
  { provide: APP_GUARD, useClass: JwtAuthGuard }, // 1º: autentica (401)
  { provide: APP_GUARD, useClass: PerfisGuard },  // 2º: autoriza (403)
],
```

### Teste obrigatório
Copie `backend/testes-obrigatorios/perfis.guard.spec.ts` para `backend/src/auth/guards/perfis.guard.spec.ts` e rode `npm test`.

### Uso nas rotas dos módulos (todos os alunos)
Marque as rotas que exigem privilégios restritos (como exclusão ou relatórios):
```ts
@Delete(':id')
@Perfis('admin')
remover(@Param('id') id: string) {
  return this.service.remover(id);
}
```

## 2. Login no Front-end (Segurança) (slide 13)

Crie a estrutura de autenticação em `frontend/src/app/core/auth/`:

### `auth.interceptor.ts`
Coloca o token no cabeçalho de toda requisição e redireciona para o login caso a API devolva `401`:

```ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
      }
      return throwError(() => erro);
    }),
  );
};
```

Registre o interceptor em `app.config.ts`:
```ts
provideHttpClient(withInterceptors([authInterceptor])),
```

> **Atenção (slide 9):** guarde o token no `sessionStorage` ou apenas em signals na memória, nunca no `localStorage`.

## 3. Trocar o Mock pela API Real (Todos os alunos) (slide 14)

Para cada módulo criado pelos alunos:

1. Crie `frontend/src/app/features/<modulo>/services/<modulo>-api.service.ts` herdando de `<Modulo>Service`, seguindo [`produtos-api.service.ts`](../../frontend/src/app/features/produtos/services/produtos-api.service.ts) (com `HttpClient`, `environment.apiUrl` e tratamento de erros).
2. Em `frontend/src/app/app.config.ts`, atualize o provider do seu módulo:
   ```ts
   {
     provide: PetsService,
     useClass: environment.usarMock ? PetsMockService : PetsApiService,
   }
   ```
3. Em `frontend/src/environments/environment.ts`, defina:
   ```ts
   export const environment = {
     apiUrl: 'http://localhost:3000/api/v1',
     usarMock: false,
   };
   ```
4. Na tela, esconda os botões de ação que o perfil atual não pode acessar (ex.: `canDelete()` conferindo o perfil do usuário logado), lembrando que o back-end é quem garante a barreira final de segurança.

## Defesa em Camadas (slide 15)

Nunca confie apenas em uma ponta:
1. **Front-end:** validação no formulário e botões escondidos melhoram a usabilidade.
2. **DTO (Back-end):** sanitiza e rejeita dados malformados com `ValidationPipe`.
3. **Guards (Back-end):** barram chamadas sem token (`401`) ou sem perfil adequado (`403`).
4. **Service (Back-end):** aplica as regras de negócio, transições de estado e integridade contextual.
5. **Schema (MongoDB):** última linha de defesa, garantindo tipos, unicidade e regras no banco.

## Atividade da aula (slide 16 — Checkpoint C4)

- [ ] **Segurança:** implementar `PerfisGuard`, decorator `@Perfis`, tela de login e `authInterceptor` no front
- [ ] **Segurança:** garantir que todos os testes obrigatórios de `backend/testes-obrigatorios/` estão verdes
- [ ] **Todos os alunos:** adicionar `@Perfis` nas rotas do seu controller que exigem permissões específicas (como `DELETE` e `relatorios`)
- [ ] **Todos os alunos:** criar `<modulo>-api.service.ts`, registrá-lo no `app.config.ts` e mudar `usarMock: false` em `environment.ts`
- [ ] Testar todo o fluxo pelo navegador:
  1. Login como atendente → cadastrar item → editar item → tentar excluir (deve ser bloqueado no front e na API);
  2. Logout e login como admin → excluir o item com sucesso;
  3. Conferir no MongoDB Compass se os dados estão sendo gravados e atualizados no banco real.
- [ ] Responder às **perguntas de verificação da Aula 13** em `docs/respostas-<nome>.md`:
  1. O que o interceptor faz em cada requisição e o que acontece quando a API responde 401?
  2. Por que esconder um botão na tela não é controle de acesso?
  3. O que precisou mudar nos componentes do seu módulo para trocar o mock pela API? Por quê?

### Entrega (Checkpoint C4)

- Pull Request da sua branch para a `develop`.
- Testes obrigatórios (`usuarios.service.spec.ts`, `auth.service.spec.ts` e `perfis.guard.spec.ts`) rodando e verdes no `npm test`.
- Respostas às perguntas de verificação das Aulas 11, 12 e 13 em `docs/respostas-<nome>.md`.
- Sistema rodando ponta a ponta sem mocks.

### Critérios de avaliação

| Critério | Atende quando |
| --- | --- |
| Regras no service | Regras de negócio, transições de estado (Módulo C) e consultas agregadas (Módulo F) implementadas no service com testes unitários |
| Senha com hash e token JWT | Senhas gravadas com `bcryptjs` e `select: false`; login gera token assinado contendo `sub`, `nome` e `perfil` |
| `401` e `403` corretos | Sem token devolve `401 Unauthorized`; sem o perfil necessário devolve `403 Forbidden` |
| Front com a API | `usarMock: false` em `environment.ts` e dados sendo buscados e persistidos no MongoDB via API NestJS |

## Problemas comuns nesta aula

| Mensagem de erro | Causa | Como resolver |
| --- | --- | --- |
| `401 Unauthorized` em todas as rotas | Guard global ativo e a rota não tem `@Publico()` ou o header `Authorization` não foi enviado | Adicione `@Publico()` na rota de login e verifique se o interceptor do front está injetando o token |
| `403 Forbidden` inesperado | O perfil do usuário logado não está na lista passada para `@Perfis(...)` | Confira se o seed criou o usuário com o perfil correto (`admin`) |
| Front não envia o token nas requisições | Interceptor não registrado no `app.config.ts` | Certifique-se de usar `provideHttpClient(withInterceptors([authInterceptor]))` |
| Erro de CORS no navegador | Front na porta 4200 chamando API na porta 3000 sem liberação | Confira se `main.ts` tem `app.enableCors({ origin: 'http://localhost:4200' })` |
| Dados não atualizam no Compass | `usarMock` ainda está como `true` | Troque `usarMock: false` no `environment.ts` |

