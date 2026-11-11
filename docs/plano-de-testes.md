# Plano de Testes da Clinora

| Sistema | Grupo | Tema | Versão e data |
| --- | --- | --- | --- |
| Clinora | 5 | Clínica | Entrega final 11/11/2026 |

Este plano relaciona requisitos, testes e evidências da Clinora. A execução de 11/11/2026 aprovou 179 testes Jest em 21 suítes e 95 testes do frontend. A cobertura é apresentada com o escopo real da medição, sem equivaler testes aprovados a cobertura total.

## Estratégia

| Nível | Ferramenta | Escopo e critério |
| --- | --- | --- |
| Unitário | Jest e dependências substituídas | Services, validação, autenticação, regras e documentação OpenAPI. Todos os casos executados devem passar. |
| HTTP e persistência | Verificadores NestJS, HTTP e MongoDB | Fluxos de gestão, conta e portal em bancos temporários próprios. Evidências anteriores identificadas pela data. |
| Frontend | Node test runner, Angular e Router | Tipagem, adaptadores, sessão, formulários e navegação. 48 + 15 + 32 testes. |
| Interface | Navegador | Navegação dos seis módulos e largura em 360, 390, 768 e 1440 px. Não substitui auditoria assistiva completa. |

Resultados atuais: evidencias/qualidade.json e evidencias/casos-jest.json nesta entrega. Evidências HTTP anteriores: docs/aula-13/evidencias/integracao.json com 81 verificações da gestão, conta-paciente.json com 56 e docs/integracao-real/evidencias/portal-http.json com 68. Os três verificadores foram executados em 06/11 e 09/11, conforme cada arquivo, e não são contados como novos testes Jest de hoje.

## Casos vinculados aos requisitos

| Caso | Requisito | Módulo | Entrada ou ação e resultado esperado | Registro obtido |
| --- | --- | --- | --- | --- |
| CT01 | RF01 | Pacientes | Cadastrar um registro válido | OK; HTTP anterior e testes do módulo |
| CT02 | RF02 | Pacientes | Listar registros ativos com busca | OK; HTTP anterior e testes do módulo |
| CT03 | RF03 | Pacientes | Editar um registro existente | OK; HTTP anterior e testes do módulo |
| CT04 | RF04 | Pacientes | Inativar um registro sem apagar o histórico | OK; HTTP anterior e testes do módulo |
| CT05 | RF05 | Profissionais | Cadastrar um registro válido | OK; HTTP anterior e testes do módulo |
| CT06 | RF06 | Profissionais | Listar registros ativos com busca | OK; HTTP anterior e testes do módulo |
| CT07 | RF07 | Profissionais | Editar um registro existente | OK; HTTP anterior e testes do módulo |
| CT08 | RF08 | Profissionais | Inativar um registro sem apagar o histórico | OK; HTTP anterior e testes do módulo |
| CT09 | RF09 | Consultas | Cadastrar uma consulta futura com paciente e profissional ativos | OK; HTTP anterior e testes do módulo |
| CT10 | RF10 | Consultas | Listar consultas e filtrar por status | OK; HTTP anterior e testes do módulo |
| CT11 | RF11 | Consultas | Editar os dados de uma consulta permitida | OK; HTTP anterior e testes do módulo |
| CT12 | RF12 | Consultas | Mudar o status respeitando as transições | OK; HTTP anterior e testes do módulo |
| CT13 | RF13 | Especialidades | Cadastrar um registro válido | OK; HTTP anterior e testes do módulo |
| CT14 | RF14 | Especialidades | Listar registros ativos com busca | OK; HTTP anterior e testes do módulo |
| CT15 | RF15 | Especialidades | Editar um registro existente | OK; HTTP anterior e testes do módulo |
| CT16 | RF16 | Especialidades | Inativar um registro sem apagar o histórico | OK; HTTP anterior e testes do módulo |
| CT17 | RF17 | Convênios | Cadastrar um registro válido | OK; HTTP anterior e testes do módulo |
| CT18 | RF18 | Convênios | Listar registros ativos com busca | OK; HTTP anterior e testes do módulo |
| CT19 | RF19 | Convênios | Editar um registro existente | OK; HTTP anterior e testes do módulo |
| CT20 | RF20 | Convênios | Inativar um registro sem apagar o histórico | OK; HTTP anterior e testes do módulo |
| CT21 | RF21 | Relatórios | Exibir pacientes ativos, consultas marcadas ou confirmadas e faltas | OK; Jest relatórios; Router; tela |
| CT22 | RF22 | Relatórios | Exibir a quantidade por status | OK; Jest relatórios; Router; tela |
| CT23 | RF23 | Relatórios | Exibir somente consultas realizadas por especialidade | OK; Jest relatórios; Router; tela |
| CT24 | RF24 | Relatórios | Informar quando não há dados, está carregando ou houve erro | Parcial; vazio conferido. Repetir falha e espera na tela. |

