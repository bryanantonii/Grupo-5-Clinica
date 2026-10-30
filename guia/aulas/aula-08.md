# Aula 08 — Do Modelo ao Código: Schema, Model e Seed

> Apresentação: **Banco de Dados: Schemas e Models com Mongoose — Aulas 07 e 08** (slides 9 a 16, no Classroom).
> Versão usada em todo o projeto: **MongoDB · Mongoose 9 · NestJS 11**.

Esta página liga cada conceito da **Aula 08** a um arquivo **real** do projeto. Abra o arquivo enquanto estuda o slide: o módulo **Produtos** (`backend/src/produtos/`) é o modelo que o seu módulo vai seguir.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 9 | `@Schema`, `@Prop` e `SchemaFactory.createForClass` | `backend/src/produtos/schemas/produto.schema.ts` |
| 10 | Model (`MongooseModule.forFeature` e `@InjectModel`) | `backend/src/produtos/produtos.module.ts` · `backend/src/produtos/produtos.service.ts` · `backend/src/app.module.ts` |
| 11 | Validações com mensagens no `@Prop` (`required`, `minlength`, `min`) | `backend/src/produtos/schemas/produto.schema.ts` (campos `nome`, `preco` e `estoque`) |
| 12 | `enum` com `type: String` e `default` | `backend/src/produtos/schemas/produto.schema.ts` (`CATEGORIAS`, `categoria` e `ativo`) |
| 13 | Índices (`Schema.index` e `unique: true`) | `backend/src/produtos/schemas/produto.schema.ts` (`ProdutoSchema.index({ categoria: 1 })` e `unique: true`) |
| 14 | `timestamps: true` e população com `seed.ts` | `backend/src/produtos/schemas/produto.schema.ts` (`timestamps: true`) · `backend/src/seed/seed.ts` (`npm run seed`) |
| 15 | Segurança e os 6 erros mais comuns | `guia/exemplos/dicionario-de-dados.docx` · `backend/src/produtos/schemas/produto.schema.ts` |

## Experimente antes de começar

1. Garanta que o MongoDB está rodando: `mongosh --eval "db.runCommand({ ping: 1 })"` (deve responder `{ ok: 1 }`).
2. Entre na pasta da API e popule o banco:
   ```bash
   cd backend
   copy .env.example .env      # se ainda não tiver o arquivo .env
   npm run seed
   ```
3. Veja no terminal a mensagem `✔ 5 produtos inseridos`.
4. Abra o **MongoDB Compass**, conecte em `mongodb://localhost:27017`, abra o banco **`projeto-integrador`** e clique na coleção **`produtos`**:
   - veja os 5 documentos com `_id`, `createdAt` e `updatedAt` gerados automaticamente;
   - clique na aba **Indexes** e veja os índices `categoria_1` e `nome_1` (`unique`).

## Do Dicionário de Dados para o `@Prop`

| No Dicionário de Dados (Aula 07) | No `<item>.schema.ts` (Aula 08) |
| --- | --- |
| Obrigatório: `sim` | `required: [true, 'O campo X é obrigatório']` |
| Texto com tamanho (`3 a 80`) | `trim: true, minlength: [3, '...'], maxlength: [80, '...']` |
| Número com mínimo (`>= 0`) | `min: [0, 'O valor não pode ser negativo']` |
| Valor padrão (`true`, `0`, `'agendado'`) | `default: true` |
| Lista fechada de opções (`enum`) | `type: String, enum: { values: OPCOES, message: 'Valor inválido: {VALUE}' }` |
| Valor que não pode repetir (`único`) | `unique: true` (cria um índice único no MongoDB) |
| Referência a outro módulo | `type: Types.ObjectId, ref: 'Tutor', required: true` |
| Datas automáticas de criação/edição | `@Schema({ timestamps: true, collection: '...' })` |
| Consulta frequente da listagem | `MeuSchema.index({ campo: 1 })` no final do arquivo |

## Ordem no `seed.ts` quando um módulo referencia outro (slide 14)

Se o seu módulo guarda o `_id` de outro módulo (ex.: `Pet` precisa do `_id` de `Tutor`), quem é referenciado **precisa ser inserido primeiro**, para você usar o `_id` real gerado pelo MongoDB:

```ts
// 1º: módulo que NÃO depende de ninguém (retorna os documentos com _id real)
const Tutor = mongoose.model('Tutor', TutorSchema, 'tutores');
await Tutor.deleteMany({});
const tutores = await Tutor.insertMany([
  { nome: 'Maria Souza', telefone: '(51) 99876-5432', email: 'maria@email.com' },
  { nome: 'João Lima', telefone: '(51) 99123-4567', email: 'joao@email.com' },
  // ... pelo menos 5 registros
]);
console.log(`✔ ${tutores.length} tutores inseridos`);

// 2º: módulo que referencia o anterior (usa tutores[0]._id, tutores[1]._id...)
const Pet = mongoose.model('Pet', PetSchema, 'pets');
await Pet.deleteMany({});
const pets = await Pet.insertMany([
  { nome: 'Thor', especie: 'cachorro', raca: 'Labrador', tutor: tutores[0]._id },
  { nome: 'Mia', especie: 'gato', tutor: tutores[1]._id },
  // ... pelo menos 5 registros
]);
console.log(`✔ ${pets.length} pets inseridos`);
```

