# Contrato e dicionário da aula 13

Prefixo da API: `/api/v1`. Respostas de sucesso com conteúdo ficam em `{sucesso: true, dados: ...}`. DELETE retorna 204 sem corpo. O Swagger está em `/api/docs`.

## Rotas de cadastro

Pacientes, Profissionais, Especialidades e Convênios expõem GET `/recurso`, GET `/recurso/:id`, POST `/recurso`, PATCH `/recurso/:id` e DELETE `/recurso/:id`.

Listagem aceita `busca` e `todos=true`. Profissionais também aceita `especialidade`. A busca escapa caracteres de expressão regular e não diferencia maiúsculas; os nomes únicos de Especialidades e Convênios usam a collation dos índices. DELETE inativa o cadastro e exige `admin`. As consultas pelo ID e com `todos=true` mantêm o histórico acessível.

Consultas expõe as mesmas operações, mais PATCH `/consultas/:id/status`. A listagem aceita `status` e busca pelo nome do paciente. Seu DELETE administrativo cancela sem apagar; o cancelamento normal usa a rota de status e pode ser executado por atendentes.

## Campos dos módulos

| Coleção | Campos | Validações e índices |
| --- | --- | --- |
| pacientes | nome, email, telefone, dataNascimento, convenio opcional, ativo | Nome 3–80, e-mail normalizado e único, telefone com DDD, nascimento no formato AAAA-MM-DD sem futuro; convênio existente e ativo. |
| profissionais | nome, registro, especialidade, email, telefone, ativo | Regras existentes de registro/e-mail únicos; especialidade passa a ser ObjectId no schema. |
| especialidades | nome, descricao, duracaoConsultaMin, valorParticular, ativo | Nome 3–50 e único, descrição até 300, duração inteira 15–120, valor finito não negativo. |
| convenios | nome, codigoAns, percentualCobertura, telefone, modalidade, ativo | Nome 3–60 e único, ANS com seis dígitos e único, cobertura inteira 0–100; modalidade individual/coletivo, padrão individual. |
| consultas | paciente, profissional, dataHora, motivo, status | Referências ObjectId; paciente e profissional ativos; motivo até 300; status começa em marcada. Índice único de profissional/dataHora para estados não cancelados. |

Os schemas registram `createdAt` e `updatedAt` automaticamente. Os DTOs rejeitam campos inesperados e não permitem que atendentes inativem cadastros por PATCH. Em Profissionais, o campo `ativo` existente só pode ser alterado por administrador.

Consultas recebe `dataHora` ISO 8601 com Z ou deslocamento explícito. A API valida o expediente no fuso `America/Sao_Paulo`: futuro, segunda a sexta, a partir das 8h e antes das 18h. O Angular converte o controle datetime-local para ISO antes de enviar.

Transições: marcada → confirmada/cancelada; confirmada → realizada/falta/cancelada; estados finais sem novas transições. Edição de encerradas e mudanças concorrentes inconsistentes são recusadas.

## Relatórios

Todos os endpoints exigem `admin`:

- GET `/relatorios/resumo`: `{pacientes, consultasMarcadas, faltas}`; marcadas inclui marcada e confirmada.
- GET `/relatorios/consultas-por-status`: `[{_id: status, quantidade}]`.
- GET `/relatorios/consultas-por-especialidade`: `[{especialidade, quantidade}]`, somente realizadas; utiliza `$lookup` entre Consultas, Profissionais e Especialidades. A leitura aceita IDs antigos de especialidade em texto por `$convert`.

## Autenticação e perfis

POST `/auth/login` é público. O JWT fica em `dados.accessToken` e vale uma hora. GET `/auth/me` e GET `/usuarios/me` exigem identidade válida. POST `/usuarios` exige `admin` e cadastra somente atendentes. As regras de senha, hash e variáveis locais da aula 12 continuam válidas.

GET `/catalogo/profissionais` e GET `/catalogo/especialidades` continuam públicos e somente de leitura. A equipe pública não expõe contato privado. Nenhuma rota de Produtos foi acrescentada.

Erros: 400 para dados, IDs e transições inválidos; 401 para autenticação; 403 para perfil insuficiente; 404 para registro inexistente; 409 para duplicidades, horário ocupado ou concorrência de atualização.

## Seed e segurança

`npm run configurar:auth` prepara também `SEED_ATENDENTE_NOME`, `SEED_ATENDENTE_EMAIL` e `SEED_ATENDENTE_SENHA`, preservando variáveis existentes. `npm run seed` mantém o administrador e os cadastros, insere o atendente ausente e completa somente campos ausentes das três especialidades conhecidas, com os valores fictícios do C1. Repetir não troca senha nem sobrescreve esses valores.

Credenciais e JWT_SECRET ficam no `.env` ignorado pelo Git. O frontend usa sessionStorage, nunca localStorage, e envia o JWT somente às rotas privadas da API configurada. O backend decide as permissões, independentemente dos menus ou de alterações na sessão do navegador.
