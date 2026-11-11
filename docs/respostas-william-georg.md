# Respostas de estudo de William Davi Georg

Módulo A — Pacientes · PO e Scrum Master · GitHub [WilliamGeorg04](https://github.com/WilliamGeorg04).

Revisão de 11/11/2026. Referência funcional: `develop`, merge `d8f60ed` do PR #11, com a revisão documental e do Swagger desta entrega.

Estas respostas consolidam o funcionamento do projeto para estudo e revisão do integrante. Não substituem a apresentação oral nem comprovam autoria individual de commits. Cada integrante deve conferir os exemplos no código e adaptar sua explicação antes da entrega.

## Aula 01 — Definição do produto

### Qual problema real o sistema do grupo resolve e para quem?

A Clinora centraliza os cadastros e a agenda para a recepção e permite ao paciente agendar e acompanhar consultas pelo site. O objetivo é reduzir a dispersão de informações e impedir horários duplicados.

### Cite uma funcionalidade que ficou fora do escopo e explique por quê.

Teleconsulta, prontuário médico e pagamento on-line ficaram fora do MVP. Exigiriam fluxos, integrações e cuidados adicionais; a versão concentra-se em cadastro, agenda e indicadores.

### Qual a diferença entre um requisito funcional e uma regra de negócio? Dê um exemplo de cada do seu módulo.

Requisito funcional descreve uma ação disponível. Regra de negócio define uma condição que essa ação deve respeitar. O exemplo específico do módulo está abaixo. RF01 cadastra paciente; RN01 exige e-mail único e RN02 impede nascimento futuro.

## Aula 02 — Repositório e estrutura do módulo

### Por que trabalhamos em branches e não direto na develop?

A branch separa uma alteração da versão compartilhada. O Pull Request permite revisar e executar o CI antes de integrar à develop. Uma branch também preserva trabalho em andamento sem misturá-lo ao dos colegas.

### O que muda para o usuário quando uma rota usa loadChildren?

loadChildren permite carregar as rotas de um módulo quando ele é acessado. O usuário mantém a navegação normal; o código da área não precisa estar todo no primeiro carregamento.

## Aula 03 — Componentes de página e reutilizáveis

### Qual a diferença entre um componente de página e um componente reutilizável? Dê um exemplo de cada no seu módulo.

A página coordena rota, leitura e estado. Um componente de apresentação recebe dados e comunica eventos. RegistroLista e RegistroForm são páginas compartilhadas por configuração; ProfissionalCard é o exemplo explícito com input() e output(). Nem todos os módulos têm um cartão próprio com essa interface. No módulo Pacientes, a tela usa componentes compartilhados; um cartão próprio com input/output não deve ser marcado como entregue se não estiver no código.

### Para que serve o track no @for?

track identifica cada item por uma chave estável, como _id, e permite reutilizar a representação de itens que continuam na lista. Evita recriar elementos apenas porque a coleção mudou.

## Aula 04 — Formulário reativo com validação

### O que acontece com um formulário inválido quando o usuário clica em Salvar? Onde isso está no código?

O botão fica desabilitado enquanto inválido ou salvando. O método de envio também marca os campos como tocados e recusa a operação inválida. Veja RegistroForm em features/gestao/shared e o formulário de Acesso no portal.

### Se o front já valida, por que o back-end também precisa validar?

A tela pode ser modificada ou ignorada por outro cliente HTTP. DTOs validam a entrada, services aplicam as regras e índices do MongoDB protegem unicidade. A interface não é a autoridade de segurança.

## Aula 05 — Serviço com dados simulados (mock)

### Por que os componentes dependem da classe abstrata e não do PetsMockService diretamente?

A classe abstrata define o contrato, e o provider escolhe a implementação. Isso permitiu começar com mock e migrar para HTTP sem fazer a página conhecer detalhes do armazenamento. Hoje os providers de produção usam a API diretamente.

### Para que serve o delay(400) no mock?

delay(400) simulava a espera de uma rede e ajudava a exercitar carregamento no mock. Ele não faz uma chamada HTTP. Os mocks históricos permanecem para testes; não alimentam as telas atuais.

## Aula 06 — Rotas, navegação e entrega do front

### Como o formulário sabe se está criando ou editando?

Nos cadastros, o parâmetro id da rota distingue edição de criação. Com id, a página busca o registro e preenche o formulário; sem id, prepara um novo e envia POST. Relatórios é somente leitura e não usa esse fluxo.

### Cite dois itens do checklist de front-end que você precisou corrigir.

Duas correções registradas foram a adaptação da listagem ao celular e a mensagem de indisponibilidade quando a API estava desligada. A verificação atual inclui largura, navegação e testes do formulário; a autoria individual de cada mudança deve ser consultada nos commits.

## Aula 07 — Modelagem de dados

### Quais módulos o seu referencia, e quais referenciam o seu?

As dependências específicas e as coleções relacionadas estão no contexto do módulo abaixo. Relatórios apenas lê os dados; não cria referências persistidas próprias. Referencia convênios e, opcionalmente, usuários. Consultas referencia pacientes.

### Justifique a escolha entre referência e embutido em uma das relações.

Referências ObjectId atendem entidades compartilhadas e com ciclo de vida independente. O service valida existência e propriedade. Dados embutidos seriam adequados para conteúdo que pertence apenas ao documento ou para uma fotografia histórica deliberada. Referencia convênios e, opcionalmente, usuários. Consultas referencia pacientes.

### Qual índice você criou e qual consulta ele acelera?

O índice específico aparece abaixo. Índices únicos garantem unicidade, e índices de busca ou ordenação podem acelerar consultas compatíveis. Não basta criar um índice para provar desempenho; o plano e a carga ainda precisam ser medidos. pacientes_email_unico em email; pacientes_usuario_unico é parcial para vínculos ObjectId.

## Aula 08 — Schema, módulo e dados de exemplo

### Por que o enum precisa de type: String no @Prop?

Quando uma propriedade de TypeScript usa uma união de textos, o metadado emitido pode não fornecer o tipo esperado pelo Mongoose. type: String explicita que o enum valida uma string, como o status de Consulta.

### O que faria o banco recusar um documento do seu módulo? Cite duas validações.

O schema recusa campos que violam as validações que ele declara; índices únicos recusam duplicidades. DTO e service podem impor condições adicionais, como nascimento não futuro. As validações particulares estão abaixo. nome com 3 a 80 caracteres e campos clínicos obrigatórios; e-mail duplicado viola o índice.

## Aula 09 — Controller, service e CRUD

### Onde está a regra de negócio do seu módulo: no controller ou no service? Por quê?

A regra fica no service porque deve valer para chamadas de qualquer cliente. O controller recebe a rota, o DTO e os parâmetros e delega a ação. O banco complementa a defesa com índices e validações de schema. Fonte: backend/src/pacientes/pacientes.service.ts.

### Que código HTTP a sua rota de exclusão devolve e por que ela não tem corpo?

Nos cadastros, DELETE retorna 204 sem corpo. A ação inativa o documento; em Consultas, cancela e preserva o histórico. Relatórios não oferece exclusão. O interceptor não deve fabricar um corpo para 204.

## Aula 10 — DTOs, testes e documentação

### O que o whitelist: true do ValidationPipe faz com um campo que não está no DTO?

whitelist remove propriedades não declaradas pelos validadores do DTO. Como a Clinora também configura forbidNonWhitelisted: true, um campo extra provoca 400 em vez de ser silenciosamente aceito.

### Por que o teste usa um Model "dublê" (mock) em vez do MongoDB de verdade?

O dublê isola a regra para testar caminhos e erros com rapidez e previsibilidade. Ele não comprova persistência real; os verificadores HTTP usam NestJS e MongoDB em bancos temporários para esse outro nível de evidência.

### Qual foi a cobertura de testes do seu service?

O percentual específico de linhas está abaixo, medido com npm run test:cov -- --runInBand. O relatório global inclui também controllers, seeds, verificadores e configuração. Testes HTTP externos não são somados a essa cobertura unitária. Cobertura de linhas de pacientes/pacientes.service.ts: 56.75%.

## Aula 11 — Regras de negócio, estados e relatórios

### Descreva uma regra do seu módulo como pré-condição → ação → pós-condição.

Pré-condição, ação e pós-condição descrevem uma regra verificável. O exemplo do módulo e o comportamento quando ela é violada estão no contexto abaixo. Paciente válido e e-mail livre → cadastrar → ficha ativa persistida. E-mail duplicado retorna 409.

### O que acontece se alguém chamar a API direto, sem a tela, tentando violar essa regra?

A API aplica DTOs, guard, service e índice sem depender da tela. Uma tentativa inválida recebe 400, 401, 403, 404 ou 409 conforme o caso; não é autorizada por conhecer a URL. Paciente válido e e-mail livre → cadastrar → ficha ativa persistida. E-mail duplicado retorna 409.

## Aula 12 — Autenticação com JWT e senhas com hash

### Qual a diferença entre autenticação e autorização?

Autenticação confirma a identidade com a senha e o JWT. Autorização confere se o perfil pode executar a ação. Falta de autenticação gera 401; perfil insuficiente gera 403.

### Por que a senha é guardada como hash e não criptografada de forma reversível?

bcrypt é de mão única e usa salt e fator de custo. O sistema precisa comparar a senha, não recuperar seu texto. Guardar hash não torna senhas fracas impossíveis de adivinhar; por isso o hash não deve ser publicado.

### O que vai dentro do seu token e por que não colocamos o e-mail ou a senha?

O JWT contém sub, nome e perfil, com iat e exp; após redefinição pode conter jti para a versão de sessão. O payload pode ser lido, portanto não contém senha, hash ou e-mail. A assinatura verifica integridade, não sigilo do payload.

## Aula 13 — Perfis de acesso e integração front + API

### O que o interceptor faz em cada requisição e o que acontece quando a API responde 401?

Os interceptors enviam o JWT somente para as rotas privadas da API configurada. Um 401 da sessão atual limpa somente a sessão correspondente e volta ao login; 403 informa falta de permissão sem deslogar. Respostas antigas não encerram um login novo.

### Por que esconder um botão na tela não é controle de acesso?

O usuário pode alterar o navegador ou chamar a API diretamente. Esconder um botão orienta a navegação; o guard do servidor é quem impede a operação sem o perfil exigido.

### O que precisou mudar nos componentes do seu módulo para trocar o mock pela API? Por quê?

Os providers passaram a usar os serviços HTTP, as referências passaram a IDs reais e as datas foram ajustadas ao contrato. Os componentes mantêm estados de carregamento, erro e vazio. Os mocks históricos não são o armazenamento da versão atual. Veja app.config.ts e o serviço da API do módulo.

## Aula 14 — Robustez, testes finais e documentação

### Qual a diferença entre a mensagem que o usuário vê e o que vai para o log?

O usuário deve receber uma mensagem compreensível. Detalhes técnicos pertencem ao log sem expor senha ou token. A Clinora ainda não registra toda falha esperada em um filtro global próprio; esse item da aula 14 permanece pendente.

### Cite uma limitação conhecida do seu módulo e como você a resolveria.

A limitação específica e a proposta de melhoria aparecem no contexto abaixo. A revisão documental registra essa situação sem afirmar que o código pendente foi concluído. O cadastro público e a ficha clínica são distintos. Melhorar a orientação e completar a auditoria de acessibilidade.
