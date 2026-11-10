# Integração real da Clinora — revisão de 09/11/2026

## Resultado da revisão

A base usada é `clinica/aula13-integracao`, commit `58d1af7`, do PR #10. A cópia deste computador estava em uma versão anterior. O trabalho novo está na branch `clinica/integracao-completa`, preservando as alterações daquela base.

A gestão de Pacientes, Profissionais, Consultas, Especialidades, Convênios e Relatórios, o login da equipe, o cadastro público e Meus dados já consultavam a API. Faltava integrar o agendamento do site, o histórico e o cancelamento do paciente, o contato e a recuperação de acesso. Esses fluxos foram implementados com NestJS e MongoDB.

Os providers de produção em `frontend/src/app/app.config.ts` usam diretamente os serviços HTTP. As referências dos formulários vêm da API. O portal não salva consultas em sessionStorage e não cria IDs ou confirmações fictícias. Os mocks históricos continuam apenas como material de teste; o JWT da sessão continua no sessionStorage da própria aba.

## Telas e persistência

| Fluxo | API (prefixo `/api/v1`) | Persistência / regra |
| --- | --- | --- |
| Criar conta de paciente | POST `/auth/cadastro-paciente` | Coleção `usuarios`, perfil paciente imposto pelo servidor, senha com bcrypt |
| Entrar no portal | POST `/auth/login-paciente` | JWT separado do acesso da equipe |
| Meus dados | GET e PATCH `/conta` | Somente a própria conta; sincroniza o contato do cadastro clínico vinculado |
| Profissionais e especialidades públicos | GET `/catalogo/profissionais` e `/catalogo/especialidades` | Catálogo do banco, sem expor o contato privado da equipe |
| Convênios aceitos | GET `/catalogo/convenios` | Convênios ativos do banco |
| Horários disponíveis | GET `/catalogo/horarios?profissional=<id>&data=AAAA-MM-DD` | Consulta os horários ocupados; não devolve nomes ou IDs de pacientes |
| Dados para agendar | GET `/conta/consultas/cadastro` | Nascimento, telefone e convênio do próprio cadastro clínico |
| Agendar | POST `/conta/consultas` | Cria uma consulta real com status marcada; identidade vem do JWT |
| Histórico e detalhe | GET `/conta/consultas` e `/conta/consultas/:id` | Somente as consultas do paciente autenticado |
| Cancelar | PATCH `/conta/consultas/:id/cancelar` | Mantém o histórico e libera o horário; bloqueia consulta passada ou encerrada |
| Enviar contato | POST `/contatos` | Persiste a mensagem; só apresenta sucesso após a resposta da API |
| Caixa de entrada da equipe | GET `/contatos`, PATCH `/contatos/:id/leitura` com `{ "lida": true }` | Admin e atendente podem ler e marcar a mensagem |
| Contas da clínica | GET `/usuarios`, POST `/usuarios` | Apenas admin lista contas e cria atendentes; nunca devolve senhas ou hashes |
| Vincular cadastro antigo | PATCH `/usuarios/:id/paciente` com `{ "paciente": "<id>" }` | Somente admin, após conferir a identidade; exige mesmo e-mail e impede outro vínculo |
| Solicitar recuperação | POST `/auth/recuperar-acesso` com `{ "email": "..." }` | SMTP configurável; resposta genérica para não revelar contas |
| Nova senha | POST `/auth/redefinir-senha` com `{ "token": "...", "senha": "..." }` | Token de uso único, 30 minutos, apenas hash no banco; invalida os JWTs anteriores |

O Swagger também registra as novas rotas: `http://localhost:3000/api/docs`.

## Por que existem usuários e pacientes?

`usuarios` guarda o acesso: nome, e-mail, hash da senha e perfil. `pacientes` guarda o cadastro clínico: nascimento, telefone, convênio e a referência opcional `usuario`.

Criar uma conta não cria automaticamente uma ficha clínica incompleta. No primeiro agendamento, o paciente informa os campos clínicos e a API cria ou atualiza sua ficha, vinculada pelo ID da conta. Um e-mail igual a um cadastro antigo não concede acesso às consultas daquela pessoa. A administração pode conferir a identidade e vincular o cadastro em **Gestão → Usuários e acessos**. Há índices que impedem associar uma conta a duas fichas ou reservar duas vezes o mesmo profissional no mesmo horário.

