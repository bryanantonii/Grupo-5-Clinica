# Respostas das aulas 11 a 13

Registro original da aula 12, complementado em 6 de novembro de 2026.

## Aula 12


## Qual a diferença entre autenticação e autorização

Autenticação confirma a identidade. Na Clinora, o login compara a senha com o
hash e emite um JWT; o guard verifica esse token. Se essa verificação falhar,
a API devolve 401. Autorização decide quais ações o usuário identificado pode
executar. O controle por perfil e os bloqueios com 403 foram acrescentados na aula 13.

## Por que a senha é guardada como hash

O sistema precisa conferir a senha, não recuperar seu texto original. Usei
bcrypt com custo 10 e salt aleatório para fazer essa comparação. Uma criptografia
reversível permitiria recuperar as senhas com a chave. O hash também não é
devolvido nas respostas: o schema possui select false e os services retornam
somente campos públicos.

## O que vai dentro do token

O payload recebe sub, nome e perfil. A biblioteca acrescenta iat e exp para
registrar a emissão e o vencimento de uma hora. Não coloquei e-mail, senha nem
hash porque o conteúdo do token pode ser lido. A assinatura permite verificar
sua integridade; ela não torna o payload secreto.


## Aula 11

### Uma regra como pré condição ação e pós condição

Na integração da agenda, a pré-condição é existir paciente e profissional ativos, com data futura dentro do expediente e horário livre. A ação é cadastrar uma consulta. A pós-condição é uma consulta marcada no MongoDB, vinculada pelos IDs reais. O índice único impede que duas requisições ocupem o mesmo horário do profissional.

### Chamar a API diretamente permite violar a regra

Não. O service valida as referências, o expediente e o conflito, e o banco garante o índice. O DTO impede a injeção de status ou de campos inesperados. Violações retornam 400 ou 409 e não dependem da validação da tela.

## Aula 13

### O que o interceptor faz e o que acontece com 401

O interceptor acrescenta Authorization Bearer com o JWT nas requisições privadas da API configurada. Ele não envia o token a outros sites, ao login ou ao catálogo público. Em 401 da sessão atual, limpa o sessionStorage e volta ao login. Em 403 mantém a sessão e informa a falta de permissão. Uma resposta de um login anterior não encerra uma sessão mais recente.

### Por que esconder um botão não é controle de acesso

O navegador pode ser alterado, e qualquer cliente pode tentar chamar a API. Esconder Excluir melhora a interface, mas quem barra a operação é o PerfisGuard, usando o perfil do JWT validado pelo JwtAuthGuard. Atendentes recebem 403 ao tentar as rotas restritas diretamente.

### O que mudou para trocar o mock pela API

Criei os adaptadores HTTP dos módulos que faltavam, registrei os providers e defini usarMock false. Os componentes continuam usando os contratos abstratos dos serviços. Ajustei as referências para IDs reais, as datas, os menus e as ações por perfil. Os formulários compartilhados foram reaproveitados, enquanto as regras finais passaram a ser conferidas também nos services e no MongoDB.
