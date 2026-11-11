# Contrato da API da Clinora

| Sistema | Grupo | Tema | Versão e data |
| --- | --- | --- | --- |
| Clinora | 5 | Clínica | Entrega final 11/11/2026 |

Contrato da versão integrada com 54 operações HTTP. O prefixo é /api/v1. As rotas, entradas e permissões abaixo correspondem ao código atual; o OpenAPI exportado acompanha esta entrega em docs/entrega-final/openapi.json.

## Convenções do grupo

| Item | Padrão adotado |
| --- | --- |
| Endereços locais | API http://localhost:3000/api/v1 e Swagger http://localhost:3000/api/docs. |
| Sucesso com conteúdo | JSON com sucesso igual a true e dados contendo objeto ou lista. |
| DELETE | 204 sem corpo; inativa cadastros ou cancela a consulta. |
| Erro atual | Formato padrão NestJS com statusCode, message e error. message pode ser uma lista nas validações. O filtro próprio da aula 14 ainda não está registrado. |
| Autenticação | Authorization: Bearer seguido do JWT somente nas rotas privadas. Validade de uma hora; a API verifica perfil, conta ativa e revogação. |
| Datas | Nascimento em AAAA-MM-DD; consultas em ISO 8601 com Z ou deslocamento explícito. Expediente calculado em America/Sao_Paulo. |
| Entradas | DTOs com whitelist e forbidNonWhitelisted. Campo extra é recusado com 400. IDs de referência devem existir. |
| Paginação | Não implementada. As listas expõem os filtros documentados, sem contrato de página ou limite. |

Exemplo de erro atual: {"statusCode":400,"message":"O id do convênio não é válido.","error":"Bad Request"}. Não se deve esperar os campos sucesso, caminho e dataHora do filtro proposto no manual enquanto ele não estiver implementado.

## Autenticação e recuperação

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| POST | /auth/cadastro-paciente | nome, email, senha | Objeto em dados | 201, 400, 409 | público |
| POST | /auth/login-paciente | email, senha | Objeto em dados | 200, 400, 401 | público |
| POST | /auth/login | email, senha | Objeto em dados | 200, 400, 401 | público |
| GET | /auth/me | Sem corpo | Objeto em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /auth/recuperar-acesso | email | Objeto em dados | 200, 400, 503 | público |
| POST | /auth/redefinir-senha | senha, token | Objeto em dados | 200, 400 | público |

O cadastro público fixa perfil paciente. POST /usuarios cria somente atendentes; admin inicial é criado pelo seed. A recuperação exige SMTP e retorna 503 quando não configurada. O token de recuperação vale 30 minutos, é de uso único e invalida sessões anteriores após a troca de senha.

## Módulo A Pacientes

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /pacientes | Query: busca, todos | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /pacientes | nome, email, telefone, dataNascimento, convenio | Objeto em dados | 201, 400, 401, 403, 409 | admin ou atendente |
| GET | /pacientes/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | admin ou atendente |
| PATCH | /pacientes/{id} | nome, email, telefone, dataNascimento, convenio | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |
| DELETE | /pacientes/{id} | Sem corpo | Sem corpo | 204, 400, 401, 403, 404 | admin |

## Módulo B Profissionais

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /profissionais | Query: busca, especialidade, todos | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /profissionais | nome, registro, especialidade, email, telefone | Objeto em dados | 201, 400, 401, 403, 404, 409 | admin ou atendente |
| GET | /profissionais/opcoes/especialidades | Sem corpo | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| GET | /profissionais/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | admin ou atendente |
| PATCH | /profissionais/{id} | nome, registro, especialidade, email, telefone, ativo | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |
| DELETE | /profissionais/{id} | Sem corpo | Sem corpo | 204, 400, 401, 403, 404 | admin |

## Módulo C Consultas

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /consultas | Query: busca, todos, status | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /consultas | especialidade, convenio, paciente, profissional, dataHora, motivo | Objeto em dados | 201, 400, 401, 403, 409 | admin ou atendente |
| GET | /consultas/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | admin ou atendente |
| PATCH | /consultas/{id} | especialidade, convenio, paciente, profissional, dataHora, motivo | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |
| DELETE | /consultas/{id} | Sem corpo | Sem corpo | 204, 400, 401, 403, 404 | admin |
| PATCH | /consultas/{id}/status | status | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |

GET permite busca pelo paciente e filtro status. POST inicia em marcada. PATCH /:id/status usa marcada para confirmada ou cancelada; confirmada para realizada, falta ou cancelada. DELETE administrativo cancela, sem apagar. Conflito refere-se ao mesmo instante, não a intervalos completos de duração.

## Módulo D Especialidades

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /especialidades | Query: busca, todos | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /especialidades | nome, descricao, duracaoConsultaMin, valorParticular | Objeto em dados | 201, 400, 401, 403, 409 | admin ou atendente |
| GET | /especialidades/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | admin ou atendente |
| PATCH | /especialidades/{id} | nome, descricao, duracaoConsultaMin, valorParticular | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |
| DELETE | /especialidades/{id} | Sem corpo | Sem corpo | 204, 400, 401, 403, 404 | admin |

## Módulo E Convênios

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /convenios | Query: busca, todos | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /convenios | nome, codigoAns, percentualCobertura, telefone, modalidade | Objeto em dados | 201, 400, 401, 403, 409 | admin ou atendente |
| GET | /convenios/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | admin ou atendente |
| PATCH | /convenios/{id} | nome, codigoAns, percentualCobertura, telefone, modalidade | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |
| DELETE | /convenios/{id} | Sem corpo | Sem corpo | 204, 400, 401, 403, 404 | admin |

