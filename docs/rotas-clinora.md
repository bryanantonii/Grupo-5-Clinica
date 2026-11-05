# Rotas da Clinora

Organização conferida em 5 de novembro de 2026.

## Onde encontrar no VS Code

- `frontend/src/app/app.routes.ts`: páginas públicas, acesso à gestão,
  redirecionamentos antigos de Profissionais e página não encontrada.
- `frontend/src/app/features/gestao/gestao.routes.ts`: módulos da gestão.
- `frontend/src/app/features/<modulo>/<modulo>.routes.ts`: listar, cadastrar e
  editar cada cadastro.
- `frontend/src/app/features/gestao/gestao-layout.ts`: menu dos cinco módulos e
  Relatórios.
- `frontend/src/app/layout/layout.html`: navegação pública; “Área da equipe”
  aponta diretamente para `/gestao`.
- `backend/src/profissionais/profissionais.controller.ts`: rotas HTTP disponíveis.
- `backend/src/app.module.ts`: módulos registrados no NestJS.

Os arquivos `produtos.routes.ts`, `produtos.controller.ts` e os demais arquivos
didáticos foram movidos para `referencias/produtos/`. São 18 arquivos com o
conteúdo original preservado, fora das pastas `src` e dos builds dos aplicativos.
O projeto não possui uma funcionalidade ativa de Produtos.

## Site público

| Endereço | Página ou ação |
| --- | --- |
| `/` | Início da Clinora. |
| `/profissionais` | Catálogo da equipe. |
| `/profissionais/:id` | Perfil do profissional. |
| `/convenios` | Informações de convênios e atendimento particular. |
| `/agendar` | Agendamento demonstrativo. |
| `/contato` | Contato demonstrativo. |
| `/sobre` | Apresentação da clínica. |
| `/entrar` e `/criar-conta` | Acesso e cadastro demonstrativos. |
| `/minha-area` e `/meus-dados` | Área do paciente; exigem sessão demonstrativa. |
| `/consultas/:id` | Detalhe da consulta demonstrativa do paciente. |
| `/consultas/:id/cancelar` | Confirmação de cancelamento demonstrativo. |

## Gestão da clínica

`/gestao` abre a visão geral. O menu acessa os cinco módulos e `/gestao/relatorios`.

| Módulo | Listar | Cadastrar | Editar |
| --- | --- | --- | --- |
| Pacientes | `/gestao/pacientes` | `/gestao/pacientes/cadastrar` | `/gestao/pacientes/editar/:id` |
| Profissionais | `/gestao/profissionais` | `/gestao/profissionais/cadastrar` | `/gestao/profissionais/editar/:id` |
| Consultas | `/gestao/consultas` | `/gestao/consultas/cadastrar` | `/gestao/consultas/editar/:id` |
| Especialidades | `/gestao/especialidades` | `/gestao/especialidades/cadastrar` | `/gestao/especialidades/editar/:id` |
| Convênios | `/gestao/convenios` | `/gestao/convenios/cadastrar` | `/gestao/convenios/editar/:id` |

`:id` é substituído pelo identificador do registro. O formulário consulta esse
ID ao abrir e retorna à lista após salvar.

Os endereços antigos `/profissionais/gerenciar`, `/profissionais/novo` e
`/profissionais/:id/editar` redirecionam para a gestão atual, conservando o ID.
`/produtos`, suas subrotas e `/gestao/produtos` exibem a página não encontrada.

## API: o que já está disponível

As rotas do Angular abrem telas. As rotas HTTP do NestJS são outra camada,
com o prefixo `/api/v1`.

| Método | Endereço | Função |
| --- | --- | --- |
| GET | `/api/v1/profissionais` | Listar e filtrar profissionais. |
| GET | `/api/v1/profissionais/opcoes/especialidades` | Listar referências para o cadastro. |
| GET | `/api/v1/profissionais/:id` | Buscar pelo ID. |
| POST | `/api/v1/profissionais` | Cadastrar. |
| PATCH | `/api/v1/profissionais/:id` | Atualizar. |
| DELETE | `/api/v1/profissionais/:id` | Inativar. |

Swagger: `/api/docs`. A API não registra `/api/v1/produtos`.

Convênios possui schema e service; seu controller HTTP ainda precisa ser
entregue. Pacientes, Consultas e o módulo completo de Especialidades também
aguardam a API. As telas desses módulos continuam em mock; mudar os nomes de
rotas do exemplo não implementaria suas regras de negócio.

## Como foi conferido

`npm run test:rotas`, na pasta `frontend`, executa 23 testes com o Router do
Angular e as configurações reais de rotas, sem abrir um navegador. Eles verificam
as 15 telas de cadastro, os IDs, os três redirecionamentos antigos, a visão geral,
Relatórios e a página não encontrada para quatro URLs antigas de Produtos.

Os testes não renderizam as páginas nem substituem a conferência visual no
navegador. `npm run build` também confere os templates usados pela aplicação.

Os oito testes de Produtos acompanham o exemplo em `referencias/`; eles não são
testes de funcionalidades da clínica.
