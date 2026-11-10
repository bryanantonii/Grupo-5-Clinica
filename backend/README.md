# Backend da Clinora

API NestJS 11 com Mongoose. Pacientes, Profissionais, Consultas, Especialidades, Convênios, Relatórios, Usuários e Auth estão registrados no AppModule.

## Executar

Prepare o `.env` local com `MONGODB_URI`, usando MongoDB local ou Atlas. Na pasta backend:

```powershell
npm ci
npm run configurar:auth
npm run seed
npm run start:dev
```

A API fica em http://localhost:3000/api/v1 e o Swagger em http://localhost:3000/api/docs.

O configurador gera valores ausentes no `.env`, sem imprimir segredos. O seed mantém o administrador e os cadastros existentes, insere o atendente ausente e completa somente duração e valor ausentes nas três especialidades conhecidas, com os valores fictícios do C1. O `.env.auth.example` lista as variáveis sem senhas.

## Segurança

O login público é POST `/api/v1/auth/login`. O token fica em `dados.accessToken`, expira em uma hora e deve ser enviado em Authorization Bearer. O guard JWT é global; depois dele, PerfisGuard decide as permissões.

O perfil admin é obrigatório para DELETE, Relatórios e POST `/usuarios`. O cadastro administrativo em POST `/usuarios` cria atendentes. O cadastro público POST `/auth/cadastro-paciente` cria somente pacientes; `/auth/login-paciente` autentica esse perfil. GET e PATCH `/conta` leem e atualizam a própria conta do paciente. IDs de terceiros e campos de permissão não são aceitos. Rotas privadas sem perfil explícito continuam restritas à equipe. Cancelar consulta pela rota de status é permitido à equipe e conserva o histórico. Alterar `ativo` por PATCH de Profissionais também exige admin; os outros DTOs não aceitam esse campo.

O catálogo permite leitura pública de `/catalogo/profissionais`, `/catalogo/especialidades`, `/catalogo/convenios` e `/catalogo/horarios`. O portal em `/conta/consultas` exige o perfil paciente e aplica a propriedade dos registros. O contato aceita POST público e oferece GET e marcação de leitura somente à equipe. Recuperação de senha tem rotas públicas com token temporário de uso único; o guard também verifica se a sessão foi revogada no banco. Produtos continua fora da aplicação, em `referencias/produtos`.

## Testes e verificadores

| Comando | Resultado esperado |
| --- | --- |
| `npm test` | Testes unitários com a configuração padrão do Jest, usada no GitHub. |
| `npm run test:compat` | Mesmos testes CJS com resolução pelo Node, para o bloqueio de extensão nativa existente neste laboratório. |
| `npm run build` | Build do NestJS. |
| `npx eslint "src/**/*.ts"` | Verificação de padrão sem reescrever o código. |
| `npm run verificar:conta -- --registrar` | 56 verificações HTTP/MongoDB da conta pública e isolamento da gestão. |
| `npm run verificar:portal` | 68 verificações HTTP/MongoDB do portal, mensagens e recuperação; apenas o transporte SMTP é substituído no teste. |
| `npm run verificar:auth` | 31 verificações de autenticação em banco temporário. |
| `npm run verificar:integracao` | 81 verificações HTTP/MongoDB dos módulos, perfis e regras. |
| `npm run verificar:integracao -- --registrar` | Também grava a evidência em docs/aula-13/evidencias. |
| `npm run verificar:seed:clinica` | Verifica a preservação dos exemplos em um banco temporário. |

Os verificadores de integração criam bancos com prefixos próprios e removem somente os bancos temporários criados por eles. Não apagam o banco clinora. Não exibem senhas, hashes ou tokens.

Os testes obrigatórios originais continuam em `testes-obrigatorios`. Suas cópias executáveis em `src` foram mantidas sem alterações. O modo de compatibilidade não altera os testes nem a configuração original do CI e não requer alterar as proteções do Windows.

O contrato, o dicionário de dados e o roteiro do Swagger estão em [docs/aula-13](../docs/aula-13/README.md). O registro de Convênios com Mongoose permanece em [docs/aula-07-mongoose](../docs/aula-07-mongoose).

A [revisão da integração real](../docs/integracao-real/README.md) detalha as novas rotas, o banco clinora, o Compass, a configuração SMTP em `.env.email.example` e as evidências. O `.env` local e os registros do MongoDB não são enviados ao GitHub.

No desenvolvimento, o CORS também aceita as portas locais escolhidas pelo Angular e pelo VS Code. Em produção, configure `NODE_ENV=production` e `FRONTEND_URL` com a origem exata do site. A configuração não libera domínios externos no modo local.
