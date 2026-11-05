# Aula 07 — Modelagem de Dados e Dicionário de Dados

> Apresentação: **Banco de Dados: Schemas e Models com Mongoose — Aulas 07 e 08** (slides 1 a 8 e 15–16, no Classroom).
> Versão usada em todo o projeto: **MongoDB · Mongoose 9 · NestJS 11**.

Esta página liga cada conceito da **Aula 07 (Modelagem)** a um arquivo **real** do projeto. Abra o arquivo enquanto estuda o slide: a coleção **produtos** é o modelo que o seu módulo vai seguir.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 2 | Fluxo: Angular → API NestJS → Mongoose → MongoDB | `frontend/src/app/features/produtos/` → `backend/src/produtos/` → `backend/.env.example` |
| 3 | SQL × NoSQL e por que MongoDB + Mongoose | `backend/src/produtos/schemas/produto.schema.ts` (disciplina de schema sobre documentos JSON) |
| 4 | Banco, coleção, documento e campo (`_id`, `createdAt`) | `backend/src/app.module.ts` (banco `projeto-integrador`) · `produto.schema.ts` (`collection: 'produtos'`) |
| 5 | Entidades, atributos, ligações e ciclo de vida | `guia/temas/<seu-tema>.md` (diagrama `erDiagram`, tabela **Campos** e **Regras de negócio**) |
| 6 | Dicionário de dados: obrigatório, opcional, derivado e sensível | Template em `guia/templates/Dicionário de Dados.docx` · exemplo pronto em `guia/exemplos/dicionario-de-dados.docx` |
| 7 | Relacionamentos 1:1, 1:N e N:N (quem guarda a referência) | Diagrama `erDiagram` no topo de `guia/temas/<seu-tema>.md` (ex.: `guia/temas/pet-shop.md`) |
| 8 | Referência (`ObjectId`) × dado embutido (subdocumento) | `guia/exemplos/dicionario-de-dados.docx` (coleções `produtos` e `pedidos`) · `guia/RECEITAS.md` (receitas 3, 4 e 5) |
| 13 | Índices: qual consulta do módulo precisa ser rápida | `produto.schema.ts`: `ProdutoSchema.index({ categoria: 1 })` e `unique: true` em `nome` |
| 15 | Segurança desde o modelo (LGPD e dados sensíveis) | Coluna **Sensível?** em `guia/templates/Dicionário de Dados.docx` |

## Experimente antes de começar

1. Abra o exemplo preenchido [`guia/exemplos/dicionario-de-dados.docx`](../exemplos/dicionario-de-dados.docx) e veja a **Coleção 2: produtos**.
2. Agora abra [`backend/src/produtos/schemas/produto.schema.ts`](../../backend/src/produtos/schemas/produto.schema.ts) lado a lado: repare como cada linha da tabela no papel virou um `@Prop(...)` no código.
3. Abra o manual do seu tema em [`guia/temas/`](../temas/) e localize:
   - o diagrama **Como os dados se ligam** (quem aponta para quem);
   - a seção do **seu módulo**, com a tabela **Campos** e as **Rotas da API** (veja qual filtro a rota `GET` usa: é ele que vai virar índice).

## Como preencher a tabela do seu módulo

| Coluna do Dicionário | O que colocar | Exemplo (`produtos`) |
| --- | --- | --- |
| **Campo** | Nome exato em `camelCase` (igual ao contrato da API e ao front) | `nome`, `preco`, `categoria` |
| **Tipo** | Tipo do Mongoose: `String`, `Number`, `Boolean`, `Date`, `ObjectId`, `Array` | `Number` |
| **Obrig.** | `sim` ou `não` (sem ele o registro faz sentido?) | `sim` |
| **Regras / validação** | Tamanho (`3 a 80`), mínimo (`min 0`), `enum`, `único`, `padrão`, `ref` | `enum: alimento, higiene, limpeza, outros` |
| **Sensível?** | `sim` se for dado pessoal (CPF, telefone, e-mail, endereço, prontuário); `não` caso contrário | `não` |
| **Exemplo** | Um valor real que apareceria no banco | `Arroz integral 1 kg` |

> **Regra prática para relações (slide 8):**
> - **Referência (`ObjectId` + `ref`):** o outro dado existe sozinho, tem tela própria e é lido ou alterado separado (ex.: `Pet` guarda o `_id` de `Tutor`; `Atendimento` guarda o `_id` de `Pet`, `Servico` e `Profissional`).
> - **Embutido (subdocumento):** só existe dentro do "pai" e é lido sempre junto (ex.: itens dentro de um pedido).
> - **Valor histórico:** quando um preço ou valor não pode mudar no futuro se o cadastro original mudar, copie o valor no momento do registro.

## Atividade da aula (slide 16 — parte 1 do Checkpoint C2)

Na Aula 07 o trabalho é **no documento do grupo** (planejamento antes do código):

1. O responsável por **Documentação e Apresentação** copia o template [`guia/templates/Dicionário de Dados.docx`](../templates/) para `docs/dicionario-de-dados.docx` e preenche a tabela **Visão geral das coleções** junto com o grupo.
2. **Cada aluno** preenche a seção da coleção do **seu módulo** em `docs/dicionario-de-dados.docx` (seguindo o exemplo de [`guia/exemplos/dicionario-de-dados.docx`](../exemplos/dicionario-de-dados.docx)):
   - [ ] Todos os campos do módulo (conferidos com `guia/temas/<tema>.md` e com o `.model.ts` do front-end), incluindo `_id` e `createdAt / updatedAt`
   - [ ] Tipo, obrigatoriedade, regras de validação (mínimo, máximo, `enum`, `unique`, valor padrão) e um exemplo concreto por campo
   - [ ] Coluna **Sensível?** marcada (`sim`/`não`) pensando na LGPD (CPF, telefone, e-mail, endereço etc.)
   - [ ] Pelo menos **um índice** indicado abaixo da tabela, explicando qual consulta da API ele acelera (ex.: filtro por status, espécie, categoria ou busca pelo `_id` da referência)
   - [ ] Justificativa de **Relações: referência ou embutido? Por quê?**
3. O responsável por **Segurança** preenche também a tabela da coleção `usuarios` (que será usada nas aulas 12 e 13).
4. **Perguntas de verificação da Aula 07** (cada aluno responde no seu `docs/respostas-<nome>.md`, veja o exemplo em [`guia/exemplos/respostas-bruno-costa.md`](../exemplos/respostas-bruno-costa.md)):
   1. Quais módulos o seu referencia, e quais referenciam o seu?
   2. Justifique a escolha entre referência e embutido em uma das relações.
   3. Qual índice você criou e qual consulta ele acelera?

> Na **Aula 08**, você vai transformar essa tabela diretamente no arquivo `<item>.schema.ts` e popular o banco com o `seed.ts`. Siga para [`guia/aulas/aula-08.md`](aula-08.md).

