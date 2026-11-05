# Integração dos PRs — 4 de novembro de 2026

Reuni os trabalhos que estavam em branches diferentes para deixar a `develop`
com o frontend C1, a API de Profissionais e o módulo de Convênios.

## Trabalhos reunidos

| PR | Conteúdo |
| --- | --- |
| [#1](https://github.com/bryanantonii/Grupo-5-Clinica/pull/1) | Atualizações oficiais da base, exemplos e roteiros de aula. |
| [#2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2) | Interface Clinora, validações dos formulários, acessibilidade e agendamento demonstrativo. |
| [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3) | CRUD dos cinco módulos, relatórios e testes do frontend C1. |
| [#6](https://github.com/bryanantonii/Grupo-5-Clinica/pull/6) | API CRUD de Profissionais, integração HTTP do Angular e configuração do VS Code. |

Os PRs #5 e #7 de Convênios já estavam na `develop` e foram preservados. Os
commits dos trabalhos anteriores continuam no histórico com seus autores.

## Conflitos resolvidos

- No `AppModule`, registrei `ProfissionaisModule` e `ConveniosModule` juntos.
- No backend, mantive `seed:profissionais`, `verificar:convenios` e
  `verificar:regras:convenios`. O seed de Convênios continua sem apagar dados.
- No frontend, mantive o contrato de serviço do C1 e o adaptador HTTP de
  Profissionais. Retirei o CRUD demonstrativo anterior que havia sido substituído
  pelas telas de gestão, evitando dois cadastros independentes da mesma equipe.
- Aproveitei as validações de acesso, a confirmação de senha, os atributos de
  acessibilidade e os avisos do agendamento do PR #2.
- O agendamento consulta o catálogo atual e recusa profissional inativo,
  especialidade incompatível, data passada e horário já reservado na demonstração.
- Os endereços antigos de gestão continuam funcionando por redirecionamento:

| Endereço antigo | Destino atual |
| --- | --- |
| `/profissionais/gerenciar` | `/gestao/profissionais` |
| `/profissionais/novo` | `/gestao/profissionais/cadastrar` |
| `/profissionais/:id/editar` | `/gestao/profissionais/editar/:id` |

## Conferência

| Verificação local | Resultado |
| --- | --- |
| Testes do backend | 86 aprovados, em cinco suítes. |
| ESLint do backend, sem correção automática | Aprovado. |
| TypeScript do backend (`tsc --noEmit`) | Aprovado. |
| Build do backend | Aprovado. |
| Testes C1 e adaptador HTTP (`npm run test:c1`) | 21 aprovados. |
| Acesso e integração do agendamento com o catálogo | 9 aprovados. |
| Build de produção do Angular | Aprovado. |

No frontend, `npm test` executa os 30 testes. Os testes específicos do mock antigo
foram substituídos pela cobertura do CRUD atual e da integração HTTP, preservando
os testes de acesso e acrescentando a conferência do agendamento com o catálogo.

Neste Windows, os testes Jest foram executados com um resolvedor JavaScript local
por causa do bloqueio do resolvedor nativo pelas políticas do computador. Essa
adaptação fica fora do repositório; o GitHub Actions executa o Jest padrão.

A interface não foi conferida manualmente nesta integração: o controle do
navegador integrado estava desativado. O build conferiu os templates do Angular.
As imagens dos PRs anteriores registram as etapas em que foram produzidas.

## Como explicar a entrega

“Integrei os trabalhos que estavam separados no GitHub. Resolvi os conflitos para
Profissionais e Convênios funcionarem no mesmo backend e mantive as telas do C1.
O cadastro de Profissionais continua conectado à API; os links da versão antiga
agora levam para a gestão atual. Também mantive as validações e a acessibilidade
dos formulários. Conferi o resultado com 86 testes no backend, 30 no frontend,
lint, TypeScript e os dois builds.”

Profissionais usa a API. Os demais cadastros, os relatórios, o acesso e o
agendamento do site continuam demonstrativos nesta entrega. O service e o banco
de Convênios permanecem disponíveis no backend, conforme a atividade da Valentina.
Esta integração não acrescenta autenticação JWT.
