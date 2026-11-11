# Dicionário de Dados da Clinora

| Sistema | Grupo | Tema | Versão e data |
| --- | --- | --- | --- |
| Clinora | 5 | Clínica | Entrega final 11/11/2026 |

O MongoDB da Clinora contém oito coleções da aplicação. Este documento descreve campos, validações, referências, índices e dados pessoais da versão atual. Relatórios calcula agregações e não mantém uma coleção própria.

## Visão geral das coleções

| Coleção | Finalidade | Referências |
| --- | --- | --- |
| pacientes | Ficha clínica | usuarios, convenios |
| profissionais | Equipe clínica | especialidades |
| consultas | Agenda e estados | pacientes, profissionais, especialidades, convenios |
| especialidades | Serviços e parâmetros | Sem referências externas |
| convenios | Cobertura e identificação ANS | Sem referências externas |
| usuarios | Contas e autenticação | Sem referências externas |
| contatos | Mensagens recebidas | Sem referências externas |
| recuperacoes | Recuperação de senha | usuarios |

String, Number, Boolean, Date e ObjectId são tipos do Mongoose. Datas de instantes são serializadas em ISO 8601. Os exemplos abaixo são fictícios. Os campos pessoais e os de autenticação devem ter acesso restrito; o projeto não constitui certificação de conformidade ou uso clínico real.

Uma conta em usuarios não equivale à ficha em pacientes. A conta é criada no cadastro público; a ficha clínica é criada no primeiro agendamento ou pela equipe. O vínculo usa usuario, não apenas coincidência de e-mail. O Mongoose pode manter __v como versão interna; esse campo não é requisito de negócio.

## Coleção pacientes

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| usuario | ObjectId | Não | Referência ObjectId para usuarios. Existência e acesso conferidos no service. | Sim | ObjectId fictício |
| nome | String | Sim | Texto aparado de 3 a 80 caracteres. | Sim | Pessoa ou recurso exemplo |
| email | String | Sim | E-mail normalizado para minúsculas; formato validado no DTO. | Sim | pessoa@example.com |
| telefone | String | Sim | Formato brasileiro com DDD; no cadastro da conta pode ser vazio. | Sim | (51) 99999-1234 |
| dataNascimento | Date | Sim | Data válida e não futura; obrigatória na ficha clínica e no primeiro agendamento. | Sim | 1995-05-21 |
| convenio | ObjectId | Não | Referência ObjectId para convenios. Opcional; null representa particular. | Sim | null ou ObjectId |
| ativo | Boolean | Sim | Booleano; padrão true. Inativação preserva o documento. | Não | true |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Sim | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

email 1; único; pacientes_email_unico.

usuario 1; único; pacientes_usuario_unico; parcial: {"usuario": {"$type": "objectId"}}.

## Relações e decisão de modelagem

As referências permitem compartilhar cadastros e manter o ciclo de vida de cada módulo. MongoDB não aplica uma chave estrangeira automaticamente; os services validam existência e, quando exigido pelo fluxo, atividade e propriedade. A ADR 001 registra a decisão. Em Profissionais, a especialidade é resolvida por consulta explícita no service, sem uso de populate nesse schema.

Fonte do schema: backend/src/pacientes/schemas/paciente.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção profissionais

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | String | Sim | Texto aparado de 3 a 80 caracteres. | Pessoal | Pessoa ou recurso exemplo |
| registro | String | Sim | 4 a 20 caracteres; aparado, salvo em maiúsculas e único. | Pessoal | CRM-RS 12345 |
| especialidade | ObjectId | Sim | Referência ObjectId para especialidades. Existência e acesso conferidos no service. | Não | ObjectId fictício |
| email | String | Sim | E-mail normalizado para minúsculas; formato validado no DTO. | Pessoal | pessoa@example.com |
| telefone | String | Sim | Formato brasileiro com DDD; no cadastro da conta pode ser vazio. | Pessoal | (51) 99999-1234 |
| ativo | Boolean | Não | Booleano; padrão true. Inativação preserva o documento. | Não | true |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Não | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

