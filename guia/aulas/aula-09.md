# Aula 09 — Configuração MVC no NestJS e Primeiras Rotas CRUD

> Apresentação: **Configuração MVC no NestJS e Primeiras Rotas CRUD — Aulas 09 e 10** (slides 1 a 8 e 15–16, no Classroom).
> Versão usada em todo o projeto: **NestJS 11 · Mongoose 9 · Swagger**.

Esta página liga cada conceito da **Aula 09 (MVC e CRUD)** a um arquivo **real** do projeto. Abra o arquivo enquanto estuda o slide: o módulo **Produtos** (`backend/src/produtos/`) é o modelo que o seu módulo vai seguir.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 2 | A API como porta de entrada (Angular → NestJS → MongoDB) | `frontend/src/environments/environment.ts` (`apiUrl`) · `backend/src/main.ts` (`enableCors` e `setGlobalPrefix('api/v1')`) |
| 3 | Padrão MVC numa API (Model, View JSON, Controller + Service) | `schemas/produto.schema.ts` (Model) · `produtos.controller.ts` (Controller) · `produtos.service.ts` (Service) |
| 4 | Um módulo por domínio e registro no `AppModule` | `backend/src/produtos/produtos.module.ts` · `backend/src/app.module.ts` |
| 5 | Controller: recebe, extrai (`@Param`, `@Query`, `@Body`), delega e devolve | `backend/src/produtos/produtos.controller.ts` |
| 6 | Service: onde vive a regra de negócio e as exceções HTTP (400, 404, 409) | `backend/src/produtos/produtos.service.ts` (`validarId`, `garantirNomeUnico`, regra no `remover`) |
| 7 | Da requisição à resposta e `RespostaInterceptor` (`{ sucesso: true, dados }`) | `backend/src/main.ts` · `backend/src/common/interceptors/resposta.interceptor.ts` |
| 8 | CRUD em REST: verbos, rotas no plural e códigos de status (200, 201, 204, 400, 404, 409) | `backend/src/produtos/produtos.controller.ts` |
| 15 | Boas práticas: controller sem `if`, service sem HTTP, módulo com `exports` | `backend/src/produtos/` |

## Experimente antes de começar

1. Com o MongoDB rodando, suba a API em modo de desenvolvimento:
   ```bash
   cd backend
   npm run seed
   npm run start:dev
   ```
2. Abra `http://localhost:3000/api/v1/produtos` no navegador: veja que a lista já vem envelopada pelo `RespostaInterceptor` no formato `{ "sucesso": true, "dados": [...] }`.
3. Abra o **Swagger** em `http://localhost:3000/api/docs` e teste o módulo **Produtos**:
   - em `GET /api/v1/produtos`, clique em **Try it out → Execute** (código `200`);
   - em `GET /api/v1/produtos/{id}`, digite `abc` e clique em **Execute**: veja o erro `400 Bad Request` (`O id "abc" não é válido`);
   - agora digite `65f000000000000000000000` (24 caracteres hexadecimais que não existem no banco): veja o erro `404 Not Found`;
   - em `DELETE /api/v1/produtos/{id}`, cole o `_id` do **Arroz integral** (que tem `estoque: 25`): veja o `400` da regra de negócio (`Não é possível excluir um produto com estoque`).

## As 5 operações do CRUD: do Controller ao Service (slides 5, 6 e 8)

| Verbo e rota | No Controller (`<modulo>.controller.ts`) | No Service (`<modulo>.service.ts`) | No Model Mongoose | Status HTTP |
| --- | --- | --- | --- | --- |
| `POST /<modulo>` | `@Post()` + `@Body() dto` | `criar(dto)` | `this.model.create(dto)` | `201` (`400`, `409`) |
| `GET /<modulo>` | `@Get()` + `@Query(...)` opcional | `listar(filtro?)` | `this.model.find(filtro).sort(...).lean().exec()` | `200` |
| `GET /<modulo>/:id` | `@Get(':id')` + `@Param('id') id` | `buscarPorId(id)` | `this.model.findById(id).lean().exec()` | `200` (`400`, `404`) |
| `PATCH /<modulo>/:id` | `@Patch(':id')` + `@Param('id')` + `@Body() dto` | `atualizar(id, dto)` | `this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true })` | `200` (`400`, `404`) |
| `DELETE /<modulo>/:id` | `@Delete(':id')` + `@HttpCode(HttpStatus.NO_CONTENT)` | `remover(id)` | `this.model.findByIdAndDelete(id).exec()` | `204` (`400`, `404`) |