> **Combine com o grupo:** o papel **Git e Integração** coordena a ordem dos merges na `develop`, porque todos os alunos registram o próprio módulo em `app.module.ts` e acrescentam dados em `seed.ts`.

## Atividade da aula (slide 16 — fechamento do Checkpoint C2)

Antes de começar, o papel **Git e Integração** traz esta atualização da base para a `develop` do grupo (passo 4 do `COMECE-AQUI.md`). Depois, cada aluno cria a sua branch: `<modulo>/schema` (ex.: `pets/schema`).

> 💡 **Dúvidas nos comandos do Git?** Siga o roteiro passo a passo em [**`guia/GIT-E-GITHUB.md`**](../GIT-E-GITHUB.md) para criar a branch, salvar e abrir o Pull Request.

No **seu módulo**, seguindo `backend/src/produtos/` e o manual do seu tema (`guia/temas/<tema>.md`, seção **Código de partida → Schema do MongoDB (aula 08)**):

- [ ] Gerar o módulo, controller e service no NestJS (se ainda não existirem):
  ```bash
  cd backend
  npx nest generate module <modulo>
  npx nest generate controller <modulo> --no-spec
  npx nest generate service <modulo> --no-spec
  ```
- [ ] Criar `backend/src/<modulo>/schemas/<item>.schema.ts` fiel ao Dicionário de Dados da Aula 07:
  - `@Schema({ timestamps: true, collection: '<modulo>' })`
  - `@Prop` em cada campo com validações (`required`, `trim`, `minlength`/`maxlength`, `min`/`max`, `default`)
  - `type: String` e `enum` nos campos de lista fechada (status, espécie, categoria, modalidade etc.)
  - `type: Types.ObjectId, ref: '...'` nos campos que referenciam outro módulo
  - pelo menos um índice com `<Item>Schema.index({ ... })`
- [ ] Registrar o schema no `backend/src/<modulo>/<modulo>.module.ts` com `MongooseModule.forFeature([{ name: <Item>.name, schema: <Item>Schema }])` e manter `exports: [<Modulo>Service]`
- [ ] Adicionar pelo menos **5 registros variados** do seu módulo em `backend/src/seed/seed.ts` e testar com `npm run seed`
- [ ] Responder às **perguntas de verificação da Aula 08** em `docs/respostas-<nome>.md`:
  1. Por que o `enum` precisa de `type: String` no `@Prop`?
  2. O que faria o banco recusar um documento do seu módulo? Cite duas validações.
- [ ] **Desafio opcional (+bônus):** gerar **50 registros variados** em laço (`for`) no `seed.ts` para testar volume e paginação

### Entrega (Checkpoint C2)

- Arquivo `docs/dicionario-de-dados.docx` consolidado pelo grupo (com as coleções de todos os módulos).
- Pull Request da sua branch `<modulo>/schema` para a `develop`, com **print do MongoDB Compass** mostrando a coleção do seu módulo populada (documentos + aba Indexes).
- O teste automático do PR precisa ficar verde (`npm run lint`, `npm test` e `npm run build` no `backend`).

### Critérios de avaliação

| Critério | Atende quando |
| --- | --- |
| Schema fiel ao dicionário | Todos os campos, tipos, obrigatoriedades e regras da tabela de `docs/dicionario-de-dados.docx` estão no `<item>.schema.ts` |
| Validações, `enum` e índice | Campos têm regras e mensagens claras; listas fechadas usam `type: String` + `enum`; há pelo menos um índice e `timestamps: true` |
| Relações justificadas | Referências usam `Types.ObjectId` + `ref` e a escolha (referência × embutido) está explicada no dicionário |
| `npm run seed` sem erros | O comando limpa e insere pelo menos 5 documentos da coleção no MongoDB, respeitando a ordem das referências |
| Qualidade e integração | Módulo registrado com `forFeature`, testes automáticos do PR verdes e print do Compass anexado ao PR |

## Problemas comuns nesta aula

| Mensagem de erro | Causa | Como resolver |
| --- | --- | --- |
| `Cannot determine a type for the "..." field` | Campo com tipo união (`'a' \| 'b'`) sem `type: String` | Coloque `@Prop({ type: String, enum: ... })` (slide 12) |
| `E11000 duplicate key error` no `seed` | Dois registros do `seed` têm o mesmo valor num campo `unique: true` | Use valores diferentes para cada item no `seed.ts` |
| `ValidationError` ao rodar `npm run seed` | Um item do `seed` viola uma regra do próprio schema (`min`, `enum`, `required`) | Corrija os dados de exemplo no `seed.ts` para respeitarem o schema |
| `ECONNREFUSED 127.0.0.1:27017` | O serviço do MongoDB não está rodando | Abra **Serviços** do Windows e inicie **MongoDB Server** |
| Conflito em `app.module.ts` ou `seed.ts` no PR | Outro colega fez merge antes e alterou as mesmas linhas | Mantenha o código dos dois módulos (**Accept Both Changes**), respeitando a ordem das referências no `seed.ts` |

