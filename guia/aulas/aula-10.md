# Aula 10 — DTOs, Testes Unitários e Documentação no Swagger

> Apresentação: **Configuração MVC no NestJS e Primeiras Rotas CRUD — Aulas 09 e 10** (slides 9 a 16, no Classroom).
> Versão usada em todo o projeto: **NestJS 11 · class-validator · Jest 30 · Swagger**.

Esta página liga cada conceito da **Aula 10** a um arquivo **real** do projeto. Abra o arquivo enquanto estuda o slide: o módulo **Produtos** (`backend/src/produtos/`) é o modelo que o seu módulo vai seguir.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 9 | `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) | `backend/src/main.ts` (linhas 20–26) |
| 10 | DTO de entrada (`CreateProdutoDto`) e de atualização (`PartialType`) | `backend/src/produtos/dto/create-produto.dto.ts` · `backend/src/produtos/dto/update-produto.dto.ts` |
| 11 | Decorators do `class-validator` e resposta `400 Bad Request` | `backend/src/produtos/dto/create-produto.dto.ts` |
| 12 | Formato único de resposta: `RespostaInterceptor` (sucesso) × exceção do Nest (erro) | `backend/src/common/interceptors/resposta.interceptor.ts` · `frontend/src/app/core/models/resposta-api.ts` |
| 13 | Testes unitários do service com Model "dublê" (`modelMock` e `consulta()`) | `backend/src/produtos/produtos.service.spec.ts` |
| 14 | Documentação no Swagger (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`) | `backend/src/main.ts` · `produtos.controller.ts` · `dto/create-produto.dto.ts` |
| 15 | Boas práticas e erros que custam caro | `backend/src/produtos/` |

## Experimente antes de começar

1. Rode os testes unitários do módulo **Produtos** (não precisa do MongoDB ligado!):
   ```bash
   cd backend
   npm test
   npm run test:cov
   ```
   Veja os **8 testes** de `produtos.service.spec.ts` passarem em segundos e a tabela de cobertura no terminal.
2. Com a API rodando (`npm run start:dev`), abra o **Swagger** em `http://localhost:3000/api/docs`.
3. Em `POST /api/v1/produtos`, clique em **Try it out**, envie o JSON inválido do slide 11 e clique em **Execute**:
   ```json
   {
     "nome": "Ar",
     "preco": -1,
     "categoria": "bebida",
     "desconto": 10
   }
   ```
   Veja que o `ValidationPipe` barra a requisição **antes** de chegar ao service e devolve `400 Bad Request` listando todos os problemas de uma vez (inclusive `"property desconto should not exist"`).

## Do Dicionário de Dados para o DTO (slides 10, 11 e 14)

| Regra no Dicionário de Dados | No `create-<item>.dto.ts` (`class-validator` + `@nestjs/swagger`) |
| --- | --- |
| Texto obrigatório (`3 a 80`) | `@ApiProperty({ example: '...' })` + `@IsString()` + `@IsNotEmpty({ message: '...' })` + `@Length(3, 80, { message: '...' })` |
| Texto opcional (`até 300`) | `@ApiPropertyOptional({ example: '...' })` + `@IsOptional()` + `@IsString()` + `@MaxLength(300, { message: '...' })` |
| Número inteiro (`>= 0`) | `@ApiProperty({ example: 25 })` + `@IsInt({ message: '...' })` + `@Min(0, { message: '...' })` |
| Número decimal (preço/valor `>= 0`) | `@ApiProperty({ example: 8.9 })` + `@IsNumber({ maxDecimalPlaces: 2 }, { message: '...' })` + `@Min(0, { message: '...' })` |
| Lista fechada (`enum`) | `@ApiProperty({ enum: OPCOES, example: '...' })` + `@IsIn(OPCOES, { message: '...' })` |
| E-mail válido | `@ApiProperty({ example: 'nome@email.com' })` + `@IsEmail({}, { message: 'Informe um e-mail válido' })` |
| Telefone ou CPF com formato | `@ApiProperty({ example: '(51) 99876-5432' })` + `@IsString()` + `@Matches(/regex/, { message: '...' })` |
| Referência (`_id` de outro módulo) | `@ApiProperty({ example: '665f1c2b9a1e4b0012345678' })` + `@IsMongoId({ message: 'Id inválido' })` |
| Data ou data e hora (ISO) | `@ApiProperty({ example: '2026-11-20' })` + `@IsDateString({}, { message: 'Data inválida' })` |
| Booleano (`ativo` no `UpdateDto`) | `@ApiPropertyOptional({ example: true })` + `@IsOptional()` + `@IsBoolean()` |