As consultas feitas pelo portal aparecem na mesma coleção `consultas` e na mesma tela de gestão. A equipe pode alterar o status e o paciente vê essa alteração em nova consulta à API. A mudança de profissional pela equipe também atualiza a especialidade apresentada no portal. O convênio escolhido fica preservado na consulta, inclusive quando ela é particular.

## MongoDB e Compass neste computador

O servidor MongoDB local já estava em execução na porta 27017. A conexão do Compass ainda precisava ser configurada. A configuração local da API foi ajustada no arquivo ignorado `backend/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/clinora
PORT=3000
```

Foi executado `npm run seed` para inserir os exemplos ausentes de especialidades, profissionais e convênios e as contas iniciais da equipe. São registros reais no banco usados pela API; não são respostas mock no navegador. O seed preserva registros existentes. O banco antigo `test` foi preservado.

No Compass, escolha **Add new connection**, informe `mongodb://127.0.0.1:27017/clinora`, dê o nome **Clinora local** e conecte. Abra o banco **clinora** e atualize a lista após usar o site. A conexão foi salva e conectada no Compass em 09/11/2026 com o nome **Clinora local - API**. O aplicativo ficou aberto no banco `clinora`, com as coleções visíveis.

O cadastro do site aparece em `clinora.usuarios`. Depois do primeiro agendamento, aparecem também a ficha em `clinora.pacientes` e a consulta em `clinora.consultas`. Mensagens ficam em `clinora.contatos`. `recuperacoes` guarda somente hashes de tokens temporários.

## Preparar outro computador

```powershell
git fetch origin
git switch clinica/integracao-completa
git pull --ff-only
cd backend
npm ci
# Somente se ainda não existir .env:
Copy-Item .env.example .env
# Edite MONGODB_URI para o servidor e banco que o grupo vai usar.
npm run configurar:auth
npm run seed
npm run start:dev
```

Em outro terminal, entre em `frontend`, execute `npm ci` e `npm start`. Abra `http://localhost:4200`. As credenciais iniciais ficam no `.env` local do backend. Não envie esse arquivo ao GitHub. O comando configurar:auth preenche apenas valores ausentes; não redefine a senha de uma conta que já existe no banco.

**Git transporta código, não transporta os registros do MongoDB nem o `.env`.** Dois computadores com `localhost` usam dois bancos diferentes. Para usar os mesmos registros, o grupo precisa de uma conexão compartilhada autorizada, como um cluster Atlas configurado no `.env`, ou exportar e importar os dados pela ferramenta do MongoDB. Não foram acessados nem importados os dados do outro computador.

## Configuração de e-mail preparada

O grupo informou que ainda não possui SMTP. Copie para o `.env` as variáveis de `backend/.env.email.example` e preencha os dados do provedor escolhido: `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASS` e `FRONTEND_URL`. É possível usar `SMTP_URL` no lugar de host e autenticação separados. Reinicie a API depois da configuração.

Sem host/URL e remetente, a API devolve 503 e a tela explica que o serviço ainda não foi configurado. Não afirma que enviou uma mensagem. O código usa Nodemailer, conexão com tempo limite e TLS conforme a porta. Não há senhas SMTP no repositório. A entrega externa precisa ser verificada quando o grupo configurar o provedor.

A recuperação implementada atende contas de pacientes. A criação da conta fica ativa sem confirmação de e-mail; a tela informa isso. A caixa de entrada do contato é interna na gestão: não envia resposta automática por e-mail.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Backend: `npm test -- --runInBand` | 176 testes Jest, em 20 suítes |
| Backend: `npx eslint "src/**/*.ts"` | Sem erros |
| Backend: `npm run build` | Compilação concluída |
| Frontend: `npm test` | 95 testes: 48 de C1/API/autenticação, 15 de formulários/portal e 32 de rotas; tipagem incluída (reverificado em 10/11/2026) |
| Frontend: `npm run build` | Build de produção concluído |
| `npm run verificar:integracao` | 81 verificações HTTP/MongoDB da gestão |
| `npm run verificar:conta` | 56 verificações HTTP/MongoDB da conta |
| `npm run verificar:portal` | 68 verificações HTTP/MongoDB dos novos fluxos |
| Navegador com Angular + API + MongoDB | Cadastro, retorno ao agendamento, horários reais, gravação, recarregamento, cancelamento, mesma consulta na gestão, contato recebido/lido e cadastro de atendente |

