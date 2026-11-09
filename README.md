# Clinora — Clínica Geral Integrada

Projeto Integrador Sprint 5. As seções marcadas com ✏️ aguardam os dados e a revisão do grupo.

**Grupo:** 5 · **Tema:** Clínica
**Turma:** Programador Full-Stack · SENAI · 2026

## Sobre o sistema

A Clinora reúne o catálogo de profissionais, as especialidades, os convênios,
o agendamento integrado à API e a gestão da clínica. A gestão possui telas de
Pacientes, Profissionais, Consultas, Especialidades, Convênios e Relatórios.
A gestão dos cinco módulos e os Relatórios já usam a API e o MongoDB.
A equipe faz login real em `/login`; o Angular envia JWT nas requisições
privadas e o backend aplica as permissões de administrador e atendente.
O catálogo público continua acessível sem login. O paciente cria sua conta em
`/criar-conta`, entra em `/entrar` e atualiza seus dados com persistência no MongoDB.
A conta recebe perfil `paciente` e não acessa a gestão. Agendamento, histórico,
cancelamento, convênios e contato também usam a API e o MongoDB. A recuperação
de senha está implementada e depende de configurar o provedor SMTP no `.env`.

Veja a [revisão da integração real](docs/integracao-real/README.md), com rotas,
configuração do Compass, testes executados e pendências para a entrega.

## Integrantes, módulos e papéis

| Aluno | Módulo | Papel transversal | GitHub |
| --- | --- | --- | --- |
| ✏️ | ✏️ | PO / Scrum Master | ✏️ |
| ✏️ | ✏️ | Git e Integração | ✏️ |
| ✏️ | ✏️ | Segurança | ✏️ |
| ✏️ | ✏️ | Testes e Qualidade | ✏️ |
| ✏️ | ✏️ | UX/UI e Acessibilidade | ✏️ |
| ✏️ | Relatórios | Documentação e Apresentação | ✏️ |

## Tecnologias

- **Front-end:** Angular 21 (standalone, signals, formulários reativos)
- **Back-end:** NestJS 11 (módulos, controllers, services, DTOs)
- **Banco:** MongoDB com Mongoose
- **Testes:** Jest · **Documentação da API:** Swagger

## Pré-requisitos

- Node.js 20.19+ ou 22.12+ (`node -v`)
- MongoDB local ou Atlas, com `MONGODB_URI` configurada no `.env` do backend
- Git e VS Code

## Como rodar

```bash
# 1) Back-end
cd backend
npm ci
copy .env.example .env      # no Linux/Mac: cp .env.example .env
# No .env, configure MONGODB_URI=mongodb://127.0.0.1:27017/clinora
npm run configurar:auth      # prepara JWT e administrador no .env local
npm run seed                # insere exemplos ausentes e o administrador
npm run start:dev           # API em http://localhost:3000/api/v1

# 2) Front-end (em outro terminal)
cd frontend
npm ci
npm start                   # http://localhost:4200
```

- Documentação da API (Swagger): http://localhost:3000/api/docs
- Testes do back-end: `cd backend && npm test`

> Se o `npm install` mostrar o erro `Cannot read properties of null (reading 'edgesOut')`, rode `npx npm@11 install`.

## Estrutura de pastas

```
guia/                # material do professor: manual do tema, receitas, templates (não altere)
docs/                # documentos do grupo (visão, contrato, dicionário, testes...)
backend/
  src/
    common/          # código compartilhado (padrão de resposta, filtros)
    profissionais/  # API de Profissionais, schemas, DTOs e testes
    convenios/      # schema, regras de negócio e testes de Convênios
    usuarios/       # cadastro, hash de senha e administrador inicial
    auth/           # login JWT, guard global e rotas públicas
    seed/           # exemplos dos módulos disponíveis da clínica
  testes-obrigatorios/  # testes da autenticação (aulas 12 e 13)
frontend/
  src/
    environments/    # endereço da API real
    estilos-do-grupo.css  # estilos do grupo (vencem o styles.css)
    app/
      core/          # código compartilhado (modelos de resposta e de referência)
      layout/        # cabeçalho e menu
      pages/         # telas gerais (início, 404)
      features/
        pacientes/       # cadastros da clínica
        profissionais/
        consultas/
        especialidades/
        convenios/
        relatorios/
        gestao/          # layout, rotas e componentes compartilhados
        clinora/         # agendamento e páginas públicas
referencias/produtos/    # exemplo original do professor, fora dos aplicativos
```

As rotas do site, da gestão e da API estão em [Rotas da Clinora](docs/rotas-clinora.md).

## ✏️ Regras de negócio implementadas

| Código | Regra | Módulo | Onde está (arquivo) |
| --- | --- | --- | --- |
| RN01 | ✏️ | ✏️ | ✏️ |

## Perfis de acesso

O schema aceita `admin` e `atendente`. Ambos podem cadastrar, editar e mudar
status de consultas. Somente admin pode excluir cadastros, criar contas de
atendente e consultar Relatórios. O guard JWT verifica a identidade antes
do PerfisGuard. O seed prepara as duas contas iniciais sem redefinir senhas.

O roteiro de configuração, as respostas e o material para apresentação estão
em [Integração da aula 13](docs/aula-13/README.md). O registro da
[autenticação da aula 12](docs/aula-12/README.md) permanece disponível.

## ✏️ Decisões técnicas (ADRs)

Registre as decisões importantes: o que foi decidido, por quê e qual alternativa foi descartada.

1. ✏️

## Limitações conhecidas e próximos passos

- A gestão e as contas dos pacientes estão integradas. Os agendamentos do portal
  continuam demonstrativos. A recuperação automática de senha ainda não está disponível.
- O JWT expira em uma hora, sem refresh token ou revogação individual nesta
  entrega. Use somente dados fictícios no ambiente acadêmico.

## ✏️ Respostas às perguntas de verificação do manual

Cada aluno responde às perguntas do seu módulo aqui ou em `docs/respostas-<nome>.md`.

## Material de apoio

- [`COMECE-AQUI.md`](COMECE-AQUI.md) — fork, clone e atualizações da base
- [`guia/`](guia/) — manual do tema, receitas, Manual de Construção e templates
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branches, commits e Pull Requests
