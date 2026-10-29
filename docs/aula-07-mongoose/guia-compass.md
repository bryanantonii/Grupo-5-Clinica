# Conferência no MongoDB Compass

A conferência visual foi concluída em 29 de outubro de 2026 no Compass 1.53.2 aberto neste PC. O aplicativo conectou ao Atlas configurado no backend, no banco `clinora`, coleção `convenios`. Os cinco documentos e seus IDs coincidem com a verificação pelo Nest.

## Resultados observados

| Filtro em Documents | Quantidade | Resultado |
| --- | --- | --- |
| `{}` | 5 | Os cinco exemplos do seed |
| `{ "ativo": true }` | 4 | Saúde Mais, Vida Plena, Bem Cuidar e Proteção Familiar |
| `{ "ativo": false }` | 1 | Horizonte Saúde |
| `{ "codigoAns": "045678" }` | 1 | Proteção Familiar com o zero inicial preservado |

Os documentos apresentam `_id` como ObjectId, ANS como String, `ativo` como Boolean e `createdAt`/`updatedAt` como datas ISODate. A modalidade corresponde aos exemplos individuais e coletivos.

Na aba Indexes, os quatro índices apareceram como **READY**:

- `_id_`: único, criado pelo MongoDB.
- `convenios_nome_unico`: UNIQUE e COLLATION.
- `convenios_ans_unico`: UNIQUE.
- `convenios_ativos_nome`: COMPOUND com `ativo` e `nome` em ordem crescente.

Foram feitas apenas consultas. Nenhum documento ou índice foi criado, alterado ou excluído nesta conferência. A conexão não foi salva no Compass.

## Evidências

- [Documentos e campos](evidencias/compass-documentos.png).
- [Cinco linhas na tabela](evidencias/compass-tabela.png).
- [Quatro ativos](evidencias/compass-ativos.png).
- [Um inativo](evidencias/compass-inativo.png).
- [ANS com zero inicial](evidencias/compass-ans-zero.png).
- [Índices e campos do índice composto](evidencias/compass-indices.png).
- [Registro dos resultados](evidencias/compass-verificacao.json).

## Como repetir a demonstração

1. Abra o Compass.
2. No Atlas do grupo, use Connect e a opção Compass. Configure a conexão autorizada com o mesmo banco clinora. Use os dados de acesso diretamente no aplicativo; não publique a URI em prints, documentos, issues ou PRs.
3. Abra o banco clinora e a coleção convenios.
4. Em Documents, confira os cinco exemplos. Use o filtro {} para ver todos e { ativo: true } para conferir os quatro ativos.
5. Use { ativo: false } para ver o único inativo e { codigoAns: "045678" } para verificar o zero à esquerda. Confira modalidade, createdAt e updatedAt no documento.
6. Em Indexes, confira _id_, convenios_nome_unico, convenios_ans_unico e convenios_ativos_nome.
7. Para evidenciar uma nova execução, registre a data e uma captura sem exibir credenciais.

## Problemas comuns

- Não conecta: conferir usuário do banco, senha, URI, rede permitida e disponibilidade do cluster com o responsável pelo Atlas. A conta do site Atlas é diferente do usuário do banco.
- Banco ou coleção não aparece: conferir o nome clinora, executar npm run seed com a configuração correta e atualizar a lista de bancos.
- E11000: existe um valor que conflita com um índice único. Não apague o índice para esconder o problema; confira os dados duplicados.
- Dados inválidos entram por edição direta: o schema Mongoose é aplicado pelo model, não automaticamente pelo Compass. O validator da coleção é uma configuração separada.
