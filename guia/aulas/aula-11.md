# Aula 11 — Regras de Negócio, Validação Contextual, Estados e Relatórios

> Apresentação: **Regras de Negócio, JWT e Criptografia — Aulas 11, 12 e 13** (slides 1 a 6 e 16, no Classroom).
> Versão usada em todo o projeto: **NestJS 11 · Mongoose 9 · Jest 30**.

Esta página liga cada conceito da **Aula 11 (Regras de Negócio)** a um arquivo **real** do projeto. Abra o arquivo enquanto estuda o slide: o módulo **Produtos** (`backend/src/produtos/`) é o modelo que o seu módulo vai seguir.

## Onde ver cada conceito no projeto

| Slide | Conceito | Onde está no projeto |
| --- | --- | --- |
| 2 | Regra de negócio: o sistema que decide (explícitas × implícitas, restrições e condições) | `guia/temas/<seu-tema>.md` (tabela **Regras de negócio**) · `backend/src/produtos/produtos.service.ts` |
| 3 | Validação contextual: faz sentido agora? (referência, tempo, estado, perfil) | `produtos.service.ts`: `garantirNomeUnico` (`409`) · `guia/RECEITAS.md` (receitas 5 e 6) |
| 4 | Modelar a regra em 4 partes (pré-condição → ação → pós-condição + evento e borda) | `produtos.service.ts`: regra de exclusão (`remover`) e seus testes em `produtos.service.spec.ts` |
| 5 | Estados válidos e transições (Aluno 3 / Módulo C) | `guia/temas/<seu-tema>.md` (seção **Módulo C — Fluxo de estados**) · `guia/RECEITAS.md` (receita 7) |
| 6 | Relatórios e a camada de serviço (Aluno 6 / Módulo F — Aggregation) | `backend/src/produtos/produtos.service.ts` (modelo de agregação) · `guia/temas/<seu-tema>.md` (seção **Módulo F**) |
| 16 | Checkpoint C4 (parte 1): regras no service com testes | `backend/src/<modulo>/<modulo>.service.ts` e `<modulo>.service.spec.ts` |

## Experimente antes de começar

1. Abra [`backend/src/produtos/produtos.service.ts`](../../backend/src/produtos/produtos.service.ts) e veja a regra de exclusão no método `remover`:
   ```ts
   if (produto.estoque > 0) {
     throw new BadRequestException(
       'Não é possível excluir um produto com estoque. Zere o estoque ou inative o produto.',
     );
   }
   ```
2. Abra [`backend/src/produtos/produtos.service.spec.ts`](../../backend/src/produtos/produtos.service.spec.ts) e veja como a regra tem **dois testes**:
   - um teste que prova que o caso proibido é bloqueado (`it('não exclui produto com estoque (regra de negócio)')`);
   - um teste que prova que o caso permitido funciona (`it('exclui produto com estoque zerado')`).
3. Rode `npm test` no `backend` para ver esses testes passando.

## Como modelar cada regra antes de codificar (slide 4)

Antes de escrever qualquer código, divida a regra em quatro partes no papel:

| Parte | O que significa | Exemplo de Produtos | Exemplo de Pets / Atendimentos |
| --- | --- | --- | --- |
| **Pré-condição** | Como o banco precisa estar para a ação ser válida | Produto existe e `estoque === 0` | Atendimento com status `agendado` |
| **Ação** | O que o usuário ou sistema pediu | `DELETE /api/v1/produtos/:id` | `PATCH /api/v1/atendimentos/:id/status` com `{ status: 'em_atendimento' }` |
| **Pós-condição** | O que muda no banco se der certo | Documento é removido e API responde `204` | Status vira `em_atendimento` e API responde `200` |
| **Fluxo alternativo** | Se violar a regra, o que a API responde | `estoque > 0` → `400 Bad Request` ("Zere o estoque...") | Passar de `concluido` para `cancelado` → `400 Bad Request` |

> **Cenários de borda viram testes:** o que acontece se o id não existir? E se o estoque for exatamente zero? E se a data for igual ao minuto atual? Cada desvio vira um `it(...)` no arquivo de teste.

## Validação de formato (DTO) × Validação contextual (Service) (slide 3)

