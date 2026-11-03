# Profissionais — API e telas (aulas 09 e 10)

Registro da implementação em 03/11/2026. Módulo B do [manual da clínica](../guia/temas/clinica.md): RF05 a RF08, RN03 e RN04.

## O que foi entregue

- [x] Módulo, schema Mongoose, service e controller de Profissionais.
- [x] Cinco rotas CRUD com persistência no MongoDB.
- [x] DTOs de criação, atualização parcial e filtros, ligados ao ValidationPipe global da base.
- [x] Verificação de especialidade existente, registro e e-mail únicos.
- [x] Exclusão lógica: define ativo=false, preservando o documento.
- [x] Testes unitários do service e dos DTOs.
- [x] Swagger com campos, exemplos, respostas e códigos de erro.
- [x] Integração das telas Angular da versão completa do C1 (PR #3).
- [x] Cadastro, edição, busca, confirmação de exclusão e filtro de inativos pela API.
- [x] Carregamento, erro com nova tentativa e lista vazia.
- [x] Seed próprio com três profissionais fictícios e referências válidas.

A publicação e o estado do Pull Request devem ser conferidos no GitHub. Aprovação e merge na develop continuam sendo responsabilidade da integração do grupo.

## Como explicar a separação das camadas

**View:** é a interface Angular. Os componentes RegistroLista e RegistroForm, reutilizados pelo C1, exibem dados, validam o formulário para orientar a pessoa e chamam ProfissionaisService. A view permanece no frontend; o NestJS devolve JSON.

**Controller:** recebe verbo, endereço, parâmetros, query e corpo da requisição HTTP. Encaminha o DTO ao service e descreve as rotas para o Swagger.

**DTO:** define a entrada permitida. Uma requisição inválida retorna 400 antes da operação no banco. Validar no Angular melhora a experiência; validar na API também cobre chamadas feitas fora do navegador.

**Service:** aplica as regras: normalizar texto, conferir unicidade, validar a existência da especialidade, buscar, criar, editar e inativar.

**Schema e MongoDB:** definem os tipos e persistem os documentos. Índices únicos de registro e e-mail também impedem duplicidade em cadastros concorrentes.

Exemplo para apresentar: o Angular envia POST /api/v1/profissionais; o DTO valida os campos; o service verifica a especialidade e as duplicidades; o MongoDB salva; o controller responde 201 e a tela mostra sucesso.

## Contrato das rotas

Prefixo local: http://localhost:3000/api/v1

| Método | Caminho | Comportamento | Sucesso |
| --- | --- | --- | --- |
| GET | /profissionais | Ativos, ordenados por nome; busca parcial por nome | 200 |
| GET | /profissionais/:id | Um profissional, inclusive inativo | 200 |
| POST | /profissionais | Cadastra com ativo=true | 201 |
| PATCH | /profissionais/:id | Atualiza somente os campos enviados | 200 |
| DELETE | /profissionais/:id | Inativa; não apaga fisicamente | 204 sem corpo |

Rota auxiliar: GET /profissionais/opcoes/especialidades retorna as opções ativas do banco para o select. A rota aparece antes de :id no controller.

Filtros de GET /profissionais:

| Query | Tipo | Efeito |
| --- | --- | --- |
| busca | texto de até 80 caracteres | Contém o texto no nome, sem diferenciar maiúsculas |
| especialidade | ObjectId | Filtra pela referência |
| todos | true ou false | true inclui os inativos |

A busca trata caracteres como ponto e asterisco como texto literal. O adaptador do C1 transforma mostrarInativos em todos=true.

## Campos e validações

| Campo | Regra |
| --- | --- |
| nome | Obrigatório; texto aparado, de 3 a 80 caracteres |
| registro | Obrigatório; de 4 a 20 caracteres; salvo em maiúsculas; único |
| especialidade | Obrigatório; ObjectId de uma especialidade existente |
| email | Obrigatório; e-mail válido; salvo em minúsculas; único |
| telefone | Obrigatório; formato (51) 99999-9999 ou (51) 3333-4444 |
| ativo | true automaticamente no POST; booleano opcional no PATCH |
| _id, createdAt, updatedAt | Gerados pelo banco; não são campos de criação |

O PATCH aceita subconjuntos dos campos, incluindo ativo. Valores null, tipos errados e propriedades desconhecidas são recusados. ID malformado retorna 400; ID válido sem documento retorna 404; duplicidade retorna 409. A edição permite conservar o próprio registro e e-mail. O índice único também trata erros 11000 do MongoDB.

Corpo de criação (substitua a especialidade pelo ID retornado pela rota de opções):

```json
{
  "nome": "Dra. Ana Lima",
  "registro": "DEMO-010",
  "especialidade": "<ObjectId existente>",
  "email": "ana.lima@example.com",
  "telefone": "(51) 99999-1234"
}
```

O padrão global da base envolve respostas de sucesso em { sucesso: true, dados: ... }. Especialidade é devolvida como { _id, nome }. O DELETE responde sem corpo. Erros usam statusCode e message; os conflitos também informam campo. O Angular mostra as mensagens da API e uma mensagem própria quando a conexão falha.

## Arquivos para a leitura guiada

| Responsabilidade | Arquivo |
| --- | --- |
| Rotas e Swagger | backend/src/profissionais/profissionais.controller.ts |
| Regras CRUD | backend/src/profissionais/profissionais.service.ts |
| Entrada | backend/src/profissionais/dto/ |
| Persistência | backend/src/profissionais/schemas/profissional.schema.ts |
| Registro na aplicação | backend/src/profissionais/profissionais.module.ts e backend/src/app.module.ts |
| Exemplos | backend/src/profissionais/seed-profissionais.ts |
| HTTP Angular | frontend/src/app/features/profissionais/services/profissionais-api.service.ts |
| Referências e catálogo público | frontend/src/app/features/profissionais/services/profissionais-catalogo.service.ts |
| Configuração da tela | frontend/src/app/features/profissionais/profissionais.config.ts |
| Views reutilizadas | frontend/src/app/features/gestao/shared/registro-lista e registro-form |

## Como executar em outro computador

Pré-requisitos: Node/npm compatíveis com a base e MongoDB em execução. Use o arquivo backend/.env.example para criar o .env local; o .env não deve ir para o Git.

No terminal do backend:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run seed:profissionais
npm run start:dev
```

Faça a cópia do .env apenas na primeira configuração, se o arquivo ainda não existir. Ajuste a conexão conforme o MongoDB local. O seed usa essa conexão, insere exemplos ausentes e não limpa o banco nem reativa cadastros existentes. Não depende do seed didático de Produtos.

Em outro terminal:

```powershell
cd frontend
npm ci
npm start
```

- Gestão: http://localhost:4200/gestao/profissionais
- Cadastro: http://localhost:4200/gestao/profissionais/cadastrar
- Edição: /gestao/profissionais/editar/:id
- Catálogo público: http://localhost:4200/profissionais
- Swagger: http://localhost:3000/api/docs
- Especificação OpenAPI: http://localhost:3000/api/docs-json

Use localhost na URL do Angular, conforme o CORS da base. Em environment.ts, usarMockProfissionais=false seleciona a API; true restaura o mock do C1. usarMock continua controlando Produtos.

## Testes e evidências

Backend:

```powershell
cd backend
npx eslint "src/**/*.ts"
npm test -- --ci --runInBand
npm run build
```

Frontend:

```powershell
cd frontend
npm run test:c1
npm run build
```

Resultado conferido nesta entrega: 45 testes do backend (37 novos de Profissionais/DTOs e 8 do exemplo Produtos) e 21 testes do frontend (16 do C1 e 5 novos da integração). O comando test:api roda somente os 5 testes novos. Compilações e lint passaram.

Também foram executadas 27 verificações HTTP contra a API e um MongoDB isolado de testes: CRUD, normalização, filtros, duplicidades, validações, erros 400/404/409, resposta 204, reativação e OpenAPI. O banco de validação foi separado dos dados do projeto.

No navegador da versão C1: cadastro, recarregamento, edição, busca, exclusão com confirmação, lista vazia, filtro de inativos e referência da especialidade foram conferidos. A página pública consulta o mesmo catálogo da API.

- [Resultado HTTP](evidencias/profissionais-api-http.json)
- [Listagem integrada](evidencias/profissionais-api-listagem.png)
- [Registro inativo preservado](evidencias/profissionais-api-inativacao.png)

## Limites atuais e integração do grupo

A base desta branch é o conteúdo do PR #3, escolhido pelo grupo. Como ele ainda não está na develop, o diff para develop inclui também o C1 anterior. O revisor deve considerar essa dependência e revisar os commits novos de Profissionais separadamente. Esta entrega não faz o merge dos PRs do grupo.

Somente Profissionais foi conectado ao backend nesta atividade. Pacientes, Consultas, Especialidades, Convênios, Relatórios e o acesso do C1 continuam usando demonstrações. Os indicadores do C1 ainda são calculados sobre os mocks; não representam os totais reais da API. O agendamento público continua demonstrativo, embora selecione profissionais do catálogo da API.

O CRUD de Especialidades ainda não está registrado na API desta base. Por isso ProfissionaisEspecialidadesService consulta a coleção especialidades para verificar a referência e listar opções. O seed fornece três opções iniciais. Quando o colega entregar EspecialidadesService, o grupo pode trocar esse adaptador pela injeção do service, como na receita do manual. Alterar especialidades no mock do C1 não altera as opções do MongoDB.

A API ainda não tem autenticação/autorização real da equipe. As telas de acesso continuam mock. Use dados fictícios nesta etapa acadêmica.

## Roteiro curto de demonstração

1. Mostrar os decorators GET, POST, PATCH e DELETE no controller.
2. Abrir o CreateProfissionalDto e explicar required, limites, e-mail, telefone e referência.
3. Abrir o service e explicar RN03 (registro único), RN04 (especialidade existente) e a inativação.
4. No Swagger, listar opções e cadastrar um profissional fictício.
5. Na gestão Angular, localizar o cadastro, editar e recarregar para mostrar a persistência.
6. Excluir com confirmação e marcar Mostrar inativos para comprovar a preservação.
7. Mostrar os testes passando e o PR destinado à develop.