registro 1; único.

email 1; único.

especialidade 1, ativo 1.

## Relações e decisão de modelagem

As referências permitem compartilhar cadastros e manter o ciclo de vida de cada módulo. MongoDB não aplica uma chave estrangeira automaticamente; os services validam existência e, quando exigido pelo fluxo, atividade e propriedade. A ADR 001 registra a decisão. Em Profissionais, a especialidade é resolvida por consulta explícita no service, sem uso de populate nesse schema.

Fonte do schema: backend/src/profissionais/schemas/profissional.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção consultas

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| especialidade | ObjectId | Não | Referência ObjectId para especialidades. Existência e acesso conferidos no service. | Não | ObjectId fictício |
| convenio | ObjectId | Não | Referência ObjectId para convenios. Opcional; null representa particular. | Sim | null ou ObjectId |
| paciente | ObjectId | Sim | Referência ObjectId para pacientes. Existência e acesso conferidos no service. | Sim | ObjectId fictício |
| profissional | ObjectId | Sim | Referência ObjectId para profissionais. Existência e acesso conferidos no service. | Não | ObjectId fictício |
| dataHora | Date | Sim | Date armazenada em UTC. Entrada ISO com fuso; validação do expediente no service. | Sim | 2027-03-01T12:00:00Z |
| motivo | String | Não | Texto opcional de até 300 caracteres. | Sim | Avaliação |
| status | String | Sim | marcada, confirmada, realizada, falta ou cancelada; padrão marcada. | Não | marcada |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Não | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

profissional 1, dataHora 1; único; consultas_horario_unico; parcial: {"status": {"$in": ["marcada", "confirmada", "realizada", "falta"]}}.

status 1, dataHora 1.

## Relações e decisão de modelagem

As referências permitem compartilhar cadastros e manter o ciclo de vida de cada módulo. MongoDB não aplica uma chave estrangeira automaticamente; os services validam existência e, quando exigido pelo fluxo, atividade e propriedade. A ADR 001 registra a decisão. Em Profissionais, a especialidade é resolvida por consulta explícita no service, sem uso de populate nesse schema.

O índice único parcial de profissional e dataHora inclui marcada, confirmada, realizada e falta; canceladas liberam o mesmo horário. Ele impede dois inícios iguais, mas não trata sobreposição de intervalos conforme a duração da especialidade. A mudança de status valida as transições e a concorrência.

Fonte do schema: backend/src/consultas/schemas/consulta.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção especialidades

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | String | Sim | Texto aparado de 3 a 50 caracteres. | Não | Pessoa ou recurso exemplo |
| descricao | String | Não | Texto opcional com até 300 caracteres. | Não | Consulta de avaliação |
| duracaoConsultaMin | Number | Sim | Inteiro de 15 a 120. | Não | 30 |
| valorParticular | Number | Sim | Número finito não negativo, em reais. | Não | 150 |
| ativo | Boolean | Sim | Booleano; padrão true. Inativação preserva o documento. | Não | true |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Não | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

nome 1; único; especialidades_nome_unico; collation pt strength 1.

Fonte do schema: backend/src/especialidades/schemas/especialidade.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção convenios

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | String | Sim | Texto aparado de 3 a 60 caracteres. | Não | Pessoa ou recurso exemplo |
| codigoAns | String | Sim | String de exatamente seis dígitos. Não converter para Number. | Não | 012345 |
| percentualCobertura | Number | Sim | Inteiro entre 0 e 100. | Não | 80 |
| telefone | String | Não | Formato brasileiro com DDD; no cadastro da conta pode ser vazio. | Não | (51) 99999-1234 |
| modalidade | String | Sim | individual ou coletivo; padrão individual. | Não | individual |
| ativo | Boolean | Sim | Booleano; padrão true. Inativação preserva o documento. | Não | true |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Não | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

nome 1; único; convenios_nome_unico; collation pt strength 1.

codigoAns 1; único; convenios_ans_unico.