- **DTO (Aula 10):** olha só o dado que acabou de chegar ("é texto? tem tamanho entre 3 e 80?").
- **Validação contextual (Aula 11):** olha **para o banco de dados** e pergunta se a ação faz sentido hoje:
  1. *A referência existe e está ativa?* (ex.: `await this.tutoresService.buscarPorId(dto.tutor)`)
  2. *A data/hora é coerente?* (ex.: data de agendamento precisa ser futura: `if (new Date(dto.dataHora) <= new Date()) throw new BadRequestException(...)`)
  3. *Existe conflito de recurso?* (ex.: dois agendamentos para o mesmo profissional no mesmo horário)
  4. *A transição de estado é permitida?* (ex.: agendado → cancelado, mas nunca concluído → cancelado)

## Aluno 3 — Fluxo de Estados no Módulo C (slide 5)

O responsável pelo Módulo C implementa a máquina de estados:

```ts
// Exemplo: atendimentos (Pet shop). Consulte o manual do seu tema para os seus estados!
export const STATUS = ['agendado', 'em_atendimento', 'concluido', 'cancelado'] as const;
export type Status = (typeof STATUS)[number];

const TRANSICOES: Record<Status, Status[]> = {
  agendado: ['em_atendimento', 'cancelado'],
  em_atendimento: ['concluido'],
  concluido: [], // estado final
  cancelado: [], // estado final
};

async mudarStatus(id: string, novo: Status): Promise<Atendimento> {
  const atendimento = await this.buscarPorId(id);
  if (!TRANSICOES[atendimento.status].includes(novo)) {
    throw new BadRequestException(
      `Não é possível passar de "${atendimento.status}" para "${novo}"`,
    );
  }
  return this.atendimentoModel
    .findByIdAndUpdate(id, { status: novo }, { new: true })
    .lean()
    .exec();
}
```

No controller: rota `PATCH /<recurso>/:id/status` recebendo DTO validado com `@IsIn(STATUS)`.
No front-end: a tela de listagem usa a Receita 7 de [`guia/RECEITAS.md`](../RECEITAS.md#7-botões-de-status) para mostrar apenas os botões das transições válidas.

## Aluno 6 — Consultas Agregadas no Módulo de Relatórios (slide 6)

O módulo **Relatórios** não tem coleção própria no MongoDB. Ele registra no seu módulo os schemas dos colegas com `MongooseModule.forFeature([...])` e executa pipelines de agregação:

```ts
// backend/src/relatorios/relatorios.service.ts
async resumoPorCategoria() {
  return this.produtoModel.aggregate([
    { $match: { ativo: true } },
    {
      $group: {
        _id: '$categoria',
        quantidade: { $sum: 1 },
        totalEstoque: { $sum: '$estoque' },
      },
    },
    { $sort: { quantidade: -1 } },
  ]).exec();
}
```

Entregue pelo menos **duas consultas agregadas** úteis para o negócio e exiba os números no dashboard/tela de relatórios.

## Atividade da aula (slide 16 — Checkpoint C4, parte 1)

Antes de começar, o papel **Git e Integração** traz as atualizações da base para a `develop`. Cada aluno trabalha na sua branch: `<modulo>/regras`.

No **seu módulo**:

- [ ] Implementar todas as regras de negócio listadas no manual do seu tema (`guia/temas/<tema>.md`) dentro de `<modulo>.service.ts`
- [ ] Para cada regra de negócio, criar pelo menos **um teste unitário** em `<modulo>.service.spec.ts` provando que a violação lança a exceção esperada (`BadRequestException`, `ConflictException` ou `NotFoundException`)
- [ ] **Aluno 3 (Módulo C):** implementar o mapa de transições, o método `mudarStatus` no service, a rota `PATCH /<recurso>/:id/status` e os testes de transição válida e inválida
- [ ] **Aluno 6 (Relatórios):** implementar pelo menos duas consultas agregadas com `.aggregate([...])` conectando as coleções dos colegas
- [ ] O **PO / Scrum Master** confere se todas as regras do Documento de Visão estão no código e atualiza a tabela **Regras de negócio implementadas** no `README.md` do grupo
- [ ] Responder às **perguntas de verificação da Aula 11** em `docs/respostas-<nome>.md`:
  1. Descreva uma regra do seu módulo como pré-condição → ação → pós-condição.
  2. O que acontece se alguém chamar a API direto, sem a tela, tentando violar essa regra?

> Na **Aula 12**, o foco é a segurança da aplicação: hash de senhas com `bcryptjs`, emissão e validação de tokens JWT e guard global. Siga para [`guia/aulas/aula-12.md`](aula-12.md).

