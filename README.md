# Clinora Clínica Geral Integrada

Projeto Integrador do Grupo 5, tema Clínica, turma Programador Full Stack do SENAI em 2026.

A Clinora integra um site Angular, uma API NestJS e MongoDB. Pacientes criam sua conta, consultam horários, agendam e acompanham consultas próprias. A equipe mantém os cinco cadastros, a agenda e as mensagens; administradores também consultam Relatórios e gerenciam acessos. Todos esses fluxos usam a API real. Os mocks históricos ficam nos testes.

A integração do PR [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11) entrou na `develop` em 10/11/2026, merge `d8f60ed`. A documentação atual está em [docs/LEIA-ME.md](docs/LEIA-ME.md).

## Integrantes e responsabilidades

| Integrante | Módulo | Papel | GitHub |
| --- | --- | --- | --- |
| William Davi Georg | A Pacientes | PO e Scrum Master | [WilliamGeorg04](https://github.com/WilliamGeorg04) |
| Bryan Eduardo de Antoni da Silva | B Profissionais | Git e Integração | [bryanantonii](https://github.com/bryanantonii) |
| Valentina de Los Angeles Pena Aguirre | C Consultas | Segurança | [ValentinadelosAngeles](https://github.com/ValentinadelosAngeles) |
| Kamila Valentina Mujica Yepez | D Especialidades | Testes e Qualidade | [Kamila-Mujica](https://github.com/Kamila-Mujica) |
| Henrique Guilherme Rosa | E Convênios | UX UI e Acessibilidade | [henriquerosaaa](https://github.com/henriquerosaaa) |
| Neirkis Patricia Subero Subero | F Relatórios | Documentação e Apresentação | [FanTheUSA](https://github.com/FanTheUSA) |

A divisão acima foi informada pelo grupo. A autoria de alterações é a registrada nos commits e nos Pull Requests.

## Preparar o projeto pela primeira vez

Use Node.js compatível com Angular 21, npm e MongoDB. No laboratório, o banco local é `clinora`, na porta 27017. O Compass é uma interface de consulta; abrir o Compass não inicia a API.

Na raiz do projeto, prepare o backend:

```powershell
cd backend
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Edite `backend/.env` e configure `MONGODB_URI=mongodb://127.0.0.1:27017/clinora`. Para um banco compartilhado, use a URI autorizada do grupo. Não sobrescreva um `.env` que já funciona. Em seguida, ainda em `backend`:

```powershell
npm run configurar:auth
npm run seed
npm run start:dev
```

O configurador preenche variáveis ausentes; o seed preserva as contas e os registros já existentes. Reexecutar o seed não redefine a senha de um usuário existente. As credenciais iniciais ficam somente no `.env` local.

Abra outro terminal na raiz do projeto:

```powershell
cd frontend
npm ci
npm start
```

## Ligar no dia a dia

Com as dependências e o `.env` já preparados, mantenha dois terminais abertos:

- Na pasta `backend`: `npm run start:dev`.
- Na pasta `frontend`: `npm start`.

O MongoDB deve estar em execução. Iniciar somente o frontend permite abrir a página, mas não cadastrar nem autenticar pela API. Confira se [Swagger](http://localhost:3000/api/docs) abre antes de testar o site em [localhost:4200](http://localhost:4200).

## Acessos e permissões

| Perfil | Entrada | Pode fazer |
| --- | --- | --- |
| Público | Site e `/criar-conta` | Consultar catálogo, criar a própria conta e enviar contato. |
| Paciente | `/entrar` | Manter a própria conta e agendar, consultar ou cancelar atendimentos próprios elegíveis. |
| Atendente | `/login` | Cadastrar, editar, consultar e mudar status dos atendimentos; ler mensagens. |
| Administrador | `/login` | Ações da equipe, exclusões lógicas, Relatórios e criação de atendentes. |

JWT válido é exigido nas rotas privadas. O servidor, e não o menu, decide a permissão. A senha fica como hash bcrypt com custo 10 e nunca sai na resposta. O JWT expira em uma hora; redefinir a senha revoga as sessões anteriores. Não há refresh token.

Criar conta no site grava em `usuarios`. A ficha em `pacientes` é criada no primeiro agendamento ou pela equipe, e `consultas` guarda o atendimento. Git não copia os dados do MongoDB nem o `.env` entre computadores.

## Regras de negócio

| Regra | Comportamento |
| --- | --- |
| Paciente | E-mail único, nascimento não futuro e convênio válido quando informado. |
| Profissional | Registro e e-mail únicos; especialidade existente. |
| Consulta | Horário futuro em dia útil, das 08h até antes das 18h no fuso de Brasília; mesmo profissional e mesmo instante não se repetem, salvo cancelada. |
| Estados | marcada → confirmada/cancelada; confirmada → realizada/falta/cancelada; estados finais sem saída. |
| Especialidade | Nome único, duração inteira de 15 a 120 e valor não negativo. |
| Convênio | Nome e ANS únicos; ANS string de seis dígitos; cobertura inteira de 0 a 100. |
| Relatórios | Somente admin; dados gerais e realizadas por especialidade. |

As regras completas, RF01 a RF24 e a matriz de acesso estão nos documentos finais.

## Estrutura e decisões

`frontend/src/app/core` reúne sessão, guards, interceptors e contratos. `layout` e `pages` organizam a navegação pública. `features` reúne os módulos, com telas e serviços compartilhados na gestão. O backend divide controllers, DTOs, services e schemas por módulo. `referencias/produtos` preserva o exemplo do professor, fora dos aplicativos.

- [Arquitetura e fluxo entre tela, API e banco](docs/entrega-final/arquitetura-e-execucao.md).
- [ADR 001 sobre referências ObjectId](docs/adr/001-referencias-entre-modulos.md).
- [Contrato com as 54 operações](docs/contrato-da-api.md) e [dicionário das oito coleções](docs/dicionario-de-dados.md).
- [Padrão visual e wireframes](docs/uiux/README.md).

## Testes e evidências

Revisão de 11/11/2026: **179 testes Jest em 21 suítes** e **95 testes do frontend** aprovados. Os builds e o lint foram conferidos. A cobertura unitária global de linhas é **24,62%**, com a configuração padrão que também inclui seeds, controllers e verificadores; ela não é uma declaração de cobertura total. Os testes HTTP de integração têm evidências separadas.

```powershell
# Na pasta backend
npm test -- --runInBand
npm run test:cov -- --runInBand
npx eslint "src/**/*.ts"
npm run build

# Em outro terminal, na pasta frontend
npm test
npm run build
```

Consulte o [Plano de Testes](docs/plano-de-testes.md), os [resultados atuais](docs/entrega-final/evidencias/qualidade.json) e os verificadores de integração descritos no [README do backend](backend/README.md).

## Limitações e entrega acadêmica

- Relatórios ainda não possui filtro de período.
- O filtro global próprio de erros e os logs de cada requisição da aula 14 ainda não foram implementados; a API usa o formato padrão do NestJS para erros.
- A recuperação está preparada, mas depende de SMTP configurado e teste de entrega externa.
- A auditoria completa com teclado, leitor de tela, contraste e zoom continua pendente. A revisão atual mediu largura e navegação dos seis módulos.
- A cobertura unitária precisa aumentar, em especial em Portal, Contatos e Recuperação. Os testes HTTP não substituem essa medição.
- Nem todos os módulos possuem cartão próprio com `input()` e `output()`; o exemplo explícito é ProfissionalCard. A ficha antiga das aulas deve ser conferida com esse limite.
- `main`, tag `v1.0`, ensaio e apresentação são etapas do fechamento do grupo. A documentação não afirma que já ocorreram.

Os [seis arquivos de respostas](docs/LEIA-ME.md#respostas-dos-integrantes) cobrem as 33 perguntas das aulas 01 a 14 para estudo e revisão. Cada integrante precisa conseguir explicá-las; a existência do arquivo não comprova autoria individual ou participação na banca.

## Documentos e material de apoio

[Documentação final em Word e Markdown](docs/LEIA-ME.md) · [Conferência da entrega](docs/entrega-final/conferencia.md) · [Manual do Usuário](docs/manual-do-usuario.md) · [Roteiro da Apresentação](docs/roteiro-da-apresentacao.md) · [Contribuição](CONTRIBUTING.md) · [Guia do professor](guia/README.md).

Os registros das aulas permanecem como histórico. Dados de pacientes, senhas, tokens e o `.env` não devem ser enviados ao GitHub. Use dados fictícios no projeto acadêmico.
