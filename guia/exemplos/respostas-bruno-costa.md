# Respostas às perguntas de verificação — Bruno Costa

> **Exemplo do professor.** Sistema fictício *Bom Preço — Gestão do Mercadinho* (Grupo 0). Bruno é o responsável pelo módulo **B — Produtos** e pelo papel **Git e Integração**. O módulo Produtos é o mesmo do repositório base, então os arquivos citados existem de verdade.
>
> **Como escrever as suas:** responda com as suas palavras, cite o arquivo do **seu** módulo onde a resposta aparece e dê um exemplo concreto. Uma resposta copiada da internet ou de um colega não vale nota. Acrescente as respostas de cada aula no mesmo arquivo, em ordem.

| | |
| --- | --- |
| **Aluno** | Bruno Costa |
| **Módulo** | B — Produtos (`backend/src/produtos/`, `frontend/src/app/features/produtos/`) |
| **Papel transversal** | Git e Integração |

---

## Aula 01 — Definição do produto

**1. Qual problema real o sistema do grupo resolve e para quem?**
O mercadinho anota os pedidos de entrega em caderno e WhatsApp e conta o estoque à mão. Os pedidos se perdem e os atendentes prometem produtos que já acabaram. O sistema resolve isso para o dono e para as atendentes, que passam a ver o estoque na hora em que registram o pedido.

**2. Cite uma funcionalidade que ficou fora do escopo e explique por quê.**
O pagamento online (Pix ou cartão). Exige integração com um serviço externo, contrato com banco e cuidados de segurança que não cabem em 15 aulas. O mercadinho continua recebendo na entrega.

**3. Qual a diferença entre um requisito funcional e uma regra de negócio? Dê um exemplo de cada do seu módulo.**
O requisito funcional diz **o que** o sistema faz; a regra de negócio diz **em que condição** ele pode fazer.
- RF05: "O sistema deve permitir que o admin cadastre um produto com preço, estoque e categoria."
- RN03: "Produto com estoque maior que zero não pode ser excluído."

## Aula 02 — Repositório e estrutura do módulo

**1. Por que trabalhamos em branches e não direto na develop?**
Para que cada um trabalhe sem quebrar o código dos colegas. A minha mudança só entra na `develop` por Pull Request, depois que o teste automático passa e alguém revisa. Se der errado, a `develop` continua funcionando.

**2. O que muda para o usuário quando uma rota usa loadChildren?**
O código das telas de Produtos só é baixado quando o usuário abre `/produtos` pela primeira vez (em `app.routes.ts`). A primeira tela do sistema abre mais rápido, porque o navegador baixa menos coisa no início.

## Aula 03 — Componentes de página e reutilizáveis

**1. Qual a diferença entre um componente de página e um componente reutilizável? Dê um exemplo de cada no seu módulo.**
O componente de página busca os dados, guarda o estado e decide o que fazer: `ProdutosLista` chama o serviço e trata a exclusão. O reutilizável só mostra o que recebe e avisa o pai: `ProdutoCard` recebe o produto por `input()` e emite `excluir` por `output()`, sem saber de onde vieram os dados.

**2. Para que serve o track no @for?**
Para o Angular identificar cada item da lista (`track p._id`). Quando a lista muda, ele atualiza só a linha que mudou, em vez de redesenhar a tabela inteira.

## Aula 04 — Formulário reativo com validação

**1. O que acontece com um formulário inválido quando o usuário clica em Salvar? Onde isso está no código?**
Nada é enviado: o método `salvar()` de `produto-form.ts` testa `this.form.invalid`, marca todos os campos como tocados (`markAllAsTouched()`) e para. Assim as mensagens de erro aparecem embaixo de cada campo inválido.

**2. Se o front já valida, por que o back-end também precisa validar?**
Porque qualquer pessoa pode chamar a API sem passar pela tela (pelo Swagger, Postman ou outro programa). A validação do front é para ajudar o usuário; a do back-end (DTO e schema) é a que protege os dados.

## Aula 05 — Serviço com dados simulados (mock)

**1. Por que os componentes dependem da classe abstrata e não do ProdutosMockService diretamente?**
Porque assim dá para trocar o mock pela API sem mexer nos componentes. Eles pedem `inject(ProdutosService)` (o contrato) e o `app.config.ts` decide qual implementação entregar, conforme `environment.usarMock`.

**2. Para que serve o delay(400) no mock?**
Para simular o tempo de resposta da API. Com ele dá para ver e testar o estado "Carregando produtos..." antes do back-end existir.

## Aula 06 — Rotas, navegação e entrega do front

**1. Como o formulário sabe se está criando ou editando?**
Pelo `id` que vem da rota `:id/editar` (`input()` com `withComponentInputBinding`). Se o `id` existe, o `ngOnInit` busca o produto e preenche o formulário, e o título vira "Editar produto". Se não existe, é cadastro.

**2. Cite dois itens do checklist de front-end que você precisou corrigir.**
- A tabela saía da tela no celular: coloquei dentro de `.tabela-container`, que rola na horizontal.
- O botão Salvar podia ser clicado duas vezes: passei a desabilitar enquanto `salvando()` é verdadeiro.

## Aula 07 — Modelagem de dados

**1. Quais módulos o seu referencia, e quais referenciam o seu?**
Produtos referencia **Fornecedores** (`produtos.fornecedor`). Produtos é referenciado por **Pedidos** (`pedidos.itens.produto`).

**2. Justifique a escolha entre referência e embutido em uma das relações.**
O fornecedor é **referência**: um fornecedor abastece vários produtos e, se o telefone dele mudar, muda num lugar só. Já nos pedidos o grupo **embutiu** os itens com o `precoUnitario`, para o pedido antigo não mudar de valor quando eu alterar o preço do produto.

