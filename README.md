# Clinora — Clínica Geral Integrada

Projeto Integrador Sprint 5. As seções marcadas com ✏️ aguardam os dados e a revisão do grupo.

**Grupo:** 5 · **Tema:** Clínica
**Turma:** Programador Full-Stack · SENAI · 2026

## Sobre o sistema

A Clinora reúne o catálogo de profissionais, as especialidades, os convênios,
o agendamento demonstrativo e a gestão da clínica. A gestão possui telas de
Pacientes, Profissionais, Consultas, Especialidades, Convênios e Relatórios.
Profissionais já utiliza a API; os demais fluxos de frontend ainda usam mocks.
A aula 12 acrescenta autenticação JWT na API. A gestão de Profissionais exige
um token, que pode ser testado no Swagger; o envio pelo Angular será feito na
aula 13. O catálogo público continua acessível sem login.

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
- MongoDB Community rodando em `mongodb://localhost:27017` (`mongosh` para testar)
- Git e VS Code

## Como rodar

```bash
# 1) Back-end
cd backend
npm install
copy .env.example .env      # no Linux/Mac: cp .env.example .env
npm run configurar:auth      # prepara JWT e administrador no .env local
npm run seed                # insere exemplos ausentes e o administrador
npm run start:dev           # API em http://localhost:3000/api/v1

# 2) Front-end (em outro terminal)
cd frontend
npm install
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
    environments/    # apiUrl e usarMockProfissionais
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

O schema aceita `admin` e `atendente`. O seed cria o administrador; o cadastro
protegido cria atendentes. Nesta aula, o guard exige JWT válido em todas as
rotas sem `@Publico()`. As permissões específicas por perfil são da aula 13.

O roteiro de configuração, as respostas e o material para apresentação estão
em [Autenticação da aula 12](docs/aula-12/README.md).

## ✏️ Decisões técnicas (ADRs)

Registre as decisões importantes: o que foi decidido, por quê e qual alternativa foi descartada.

1. ✏️

## Limitações conhecidas e próximos passos

- A autenticação da aula 12 está no backend. O acesso demonstrativo do site
  ainda não autentica na API; o login real do Angular e o interceptor de JWT
  pertencem à aula 13. Até lá, a gestão que chama a API recebe 401 sem token.
- Pacientes, Consultas, Especialidades, Convênios e Relatórios ainda usam mocks
  no frontend; seus endpoints completos aguardam integração.

## ✏️ Respostas às perguntas de verificação do manual

Cada aluno responde às perguntas do seu módulo aqui ou em `docs/respostas-<nome>.md`.

## Material de apoio

- [`COMECE-AQUI.md`](COMECE-AQUI.md) — fork, clone e atualizações da base
- [`guia/`](guia/) — manual do tema, receitas, Manual de Construção e templates
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branches, commits e Pull Requests