Os casos acima resumem o aceite funcional com base na combinação de testes unitários, verificadores HTTP já registrados e navegação atual. Não significam 24 novos testes manuais completos de criação, edição e exclusão nesta revisão documental. Os casos Jest exatos e seus resultados estão no JSON anexado; repita os fluxos de CRUD na versão de entrega durante o ensaio do grupo.

## Segurança e casos negativos

| Caso | Entrada ou cenário | Resultado esperado | Evidência |
| --- | --- | --- | --- |
| CT25 | Rota privada sem token | 401; não altera dados. | Guards Jest e HTTP. |
| CT26 | Atendente em Relatórios ou DELETE | 403; mantém a sessão. | PerfisGuard, Router e HTTP. |
| CT27 | Paciente tentando consulta de outro | Não revela nem altera a consulta. | Portal HTTP anterior. |
| CT28 | Senha errada ou perfil errado no login | 401; sem sessão nova. | Auth Jest e conta HTTP. |
| CT29 | E-mail, registro, nome ou ANS duplicado | 409; não cria duplicidade. | Services Jest e integração HTTP. |
| CT30 | Nascimento futuro, duração ou cobertura fora da faixa | 400; mensagem de validação. | DTOs e regras Jest/HTTP. |
| CT31 | Horário repetido ou duas requisições concorrentes | Um cadastro; conflito 409 no outro. | Índice e portal HTTP anterior. |
| CT32 | Transição de status inválida | 400; conserva o estado. | Consultas Jest e HTTP. |
| CT33 | API inacessível durante cadastro | Campos preservados; nova tentativa possível. | Teste do componente Acesso. |
| CT34 | Senha recuperada, token expirado ou reutilizado | Token só funciona uma vez; sessões antigas recusadas. | Portal HTTP com transporte de e-mail substituído. |
| CT35 | Rotas públicas e DELETE no OpenAPI | Sem exigência de JWT no público; 204 sem corpo. | 3 testes de documentação Jest. |
| CT36 | Seis módulos em quatro larguras | Sem transbordamento horizontal da página. | 24 medições em responsividade.json. |

## Registro de bugs e limitações

| Registro | Descrição | Situação e próxima ação |
| --- | --- | --- |
| B01 | CORS bloqueava porta local escolhida pelo Angular. | Corrigido em a9f5cdf; origens locais validadas por testes. |
| B02 | Cadastro falhava porque somente o frontend estava ligado. | API iniciada; mensagem e instruções corrigidas em 673145e. |
| B03 | Documentação final e Swagger incompletos. | Documentos consolidados; operações descritas com exemplos e respostas. |
| P01 | Filtro global próprio e logs por requisição ausentes. | Pendente de implementação. |
| P02 | Filtro de período nos Relatórios ausente. | Pendente de implementação. |
| P03 | Cobertura baixa em Portal, Contatos e Recuperação. | Priorizar testes unitários; verificadores HTTP não entram nesta cobertura. |
| P04 | SMTP e auditoria integral de acessibilidade. | Dependem de configuração e execução específica; não marcar como aprovados. |

## Cobertura unitária medida

| Métrica global | Valor coberto | Total | Percentual |
| --- | --- | --- | --- |
| Linhas | 540 | 2193 | 24.62% |
| Instruções | 598 | 2368 | 25.25% |
| Funções | 81 | 275 | 29.45% |
| Ramificações | 381 | 1052 | 36.21% |

Escopo padrão: collectCoverageFrom de src/**/*.ts, incluindo controllers, seeds, verificadores e configuração. Os verificadores HTTP executados separadamente não instrumentam esta medição Jest. Portanto, um service com 0% aqui pode ter evidência de integração, mas ainda carece de cobertura unitária.

## Cobertura por service

| Service | Linhas cobertas | Observação |
| --- | --- | --- |
| auth/auth.service.ts | 100% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| consultas/consultas.service.ts | 63.88% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| contatos/contatos.service.ts | 0% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| convenios/convenios.service.ts | 100% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| especialidades/especialidades.service.ts | 57.14% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| pacientes/pacientes.service.ts | 56.75% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| portal/portal.service.ts | 0% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| profissionais/profissionais-especialidades.service.ts | 33.33% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| profissionais/profissionais.service.ts | 95.89% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| recuperacao/email.service.ts | 0% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| recuperacao/recuperacao.service.ts | 0% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| relatorios/relatorios.service.ts | 100% | Cobertura do Jest atual; não inclui execução HTTP externa. |
| usuarios/usuarios.service.ts | 25.37% | Cobertura do Jest atual; não inclui execução HTTP externa. |

## Reproduzir a execução

Backend: npm test -- --runInBand; npm run test:cov -- --runInBand; npx eslint "src/**/*.ts"; npm run build. Frontend: npm test e npm run build. Os verificadores HTTP são npm run verificar:integracao, npm run verificar:conta e npm run verificar:portal, na pasta backend, com MongoDB disponível.

Os verificadores usam bancos temporários com nomes aleatórios e removem somente o banco de cada execução. O transporte de e-mail do verificador do portal é substituído para capturar o link; esse teste não comprova entrega SMTP real. Não foram executados ensaios de carga, invasão ou certificação de acessibilidade.
