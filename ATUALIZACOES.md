# Atualizações do repositório base

Cada atualização tem uma etiqueta (*tag*) e diz se o grupo precisa fazer alguma coisa depois do merge.
Para receber: veja o **Passo 4** de [`COMECE-AQUI.md`](COMECE-AQUI.md).

---

## v1.3 — Exemplos dos documentos do grupo

**Etiqueta:** `base-v1.3`

- Nova pasta `guia/exemplos/` com um exemplo preenchido de cada documento: Documento de Visão, Contrato da API, Dicionário de Dados, Plano de Testes, Manual do Usuário, Roteiro da Apresentação e as respostas às perguntas de verificação.
- Os exemplos descrevem um sistema fictício (*Bom Preço — Gestão do Mercadinho*), que não é um dos temas da turma.
- Links para os exemplos em `docs/LEIA-ME.md`, `guia/README.md` e `COMECE-AQUI.md`.

**O que o grupo precisa fazer:** só o merge. Se o grupo já tinha mudado o `docs/LEIA-ME.md` e der conflito, aceite as duas versões (**Accept Both Changes**).

---

## v1.2 — Ajuste dos temas e guia de Git

**Etiqueta:** `base-v1.2`

- O tema **Restaurante / delivery** saiu da disciplina: agora são **5 temas para 5 grupos**, um por grupo.
- Removido `guia/temas/restaurante-delivery.md` e as referências no `COMECE-AQUI.md` e em `guia/README.md`.
- Manual de Construção atualizado: o sorteio distribui os 5 temas entre os 5 grupos.
- Novo `guia/GIT-E-GITHUB.md`: passo a passo de Git e GitHub para iniciantes, com links no `COMECE-AQUI.md`, no `CONTRIBUTING.md`, em `guia/README.md` e em `guia/aulas/aula-02.md`.

**O que o grupo precisa fazer:** só o merge. Nenhum arquivo do grupo foi alterado.

---

## v1.1 — Aula 02 · Front-end com Angular

**Etiqueta:** `base-v1.1`

- Novo componente reutilizável `ProdutoCard` (`features/produtos/produto-card/`), com `input()` e `output()`.
- A listagem de Produtos ganhou os botões **Tabela / Cartões** (exemplo de `@if`, evento e componente filho).
- Estilos do cartão em `styles.css`.
- Roteiro da aula em `guia/aulas/aula-02.md`: onde ver cada conceito no projeto, atividade, entrega e critérios.

**O que o grupo precisa fazer:** só o merge. Nenhum arquivo do grupo foi alterado.

---

## v1.0 — Aula 01 · versão inicial

**Etiqueta:** `base-v1.0`

- Projeto base: Angular 21 + NestJS 11 + MongoDB, com o módulo de exemplo Produtos.
- Manuais dos 6 temas em `guia/temas/`.
- Receitas comuns em `guia/RECEITAS.md`.
- Manual de Construção, templates e responsabilidades em `guia/`.
- Testes automáticos em cada Pull Request (`.github/workflows/ci.yml`).
- Tipo `Referencia` e funções `idDe` / `textoDe` em `frontend/src/app/core/models/referencia.ts`.
- Arquivo `frontend/src/estilos-do-grupo.css` para os estilos do grupo.

**O que o grupo precisa fazer:** seguir o `COMECE-AQUI.md`.