## Módulo F Relatórios

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /relatorios/resumo | Sem corpo | Objeto em dados | 200, 400, 401, 403 | admin |
| GET | /relatorios/consultas-por-status | Sem corpo | Lista em dados | 200, 400, 401, 403 | admin |
| GET | /relatorios/consultas-por-especialidade | Sem corpo | Lista em dados | 200, 400, 401, 403 | admin |

resumo retorna pacientes, consultasMarcadas e faltas. consultasMarcadas inclui marcada e confirmada. Por status retorna _id e quantidade; por especialidade retorna especialidade e quantidade, contando somente realizadas. Não recebe filtro de período.

## Portal do paciente

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /conta | Sem corpo | Objeto em dados | 200, 400, 401, 403 | paciente |
| PATCH | /conta | nome, email, telefone | Objeto em dados | 200, 400, 401, 403, 409 | paciente |
| GET | /conta/consultas | Sem corpo | Lista em dados | 200, 400, 401, 403 | paciente |
| POST | /conta/consultas | profissional, especialidade, dataHora, dataNascimento, telefone, convenio, motivo, ciente | Objeto em dados | 201, 400, 401, 403, 409 | paciente |
| GET | /conta/consultas/cadastro | Sem corpo | Objeto em dados | 200, 400, 401, 403 | paciente |
| GET | /conta/consultas/{id} | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404 | paciente |
| PATCH | /conta/consultas/{id}/cancelar | Sem corpo | Objeto em dados | 200, 400, 401, 403, 404, 409 | paciente |

As consultas usam a identidade validada do JWT. O corpo não aceita paciente de terceiro. O primeiro agendamento cria ou atualiza a ficha clínica vinculada à conta; criar apenas a conta salva em usuarios. Não há remarcação direta pelo paciente: cancelar a elegível e fazer novo agendamento.

## Catálogo público

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| GET | /catalogo/profissionais | Sem corpo | Lista em dados | 200, 400 | público |
| GET | /catalogo/especialidades | Sem corpo | Lista em dados | 200, 400 | público |
| GET | /catalogo/horarios | Query: profissional, data | Objeto em dados | 200, 400 | público |
| GET | /catalogo/convenios | Sem corpo | Lista em dados | 200, 400 | público |

## Usuários e mensagens

| Verbo | Rota sem prefixo | Entrada | Resposta | Códigos | Perfil |
| --- | --- | --- | --- | --- | --- |
| POST | /usuarios | nome, email, senha, perfil | Objeto em dados | 201, 400, 401, 403, 409 | admin |
| GET | /usuarios | Sem corpo | Lista em dados | 200, 400, 401, 403 | admin |
| PATCH | /usuarios/{id}/paciente | paciente | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin |
| GET | /usuarios/me | Sem corpo | Objeto em dados | 200, 400, 401, 403 | admin ou atendente |
| POST | /contatos | nome, email, assunto, mensagem | Objeto em dados | 201, 400 | público |
| GET | /contatos | Sem corpo | Lista em dados | 200, 400, 401, 403 | admin ou atendente |
| PATCH | /contatos/{id}/leitura | lida | Objeto em dados | 200, 400, 401, 403, 404, 409 | admin ou atendente |

Vincular paciente exige mesmo e-mail, ficha ativa e ausência de outro vínculo. O administrador deve conferir a identidade antes da operação. Mensagens aceitam os assuntos Agendamento, Convênios, Acesso à clínica e Outros assuntos; marcar leitura recebe lida igual a true.

## Modelos e exemplos de entrada

pacientes: {"nome": "Paciente Exemplo", "email": "paciente@example.com", "telefone": "(51) 99999-1234", "dataNascimento": "1995-05-21", "convenio": null}

profissionais: {"nome": "Dra. Exemplo", "registro": "CRM-RS 12345", "especialidade": "665f1c2b9a1e4b0012345678", "email": "profissional@example.com", "telefone": "(51) 99999-1234"}

consultas: {"paciente": "665f1c2b9a1e4b0012345678", "profissional": "665f1c2b9a1e4b0012345678", "dataHora": "2027-03-01T09:00:00-03:00", "motivo": "Consulta de avaliação"}

especialidades: {"nome": "Clínica geral", "descricao": "Consulta de avaliação geral", "duracaoConsultaMin": 30, "valorParticular": 150}

convenios: {"nome": "Convênio Exemplo", "codigoAns": "012345", "percentualCobertura": 80, "telefone": "(51) 99999-1234", "modalidade": "individual"}

Os exemplos são fictícios. IDs ilustrativos devem ser substituídos pelos IDs obtidos no catálogo ou na gestão. A data da consulta deve ser futura, útil e dentro do expediente no momento do teste. Campos completos, tipos, índices e sensibilidade estão no Dicionário de Dados.

## Histórico de mudanças

| Data | Mudança | Motivo e evidência |
| --- | --- | --- |
| 06/11/2026 | CRUDs, perfis e conta pública. | Integração registrada nas evidências da aula 13. |
| 09/11/2026 | Portal, contatos, recuperação e CORS local. | PR 11, testes HTTP e registros de integração real. |
| 10/11/2026 | PR 11 integrado à develop; correção da mensagem quando a API está inacessível. | Merge d8f60ed e commit 673145e. |
| 11/11/2026 | Contrato consolidado e OpenAPI com descrições, exemplos e respostas. | Revisão documental da entrega final. |