**3. Qual índice você criou e qual consulta ele acelera?**
`ProdutoSchema.index({ categoria: 1 })`, que acelera o filtro da listagem `GET /produtos?categoria=alimento`.

## Aula 08 — Schema, módulo e dados de exemplo

**1. Por que o enum precisa de type: String no @Prop?**
Porque o TypeScript transforma o tipo `Categoria` (uma união de textos) em `Object` quando o código roda, e o Mongoose não saberia que tipo usar. Com `type: String` o Mongoose guarda texto e confere o `enum`.

**2. O que faria o banco recusar um documento do seu módulo? Cite duas validações.**
- `preco` negativo (`min: 0`).
- `categoria` fora da lista (`enum: alimento, higiene, limpeza, outros`).
Também recusa nome repetido, por causa do índice `unique`.

## Aula 09 — Controller, service e CRUD

**1. Onde está a regra de negócio do seu módulo: no controller ou no service? Por quê?**
No service (`produtos.service.ts`, método `remover`). O controller só recebe a requisição e devolve a resposta. Com a regra no service, ela vale para qualquer rota que use o service e pode ser testada sem HTTP.

**2. Que código HTTP a sua rota de exclusão devolve e por que ela não tem corpo?**
`204 No Content` (`@HttpCode(HttpStatus.NO_CONTENT)`). O item deixou de existir, então não há nada para devolver: o código já diz que deu certo.

## Aula 10 — DTOs, testes e documentação

**1. O que o whitelist: true do ValidationPipe faz com um campo que não está no DTO?**
Remove o campo antes de chegar ao service. Se alguém mandar `"ativo": false` no `POST /produtos`, o campo some, porque não está no `CreateProdutoDto`.

**2. Por que o teste usa um Model "dublê" (mock) em vez do MongoDB de verdade?**
Para testar só a lógica do service, rápido e sempre com o mesmo resultado. O teste não depende de banco ligado nem de dados que outra pessoa alterou, e roda no GitHub Actions.

**3. Qual foi a cobertura de testes do seu service?**
95% das linhas de `produtos.service.ts`, com 8 testes (`npm run test:cov`).

## Aula 11 — Regras de negócio, estados e relatórios

**1. Descreva uma regra do seu módulo como pré-condição → ação → pós-condição.**
- **Pré-condição:** o produto existe e o estoque é 0.
- **Ação:** o admin pede a exclusão.
- **Pós-condição:** o produto sai da coleção e a API responde 204.
Se o estoque for maior que 0, nada muda e a API responde 400 "Zere o estoque ou inative o produto".

**2. O que acontece se alguém chamar a API direto, sem a tela, tentando violar essa regra?**
A regra está no service, então a resposta é a mesma: 400 e o produto continua no banco. A tela não é a proteção; o service é.

## Aula 12 — Autenticação com JWT e senhas com hash

**1. Qual a diferença entre autenticação e autorização?**
Autenticação responde **quem é você** (login com e-mail e senha, que gera o token). Autorização responde **o que você pode fazer** (o perfil `atendente` não pode excluir produto e recebe 403).

**2. Por que a senha é guardada como hash e não criptografada de forma reversível?**
Porque o hash não tem volta: nem quem tem acesso ao banco consegue descobrir a senha. No login, o bcrypt calcula o hash da senha digitada e compara com o guardado.

**3. O que vai dentro do seu token e por que não colocamos o e-mail ou a senha?**
`sub` (o `_id` do usuário), `nome` e `perfil`. O conteúdo do JWT pode ser lido por qualquer um (só é assinado, não escondido), então não colocamos senha nem dados pessoais que não são necessários.

## Aula 13 — Perfis de acesso e integração front + API

**1. O que o interceptor faz em cada requisição e o que acontece quando a API responde 401?**
Ele coloca o header `Authorization: Bearer <token>` em toda requisição. Quando a API responde 401 (token vencido ou inválido), ele apaga o token e manda o usuário para a tela de login.

**2. Por que esconder um botão na tela não é controle de acesso?**
Porque a pessoa pode chamar a API direto, sem a tela. Quem bloqueia de verdade é o guard de perfis no back-end (`@Perfis('admin')` no `DELETE /produtos/:id`). Esconder o botão só melhora a experiência.

**3. O que precisou mudar nos componentes do seu módulo para trocar o mock pela API? Por quê?**
Nada nos componentes. Troquei `usarMock` para `false` no `environment.ts`, e o `app.config.ts` passou a entregar o `ProdutosApiService`. Isso funciona porque os componentes só conhecem o contrato `ProdutosService`. Só ajustei a mensagem de erro para mostrar o `message` que vem da API.

## Aula 14 — Robustez, testes finais e documentação

**1. Qual a diferença entre a mensagem que o usuário vê e o que vai para o log?**
O usuário vê uma frase que ajuda a resolver ("Já existe um produto com este nome"). O log guarda os detalhes técnicos para o desenvolvedor (rota, código, pilha do erro, data e hora), que não devem aparecer na tela.

**2. Cite uma limitação conhecida do seu módulo e como você a resolveria.**
A listagem traz todos os produtos de uma vez; com milhares de itens ficaria lenta. Eu faria paginação: `GET /produtos?pagina=1&limite=20`, devolvendo também o total, e botões de página na tela.

---

### Papel transversal — Git e Integração (registro)

| Aula | O que fiz |
| --- | --- |
| 02 | Criei o fork, a `develop`, a proteção da `main` e adicionei os colegas |
| 06 | Juntei o front de todos na `develop` e criei a tag `v0.1-c1` |
| 10 | Revisei os PRs com teste vermelho e ajudei a resolver dois conflitos em `app.routes.ts` |
| 14 | Atualizei a `develop` com a base do professor e criei a tag final `v1.0` |