Os verificadores HTTP iniciam a aplicação Nest e usam MongoDB real em bancos temporários com nomes aleatórios. Confirmam respostas HTTP, persistência, conflito de horário, concorrência e isolamento entre pacientes. Apagam somente o banco criado por cada execução. Os testes unitários usam substitutos para dependências isoladas, como é habitual no Jest.

**Somente o transporte de e-mail é substituído no verificador do portal**, para capturar e validar o link sem enviar mensagens externas. JWT, hash de senha, HTTP e MongoDB são reais. Esse teste não comprova entrega SMTP. Há casos de link inválido, expirado e reutilizado, senha antiga recusada e sessão anterior revogada.

A evidência sem senhas ou tokens está em [portal-http.json](evidencias/portal-http.json). Prints: [consulta cancelada na gestão](evidencias/gestao-consulta-real.png) e [contas cadastradas](evidencias/usuarios-reais.png). Os dados dos prints são fictícios.

## O que ainda exige providência do grupo

- Configurar o provedor SMTP e verificar a entrega externa do link.
- Se o objetivo for compartilhar registros entre salas, definir o MongoDB compartilhado ou providenciar a migração dos registros; um clone do Git não resolve isso.
- Revisar os dados institucionais ainda em branco no site: endereço, telefone e horários de atendimento.
- Para a ficha antiga das aulas 01 a 06, conferir com o integrante de Relatórios o filtro de período e sua validação: o painel atual consulta os indicadores reais gerais, mas ainda não tem filtro inicial/final. As respostas individuais, integrantes e commits de cada aluno precisam ser conferidos pelo próprio grupo. Esta integração não comprova esses itens acadêmicos.
- Revisar e integrar o Pull Request na develop. A branch nova contém também os commits da base do PR #10; os dois PRs não devem ser tratados como implementações independentes.

## Correção do login em portas locais — 09/11/2026

O site iniciado pelo VS Code estava em `http://localhost:57246`, mas o CORS da API aceitava somente `http://localhost:4200`. A API e o MongoDB respondiam normalmente; o navegador bloqueava o acesso e a tela mostrava erro de conexão. Foi reproduzida a falha de login da equipe nessa porta antes da alteração.

A configuração de CORS em `backend/src/main.ts` agora usa `src/config/origens-web.ts`. No desenvolvimento aceita HTTP/HTTPS nos endereços de loopback `localhost`, `127.0.0.1` e `[::1]`, incluindo a porta escolhida pelo Angular. Não aceita domínios externos ou nomes parecidos com localhost. Em produção (`NODE_ENV=production`), aceita somente a origem de `FRONTEND_URL`, cujo padrão é `http://localhost:4200`.

Após reiniciar a API, o login feito pelo navegador na porta 57246 abriu a gestão e carregou os indicadores do banco. A evidência está em [login-porta-local.png](evidencias/login-porta-local.png). Os testes adicionam 17 casos unitários e a verificação HTTP de preflight confirma as origens permitidas e recusadas em [cors-local.json](evidencias/cors-local.json). Nenhum registro do banco foi alterado por essa correção.

Para executar no laboratório, mantenha a API e o frontend em terminais separados: `cd backend; npm run start:dev` e `cd frontend; npm start`. O MongoDB deve continuar em execução. Iniciar apenas o frontend não inicia a API. Ao aplicar uma alteração no backend, reinicie-o; depois atualize a página do site. O endereço padrão continua `http://localhost:4200`.

## Conferência da gravação no banco deste computador — 09/11/2026

O Compass estava sem uma conexão da Clinora salva. Foi adicionada **Clinora local - API**, com `mongodb://127.0.0.1:27017/clinora`, o mesmo endereço utilizado pela API. A conexão é local a este computador. A documentação antiga do Atlas descreve outra configuração; ela não transfere os registros nem configura a conexão deste computador.

