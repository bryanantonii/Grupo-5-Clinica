# Contrato e dicionário da autenticação

Atualização da aula 12 em 5 de novembro de 2026. O prefixo da API é `/api/v1`.

## Coleção usuarios

| Campo | Tipo e regra | Exposição |
| --- | --- | --- |
| `_id` | ObjectId gerado pelo MongoDB. | ID do usuário e `sub` do JWT. |
| `nome` | String obrigatória, de 3 a 80 caracteres, sem espaços nas extremidades. | Perfil e JWT. |
| `email` | String obrigatória, normalizada para minúsculas; DTO valida o formato. Índice único `usuarios_email_unico`. | Perfil do próprio usuário e resposta do login; ausente do JWT. |
| `senhaHash` | String obrigatória; bcrypt com custo 10 e salt aleatório. `select: false`. | Somente a busca interna do login seleciona o hash; nenhuma resposta o devolve. |
| `perfil` | Enum `admin` ou `atendente`; padrão `atendente`. | Perfil e JWT. |
| `ativo` | Boolean obrigatório, padrão `true`. | Perfil; usuário inativo não faz novo login. |
| `createdAt`, `updatedAt` | Datas geradas por `timestamps`. | Persistência e auditoria dos registros. |

`senha` é apenas um campo de entrada, nunca um campo salvo na coleção.
O cadastro exige no mínimo oito caracteres e no máximo 72 bytes em UTF-8.
O schema rejeita campos desconhecidos. O administrador inicial vem do seed;
o cadastro HTTP aceita somente atendentes e não permite enviar `ativo` ou
`senhaHash`.

## Rotas

| Método e endereço | Entrada e retorno | Acesso |
| --- | --- | --- |
| `POST /auth/login` | `{email, senha}`; 200 com `{accessToken, usuario: {_id, nome, email, perfil}}`. | Público. |
| `GET /auth/me` | 200 com `{sub, nome, perfil, iat, exp}`. | JWT válido. |
| `POST /usuarios` | `{nome, email, senha, perfil?}`; 201 com `{_id, nome, email, perfil, ativo}`. `perfil` opcional aceita somente `atendente`. | JWT válido. |
| `GET /usuarios/me` | 200 com `{_id, nome, email, perfil, ativo}` do próprio usuário. | JWT válido. |
| `GET /catalogo/profissionais` | 200 com lista de `{_id, nome, registro, especialidade, nomeEspecialidade, ativo}` da equipe ativa. | Público. |
| `GET /catalogo/especialidades` | 200 com lista de `{_id, nome}` para apresentação no site. | Público. |

Os conteúdos de sucesso acima ficam em `dados`, conforme o interceptor
existente do projeto. A lista completa das rotas de Profissionais está em
[Rotas da Clinora](../rotas-clinora.md); todas exigem JWT nesta etapa.

O token usa HS256 e expira em uma hora. O payload contém `sub`, `nome`,
`perfil`, `iat` e `exp`. O cliente o envia em `Authorization: Bearer <token>`.
O guard global protege as rotas por padrão, com exceções explícitas por
`@Publico()`. O catálogo é de leitura e não retorna contato privado.

## Erros e limites desta entrega

- 400: DTO inválido, campo inesperado, senha acima do limite ou tentativa de
  escolher `admin` no cadastro HTTP.
- 401: credenciais incorretas, usuário inativo ou token ausente, inválido,
  adulterado, malformado ou expirado. Credenciais incorretas recebem uma
  mensagem genérica, sem revelar se o e-mail existe.
- 409: e-mail já cadastrado, inclusive com diferença de maiúsculas.
- 404: usuário do token não encontrado ao consultar `/usuarios/me`.

Nesta aula o acesso autenticado ainda não é diferenciado por perfil. Isso
será implementado com autorização na aula 13. O guard é stateless: desativar
um usuário bloqueia novos logins; um token emitido anteriormente continua
válido até expirar. Não há refresh token ou revogação de sessão nesta entrega.

## Variáveis locais

`MONGODB_URI` configura a conexão já utilizada pelo projeto. `JWT_SECRET`
precisa ser aleatório, ter pelo menos 32 caracteres e não pode ser o texto
de exemplo. `SEED_ADMIN_NOME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_SENHA`
configuram o administrador inicial. O comando `npm run configurar:auth`
prepara as variáveis no `.env` local sem imprimir os valores secretos.
O `.env` não acompanha o Git nem o material de apoio.

Repetir o seed mantém os documentos existentes, inclusive ID, senha e
timestamps. Se o e-mail escolhido já pertencer a outro perfil, o seed
interrompe a criação do administrador e preserva esse usuário.
