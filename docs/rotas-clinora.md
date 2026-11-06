# Rotas da Clinora

Organização atualizada em 6 de novembro de 2026, na aula 13.

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
- `backend/src/profissionais/profissionais.controller.ts`: rotas de gestão protegidas.
- `backend/src/profissionais/catalogo.controller.ts`: catálogo público de leitura.
- `backend/src/auth/auth.controller.ts`: login e identidade JWT.
- `backend/src/usuarios/usuarios.controller.ts`: cadastro e consulta do próprio usuário.
- `backend/src/app.module.ts`: módulos registrados no NestJS.

Os arquivos `produtos.routes.ts`, `produtos.controller.ts` e os demais arquivos
didáticos foram movidos para `referencias/produtos/`. São 18 arquivos com o
conteúdo original preservado, fora das pastas `src` e dos builds dos aplicativos.
Na pasta de referência, as extensões são `.ts.txt` e `.html.txt` para que o editor
não trate esses documentos como código executável nem gere erros de imports.
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

`/gestao` exige login real da equipe em `/login`. A visão geral apresenta o
painel para admin e atalhos da agenda para atendente. O menu acessa os cinco
módulos; Relatórios exige admin também quando o endereço é digitado.
`/sem-permissao` explica o bloqueio de perfil sem encerrar a sessão.

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
com o prefixo `/api/v1`. Na aula 12, um guard global passa a exigir JWT
nas rotas sem `@Publico()`. Todos os endpoints de Profissionais abaixo
são protegidos, incluindo as opções de Especialidades.

| Método | Endereço | Função |
| --- | --- | --- |
| GET | `/api/v1/profissionais` | Listar e filtrar profissionais. |
| GET | `/api/v1/profissionais/opcoes/especialidades` | Listar referências para o cadastro. |
| GET | `/api/v1/profissionais/:id` | Buscar pelo ID. |
| POST | `/api/v1/profissionais` | Cadastrar. |
| PATCH | `/api/v1/profissionais/:id` | Atualizar. |
| DELETE | `/api/v1/profissionais/:id` | Inativar. |

| Método | Endereço | Acesso e função |
| --- | --- | --- |
| POST | `/api/v1/auth/login` | Público; valida e-mail e senha e emite JWT. |
| GET | `/api/v1/auth/me` | Protegido; retorna a identidade do token. |
| POST | `/api/v1/usuarios` | Protegido; cadastra atendentes. |
| GET | `/api/v1/usuarios/me` | Protegido; consulta o próprio cadastro sem hash. |
| GET | `/api/v1/catalogo/profissionais` | Público; apresenta a equipe ativa sem contato privado. |
| GET | `/api/v1/catalogo/especialidades` | Público; referências do catálogo do site. |

Swagger: `/api/docs`. Faça login e coloque `dados.accessToken` em Authorize.
Sem token, a rota protegida retorna 401. A API não registra `/api/v1/produtos`.

A equipe usa JWT enviado pelo interceptor do Angular. A gestão dos cinco
módulos e os Relatórios consomem a API; o catálogo público continua acessível.

Pacientes, Especialidades e Convênios expõem GET de listagem e por ID, POST,
PATCH por ID e DELETE com exclusão lógica. Todos usam o prefixo `/api/v1`.
Consultas também expõe PATCH `/consultas/:id/status`. Atendentes podem mudar
o status, incluindo cancelamento, de acordo com o fluxo permitido.

Relatórios expõe GET `/relatorios/resumo`, `/relatorios/consultas-por-status`
e `/relatorios/consultas-por-especialidade`. Essas rotas, todos os DELETE e
POST `/usuarios` exigem admin. O catálogo é público; o restante exige JWT.
Consulte [o contrato detalhado da aula 13](aula-13/contrato-e-dicionario.md).

## Como foi conferido

`npm run test:rotas`, na pasta `frontend`, executa 27 testes com o Router do
Angular e as configurações reais de rotas, sem abrir um navegador. Eles verificam
as 15 telas de cadastro, os IDs, os três redirecionamentos antigos, a visão geral,
Relatórios e a página não encontrada para quatro URLs antigas de Produtos. A aula 13
acrescenta sessão ausente, perfil de atendente, expiração entre rotas e acesso
público ao login e catálogo.

Os testes não renderizam as páginas nem substituem a conferência visual no
navegador. `npm run build` também confere os templates usados pela aplicação.

Os oito testes de Produtos acompanham o exemplo em `referencias/`; eles não são
testes de funcionalidades da clínica.

`npm test` confere também a tipagem dos arquivos de teste com
`tsconfig.tests.json` e os tipos do Node instalados no frontend. O VS Code
encontra essa configuração pela referência em `frontend/tsconfig.json`.