> **Importante no `update-<item>.dto.ts`:** importe `PartialType` de `@nestjs/swagger` (e **não** de `@nestjs/mapped-types`), como em [`update-produto.dto.ts`](../../backend/src/produtos/dto/update-produto.dto.ts), para que os campos opcionais apareçam documentados no Swagger.

## Como estruturar os testes em `<modulo>.service.spec.ts` (slide 13)

Copie a base de [`produtos.service.spec.ts`](../../backend/src/produtos/produtos.service.spec.ts) e ajuste para o seu módulo:

1. **Se o seu service usa `.populate(...)`** (ex.: `PetsService`), adicione `populate: jest.fn().mockReturnThis()` dentro da função auxiliar `consulta()`:
   ```ts
   const consulta = <T>(resultado: T) => ({
     populate: jest.fn().mockReturnThis(),
     sort: jest.fn().mockReturnThis(),
     lean: jest.fn().mockReturnThis(),
     exec: jest.fn().mockResolvedValue(resultado),
   });
   ```
2. **Se o seu service injeta o service de outro módulo** para validar referência (Receita 5), registre também o dublê dele no `Test.createTestingModule` (veja a **Receita 8** em [`guia/RECEITAS.md`](../RECEITAS.md#8-testar-um-service-que-usa-outro-service)).
3. **Escreva pelo menos 4 testes** (veja a lista na seção **Testes mínimos (aula 10)** do seu módulo em `guia/temas/<seu-tema>.md`):
   - `listar`: devolve a lista (com ou sem filtro);
   - `criar`: salva um registro com dados válidos;
   - `buscarPorId` com `404`: lança `NotFoundException` quando o Model devolve `null` (e `400` `BadRequestException` para id inválido);
   - **regra de negócio**: prova que o service bloqueia o caso proibido (`ConflictException` ou `BadRequestException`).

## Desafio opcional (+bônus): paginação `?pagina=1&limite=10` (slide 16)

Quer fazer o desafio extra da aula? No controller, receba `@Query('pagina') pagina?: string` e `@Query('limite') limite?: string`. Quando informados, use `skip` e `limit`:

```ts
const p = Math.max(1, Number(pagina) || 1);
const l = Math.min(50, Math.max(1, Number(limite) || 10));
const [itens, total] = await Promise.all([
  this.model.find(filtro).sort({ nome: 1 }).skip((p - 1) * l).limit(l).lean().exec(),
  this.model.countDocuments(filtro).exec(),
]);
```

## Atividade da aula (slide 16 — fechamento do Checkpoint C3)

Na mesma branch `<modulo>/crud` (ou em `<modulo>/dto-testes`), seguindo `backend/src/produtos/` e o manual do seu tema (`guia/temas/<tema>.md`, seções **Código de partida → DTOs (aula 10)** e **Testes mínimos (aula 10)**):

- [ ] Criar `backend/src/<modulo>/dto/create-<item>.dto.ts` com todas as validações do Dicionário de Dados e `@ApiProperty` / `@ApiPropertyOptional` com `example`
- [ ] Criar `backend/src/<modulo>/dto/update-<item>.dto.ts` usando `PartialType(Create<Item>Dto)` do `@nestjs/swagger`
- [ ] Usar `Create<Item>Dto` no `@Post()` e `Update<Item>Dto` no `@Patch(':id')` do `<modulo>.controller.ts`
- [ ] Documentar o `<modulo>.controller.ts` com `@ApiTags`, `@ApiOperation`, `@ApiResponse` (200, 201, 204, 400, 404, 409) e `@ApiQuery` nos filtros opcionais
- [ ] Criar `backend/src/<modulo>/<modulo>.service.spec.ts` com **no mínimo 4 testes unitários** (listar, criar, 404 e uma regra de negócio) e garantir que `npm test` passa
- [ ] Responder às **perguntas de verificação da Aula 10** em `docs/respostas-<nome>.md` (veja o exemplo em [`guia/exemplos/respostas-bruno-costa.md`](../exemplos/respostas-bruno-costa.md)):
  1. O que o `whitelist: true` do `ValidationPipe` faz com um campo que não está no DTO?
  2. Por que o teste usa um Model "dublê" (mock) em vez do MongoDB de verdade?
  3. Qual foi a cobertura de testes do seu service (`npm run test:cov`)?
- [ ] **Desafio opcional (+bônus):** implementar paginação `?pagina=1&limite=10` na rota de listagem

### Entrega (Checkpoint C3)

- Pull Request da sua branch para a `develop`, com **print do Swagger** mostrando as 5 rotas do seu módulo documentadas e um teste executado em **Try it out**.
- Respostas às perguntas de verificação das Aulas 09 e 10 em `docs/respostas-<nome>.md`.
- O teste automático do PR precisa ficar verde (`npx eslint "src/**/*.ts"`, `npm test -- --ci` e `npm run build` no `backend`).

### Critérios de avaliação

| Critério | Atende quando |
| --- | --- |
| MVC respeitado | Controller só recebe, extrai e delega; toda validação de negócio e acesso ao Model ficam no Service |
| Rotas e códigos REST | As 5 rotas seguem o contrato da API e devolvem os status corretos (`200`, `201`, `204`, `400`, `404`, `409`) no padrão `{ sucesso, dados }` |
| DTOs fiéis ao dicionário | `CreateDto` e `UpdateDto` validam todos os campos com mensagens em português e aparecem com exemplos no Swagger |
| Testes e `✔` verde | No mínimo 4 testes unitários por service passando no `npm test` e check automático do Pull Request verde no GitHub |

## Problemas comuns nesta aula

| Mensagem de erro | Causa | Como resolver |
| --- | --- | --- |
| `400 "property X should not exist"` | Você enviou no corpo do `POST`/`PATCH` um campo que não está declarado no DTO (ou esqueceu de colocar um decorator como `@IsOptional()` nele) | Sem decorator do `class-validator`, o `whitelist: true` considera que o campo não faz parte do DTO. Adicione o decorator correspondente |
| `TypeError: this.model.find(...).populate is not a function` no `npm test` | O service usa `.populate()`, mas a função `consulta()` do `.spec.ts` não tem `populate` | Acrescente `populate: jest.fn().mockReturnThis()` no objeto retornado por `consulta()` |
| `Nest can't resolve dependencies of the ...Service` no `npm test` | O seu service injeta outro service (ex.: `TutoresService`), mas ele não foi passado nos `providers` do teste | Adicione `{ provide: TutoresService, useValue: { buscarPorId: jest.fn() } }` no `Test.createTestingModule` (Receita 8) |
| Campos do `UpdateDto` não aparecem no Swagger | O `PartialType` foi importado de `@nestjs/mapped-types` | Troque o import para `import { PartialType } from '@nestjs/swagger';` |
| Teste automático (✗ vermelho) na etapa de `lint` | Formatação ou variável não usada no TypeScript | Rode `cd backend && npm run format && npm run lint` antes do commit |

