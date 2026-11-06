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

O login demonstrativo do Angular ainda não envia JWT. Assim, a gestão que
chama a API recebe 401 até a integração da aula 13. O site público usa as
rotas de catálogo e continua acessível. Veja [o roteiro da aula 12](aula-12/README.md).

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

`npm test` confere também a tipagem dos arquivos de teste com
`tsconfig.tests.json` e os tipos do Node instalados no frontend. O VS Code
encontra essa configuração pela referência em `frontend/tsconfig.json`.