ativo 1, nome 1; convenios_ativos_nome.

Fonte do schema: backend/src/convenios/schemas/convenio.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção usuarios

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | String | Sim | Texto aparado de 3 a 80 caracteres. | Sim | Pessoa ou recurso exemplo |
| email | String | Sim | E-mail normalizado para minúsculas; formato validado no DTO. | Sim | pessoa@example.com |
| versaoSessao | String | Não | Identificador de revogação do JWT; select false; muda na redefinição da senha. | Sim | Identificador omitido |
| senhaHash | String | Sim | bcrypt de senha, custo 10. Obrigatório, select false, nunca retornado na API. | Sim | Hash omitido |
| telefone | String | Não | Formato brasileiro com DDD; no cadastro da conta pode ser vazio. | Sim | (51) 99999-1234 |
| perfil | String | Sim | admin, atendente ou paciente. Visitante não escolhe admin. | Não | paciente |
| ativo | Boolean | Sim | Booleano; padrão true. Inativação preserva o documento. | Não | true |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Sim | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

email 1; único; usuarios_email_unico.

O hash bcrypt é uma transformação de mão única com salt. A autenticação compara usando bcrypt.compare. A regra de senha é validada no DTO: mínimo de oito caracteres e máximo de 72 bytes UTF-8. Campos selecionados da API excluem hash, senha e versão da sessão.

Fonte do schema: backend/src/usuarios/schemas/usuario.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção contatos

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| nome | String | Sim | Texto aparado de 3 a 80 caracteres. | Sim | Pessoa ou recurso exemplo |
| email | String | Sim | E-mail normalizado para minúsculas; formato validado no DTO. | Sim | pessoa@example.com |
| assunto | String | Sim | Na API: Agendamento, Convênios, Acesso à clínica ou Outros assuntos. | Sim | Agendamento |
| mensagem | String | Sim | 10 a 2000 caracteres, aparada. | Sim | Solicitação fictícia |
| situacao | String | Não | nova ou lida; padrão nova. | Sim | nova |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Sim | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

createdAt -1.

Fonte do schema: backend/src/contatos/contatos.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.

## Coleção recuperacoes

| Campo | Tipo | Obrig | Regras e validações | Sensível | Exemplo |
| --- | --- | --- | --- | --- | --- |
| usuario | ObjectId | Sim | Referência ObjectId para usuarios. Existência e acesso conferidos no service. | Sim | ObjectId fictício |
| tokenHash | String | Sim | SHA-256 do token de recuperação, não o token puro; select false. | Sim | Hash omitido |
| expiraEm | Date | Sim | Expiração em 30 minutos; verificada pela aplicação e índice TTL. | Sim | Instante UTC |
| _id | ObjectId | Auto | ObjectId gerado pelo MongoDB. | Sim | ObjectId fictício |
| createdAt | Date | Auto | Data de criação gerada por timestamps. | Não | Instante UTC |
| updatedAt | Date | Auto | Data da última atualização gerada por timestamps. | Não | Instante UTC |

## Índices e consultas atendidas

usuario 1; único.

tokenHash 1; único.

expiraEm 1; TTL com expiração conforme expiraEm.

## Relações e decisão de modelagem

As referências permitem compartilhar cadastros e manter o ciclo de vida de cada módulo. MongoDB não aplica uma chave estrangeira automaticamente; os services validam existência e, quando exigido pelo fluxo, atividade e propriedade. A ADR 001 registra a decisão. Em Profissionais, a especialidade é resolvida por consulta explícita no service, sem uso de populate nesse schema.

Há no máximo uma solicitação por usuário. O índice TTL remove documentos expirados de forma assíncrona; a aplicação também compara expiraEm antes de aceitar o token. A remoção atômica da solicitação impede reutilização. A senha redefinida usa bcrypt e uma nova versão de sessão.

Fonte do schema: backend/src/recuperacao/recuperacao.schema.ts. Validações adicionais de entrada e negócio ficam nos DTOs e services correspondentes.
