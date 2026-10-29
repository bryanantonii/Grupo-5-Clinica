# Modelo de Convênios

Banco: clinora. Coleção: convenios. Model registrado no Nest: Convenio.

| Campo | Tipo BSON esperado | Obrigatório na criação | Regra |
| --- | --- | --- | --- |
| _id | ObjectId | Automático | Gerado pelo MongoDB/Mongoose |
| nome | String | Sim | trim, 3 a 60 caracteres, índice único com collation pt strength 1 |
| codigoAns | String | Sim | Exatamente seis dígitos, índice único, preserva zeros |
| percentualCobertura | Number | Sim | Número inteiro de 0 a 100 |
| telefone | String | Não | Quando preenchido, formato (DD) NNNN-NNNN ou (DD) NNNNN-NNNN |
| modalidade | String | Pode ser omitido | Enum individual ou coletivo; padrão individual |
| ativo | Boolean | Pode ser omitido | Padrão true |
| createdAt | Date | Automático | Data de criação |
| updatedAt | Date | Automático | Data da última atualização |
| __v | Number | Automático | Controle de versão padrão do Mongoose |

## Extensão do contrato prevista

modalidade foi acrescentado com confirmação durante a atividade de 29/10/2026 para exercitar enum e valor padrão. O guia original não previa esse campo. A revisão do grupo e do PO continua pendente. O controller e os DTOs HTTP ainda não foram implementados nesta entrega; quando forem criados, devem aceitar modalidade opcional, aplicar o enum e considerar ativo apenas nas operações permitidas.

Os índices de unicidade protegem os cadastros ativos e inativos. A exclusão lógica futura deve manter o documento com ativo false; ela não libera automaticamente nome ou ANS para reutilização.

O schema Mongoose não corresponde a uma regra de validação server-side criada no Atlas. O controle de acesso e eventual validação da coleção precisam ser tratados na integração e na configuração do banco.
