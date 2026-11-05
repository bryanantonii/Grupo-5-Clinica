# Respostas da aula 12

## Qual a diferença entre autenticação e autorização

Autenticação confirma a identidade. Na Clinora, o login compara a senha com o
hash e emite um JWT; o guard verifica esse token. Se essa verificação falhar,
a API devolve 401. Autorização decide quais ações o usuário identificado pode
executar. O controle por perfil e os bloqueios com 403 ficam para a aula 13.

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