### Qual exceção lançar no Service? (slide 6)

O Service **não conhece HTTP**, mas lança exceções do `@nestjs/common` que o NestJS transforma automaticamente na resposta HTTP:

- `throw new BadRequestException('...')` → **400 Bad Request** (ex.: `id` malformado com `!isValidObjectId(id)`, ou violação de regra como excluir com estoque).
- `throw new NotFoundException('...')` → **404 Not Found** (ex.: `findById` ou `findByIdAndUpdate` devolveu `null`).
- `throw new ConflictException('...')` → **409 Conflict** (ex.: e-mail, CPF, placa ou código já cadastrado, ou conflito de horário).

## E quando o meu módulo tem busca, exclusão lógica ou referência?

Consulte as soluções prontas em [**`guia/RECEITAS.md`**](../RECEITAS.md) e a seção **Rotas da API** do seu módulo em `guia/temas/<seu-tema>.md`:

- **Filtro de busca por texto (`?busca=`):** Receita 1 (`{ nome: { $regex: busca, $options: 'i' } }`).
- **Exclusão lógica ("excluir apenas inativa"):** Receita 2 (`findByIdAndUpdate(id, { ativo: false })`).
- **Mostrar o nome da referência (`populate`):** Receita 3 (`.populate('tutor', 'nome')` no `listar` e no `buscarPorId`).
- **Validar se a referência existe antes de salvar:** Receita 5 (injetar o service do colega).

## Atividade da aula (slide 16 — parte 1 do Checkpoint C3)

Antes de começar, o papel **Git e Integração** traz esta atualização da base para a `develop` do grupo (passo 4 do `COMECE-AQUI.md`). Depois, cada aluno cria a sua branch: `<modulo>/crud` (ex.: `pets/crud`).

> 💡 **Dúvidas nos comandos do Git?** Siga o roteiro passo a passo em [**`guia/GIT-E-GITHUB.md`**](../GIT-E-GITHUB.md).

No **seu módulo**, seguindo `backend/src/produtos/` e as rotas do manual do seu tema (`guia/temas/<tema>.md`):

1. **No Service (`backend/src/<modulo>/<modulo>.service.ts`):**
   - [ ] Injetar o Model no construtor com `@InjectModel(<Item>.name) private readonly model: Model<<Item>Document>`
   - [ ] Implementar `listar(...)` com o filtro previsto no manual do tema (categoria, espécie, status, busca por texto ou `ativo: true`) e `.populate(...)` se o módulo tiver referências
   - [ ] Implementar `buscarPorId(id)` validando `isValidObjectId(id)` (`400`) e lançando `NotFoundException` (`404`) quando não existir
   - [ ] Implementar `criar(dto)` (se houver campo único como e-mail, CPF, ISBN ou placa, valide antes e lance `ConflictException` `409`, como o `garantirNomeUnico` de Produtos)
   - [ ] Implementar `atualizar(id, dto)` com `{ new: true, runValidators: true }`
   - [ ] Implementar `remover(id)` (exclusão física com `findByIdAndDelete` ou lógica com `ativo: false`, conforme o manual do seu tema)
2. **No Controller (`backend/src/<modulo>/<modulo>.controller.ts`):**
   - [ ] Implementar as **5 rotas do contrato**: `@Get()`, `@Get(':id')`, `@Post()`, `@Patch(':id')` e `@Delete(':id')` (com `@HttpCode(HttpStatus.NO_CONTENT)`)
   - [ ] Garantir que o controller **só recebe, extrai e delega** ao service (nenhum `if` de regra de negócio nem acesso direto ao Model no controller)
3. **Testar no Swagger (`http://localhost:3000/api/docs`):**
   - [ ] As 5 rotas do seu módulo aparecem e funcionam com os dados do `seed`
4. **Perguntas de verificação da Aula 09** (responda em `docs/respostas-<nome>.md`):
   1. Onde está a regra de negócio do seu módulo: no controller ou no service? Por quê?
   2. Que código HTTP a sua rota de exclusão devolve e por que ela não tem corpo?

> Na **Aula 10**, você vai blindar a entrada dessas rotas com os **DTOs**, documentar no **Swagger** e escrever os **testes unitários do service** para fechar o Checkpoint C3. Siga para [`guia/aulas/aula-10.md`](aula-10.md).

