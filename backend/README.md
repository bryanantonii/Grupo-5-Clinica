# Back-end — API NestJS

Instruções completas no [README principal](../README.md).

A aplicação registra apenas módulos da clínica. O exemplo Produtos está em
`referencias/produtos/backend`, fora deste aplicativo, e não expõe rotas nem
participa do seed. A análise dos
cadastros, do que já está no MongoDB e das próximas integrações está em
[Banco da Clinora](../docs/banco-clinica-2026-11-05.md).

| Comando | O que faz |
| --- | --- |
| `npm run start:dev` | Sobe a API com recarga automática (porta 3000) |
| `npm run configurar:auth` | Gera as variáveis locais de autenticação sem imprimir segredos |
| `npm run seed` | Insere exemplos ausentes e o administrador inicial, preservando cadastros e senhas existentes |
| `npm run verificar:auth` | Executa 31 verificações de autenticação com HTTP e MongoDB em banco temporário separado |
| `npm run seed:profissionais` | Confere os exemplos de Profissionais e suas Especialidades |
| `npm run verificar:seed:clinica` | Confere o seed duas vezes em um banco temporário, sem alterar o banco da clínica |
| `npm test` | Roda os testes unitários (Jest) |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npm run lint` | Verifica e corrige o padrão do código |

## Convênios com Mongoose

O módulo E está em src/convenios. O schema registra os campos do guia, o enum modalidade (individual ou coletivo), valores padrão, índices e timestamps. A inclusão de modalidade foi confirmada na atividade e está documentada para revisão do grupo.

Com MONGODB_URI configurada no .env local, execute npm run seed e npm run verificar:convenios. O seed insere exemplos ausentes sem apagar ou sobrescrever os existentes. O verificador obtém o model pelo Nest, confere os cinco exemplos e os timestamps e tenta uma duplicidade que deve ser rejeitada com E11000.

A documentação, o dicionário e o roteiro de apresentação estão em ../docs/aula-07-mongoose. A etapa de Convênios não implementa seu controller HTTP ou a integração desse módulo com o Angular. A autenticação comum da API foi acrescentada na aula 12, descrita abaixo.

## Autenticação da aula 12

Com a conexão do MongoDB configurada no `.env`, execute:

```powershell
npm run configurar:auth
npm run seed
npm run start:dev
```

O configurador prepara `JWT_SECRET`, `SEED_ADMIN_NOME`, `SEED_ADMIN_EMAIL` e
`SEED_ADMIN_SENHA` no `.env` ignorado pelo Git. O arquivo `.env.auth.example`
lista as variáveis, sem valores secretos. Consulte as credenciais somente no
arquivo local para testar o login da aplicação. Não são credenciais do Atlas.

`POST /api/v1/auth/login` é público. O JWT fica em `dados.accessToken` na
resposta e vale uma hora. As rotas de gestão exigem `Authorization: Bearer`
com esse token. `GET /api/v1/auth/me` e `GET /api/v1/usuarios/me` conferem a
identidade; `POST /api/v1/usuarios` cadastra atendentes autenticadamente.
O seed é o responsável pelo administrador inicial.

O catálogo de apresentação tem duas exceções públicas de leitura:
`GET /api/v1/catalogo/profissionais` e `GET /api/v1/catalogo/especialidades`.
A equipe pública não expõe e-mail, telefone privado ou hash. Todos os
endpoints de `/api/v1/profissionais` continuam protegidos.

As permissões por perfil e o login JWT do Angular pertencem à aula 13.
O guard valida o token sem consultar o usuário a cada requisição; desativar
um usuário impede novos logins, mas um token já emitido vale até expirar.
O roteiro do Swagger e os testes estão em [docs/aula-12](../docs/aula-12/README.md).