A conferência inicial encontrou três contas em `usuarios`, sendo uma de paciente. Todas possuíam `senhaHash` no formato bcrypt, com custo de pelo menos 10, sem campos de senha em texto. O código usa `bcryptjs`: `bcrypt.hash(senha, 10)` para guardar e `bcrypt.compare` para autenticar. Não foi necessário alterar o armazenamento de senhas. Hash é uma transformação de mão única, não uma senha que o sistema descriptografa.

Para conferir a gravação na instância usada pelo site, foi criado um usuário fictício pela rota pública e feito o login e um agendamento pela API real. A leitura direta do MongoDB e o GET da consulta confirmaram o mesmo registro. O teste também comparou a senha fictícia com o hash salvo usando bcrypt. A consulta foi visualizada no Compass. Depois foram removidos exclusivamente o usuário, a ficha e a consulta desse teste, com filtros pelos respectivos IDs e vínculos. As três contas anteriores e as demais coleções foram preservadas; não foi apagado nenhum banco.

- **Criar conta no site:** confira `clinora.usuarios`; a senha fica em `senhaHash`.
- **Primeiro agendamento:** confira a ficha em `clinora.pacientes` e o atendimento em `clinora.consultas`, com referências ObjectId.
- **Cadastrar paciente pela gestão:** grava a ficha em `pacientes`; essa ficha não cria automaticamente uma conta com senha.
- **Ver novas gravações no Compass:** abra Documents na coleção correta e clique no ícone de atualizar; limpe um filtro antigo se ele ocultar o novo registro.

Evidências: [conexão salva e coleções](evidencias/compass-conexao-local.jpg), [consulta fictícia durante a verificação](evidencias/compass-consulta-verificacao.jpg) e [resultado sem senhas, hashes ou tokens](evidencias/compass-persistencia-local.json). A consulta do print foi removida ao encerrar o teste. O banco ficou com os mesmos registros anteriores à verificação.

## Cadastro sem conexão — 10/11/2026

O site estava aberto na porta 4200 e o MongoDB estava ativo na porta 27017,
mas não havia processo escutando na porta 3000. A chamada ao catálogo da API
retornou `ECONNREFUSED`. A mensagem genérica do formulário não diferenciava
a indisponibilidade do serviço de outras falhas. Iniciar somente `npm start`
em `frontend` não inicia o backend.

Foi iniciado `npm run start:dev` em `backend`, sem erros de compilação e com
conexão ao banco local `clinora`. Um cadastro fictício pela rota real retornou
201, foi conferido diretamente em `usuarios` e autenticou com resposta 200.
O hash bcrypt foi validado com `bcrypt.compare`, com custo 10 e sem senha em
texto no documento ou na resposta. O preflight CORS do cadastro foi aceito
para `http://localhost:4200`. Foi removido apenas o usuário fictício criado
pela verificação, e as contas anteriores foram preservadas. Resultado:
[cadastro-servico-local.json](evidencias/cadastro-servico-local.json).

A tela agora informa quando não consegue acessar o serviço da clínica,
preserva os campos e permite tentar novamente. O erro HTTP de rede com status
0 não identifica sozinho a causa: também pode ser rede ou bloqueio do
navegador. Neste caso, a ausência do processo e o `ECONNREFUSED` confirmaram
que a API estava desligada. Não foi necessário reconfigurar nem apagar o banco.

Dois testes de regressão verificam o comportamento do componente: falha de
conexão sem apagar o formulário, prevenção de envio duplicado enquanto aguarda,
nova tentativa bem-sucedida e mensagem específica para e-mail duplicado. A
tipagem e os 95 testes do frontend passaram. Esses testes do componente usam
dependências substituídas; a conferência HTTP/MongoDB descrita acima usa a API
e o banco reais.

Para o uso diário, depois da instalação inicial, mantenha dois terminais
abertos: `npm run start:dev` na pasta `backend` e `npm start` na pasta
`frontend`. O MongoDB deve continuar ligado. Confira se
`http://localhost:3000/api/docs` abre antes de testar o cadastro. Fechar o
terminal ou interromper a API exige iniciá-la novamente; abrir o Compass não
inicia o servidor NestJS. Os comandos estão também no
[README do frontend](../../frontend/README.md#executar).
