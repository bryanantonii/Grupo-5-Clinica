# Documento de Visão da Clinora

| Sistema | Grupo | Tema | Versão e data |
| --- | --- | --- | --- |
| Clinora | 5 | Clínica | Entrega final 11/11/2026 |

A Clinora organiza cadastros e agendamentos de uma clínica geral. Este documento define o problema, os perfis, os 24 requisitos dos módulos A a F, as regras e os limites da versão integrada à API e ao MongoDB.

## 1 Problema

Uma agenda mantida em papel e por telefone dificulta localizar pacientes, controlar horários e registrar faltas. A equipe precisa de uma visão única dos atendimentos, enquanto o paciente precisa solicitar e acompanhar sua consulta pelo celular. O projeto acadêmico reúne essas tarefas em uma aplicação web.

## 2 Persona

| Item | Descrição |
| --- | --- |
| Persona ilustrativa | Ana, 32 anos, atendente de uma clínica. |
| Contexto | Usa o computador na recepção para consultar cadastros e ajustar a agenda. |
| Objetivos | Encontrar pacientes, evitar horários duplicados e acompanhar o comparecimento. |
| Dificuldades | Informações espalhadas, repetição de cadastro e mudanças de status sem registro. |
| Cenário | Ao receber um pedido, localiza o paciente, escolhe o profissional, agenda um horário livre e depois confirma o atendimento. |

Persona complementar ilustrativa: Carlos, 40 anos, paciente que consulta profissionais, cria sua conta, agenda pelo celular e acompanha o histórico. As personas representam cenários de uso, não pessoas entrevistadas.

## 3 Proposta de valor

Centralizar o agendamento e a gestão da clínica em um site que mantém pacientes e equipe consultando os mesmos registros persistidos.

## 4 Escopo do MVP

| Dentro do escopo | Fora desta versão |
| --- | --- |
| Cinco cadastros com busca, validação, edição e exclusão lógica. | Prontuário médico, prescrições e diagnóstico. |
| Agenda com estados, conflito de horário e portal do paciente. | Teleconsulta, pagamentos e autorização real de convênios. |
| Relatórios gerais e perfis admin, atendente e paciente. | Filtro de período e análise financeira. |
| Contato interno, usuários e recuperação preparada para SMTP. | Entrega SMTP sem provedor configurado e confirmação obrigatória do e-mail. |

## 5 Módulos e responsáveis

| Integrante | Módulo | Papel transversal |
| --- | --- | --- |
| William Davi Georg | A Pacientes | PO e Scrum Master |
| Bryan Eduardo de Antoni da Silva | B Profissionais | Git e Integração |
| Valentina de Los Angeles Pena Aguirre | C Consultas | Segurança |
| Kamila Valentina Mujica Yepez | D Especialidades | Testes e Qualidade |
| Henrique Guilherme Rosa | E Convênios | UX UI e Acessibilidade |
| Neirkis Patricia Subero Subero | F Relatórios | Documentação e Apresentação |

A divisão identifica a responsabilidade informada pelo grupo. A autoria técnica de cada mudança é a registrada nos commits e nos Pull Requests; o papel não atribui automaticamente todos os commits de um módulo ao integrante.

## 6 Requisitos funcionais

| Código | Módulo | O sistema deve permitir | Prior. |
| --- | --- | --- | --- |
| RF01 | Pacientes | cadastrar um registro válido | Alta |
| RF02 | Pacientes | listar registros ativos com busca | Alta |
| RF03 | Pacientes | editar um registro existente | Alta |
| RF04 | Pacientes | inativar um registro sem apagar o histórico | Alta |
| RF05 | Profissionais | cadastrar um registro válido | Alta |
| RF06 | Profissionais | listar registros ativos com busca | Alta |
| RF07 | Profissionais | editar um registro existente | Alta |
| RF08 | Profissionais | inativar um registro sem apagar o histórico | Alta |
| RF09 | Consultas | cadastrar uma consulta futura com paciente e profissional ativos | Alta |
| RF10 | Consultas | listar consultas e filtrar por status | Alta |
| RF11 | Consultas | editar os dados de uma consulta permitida | Alta |
| RF12 | Consultas | mudar o status respeitando as transições | Alta |
| RF13 | Especialidades | cadastrar um registro válido | Alta |
| RF14 | Especialidades | listar registros ativos com busca | Alta |
| RF15 | Especialidades | editar um registro existente | Alta |
| RF16 | Especialidades | inativar um registro sem apagar o histórico | Alta |
| RF17 | Convênios | cadastrar um registro válido | Alta |
| RF18 | Convênios | listar registros ativos com busca | Alta |
| RF19 | Convênios | editar um registro existente | Alta |
| RF20 | Convênios | inativar um registro sem apagar o histórico | Alta |
| RF21 | Relatórios | exibir pacientes ativos, consultas marcadas ou confirmadas e faltas | Alta |
| RF22 | Relatórios | exibir a quantidade por status | Alta |
| RF23 | Relatórios | exibir somente consultas realizadas por especialidade | Alta |
| RF24 | Relatórios | informar quando não há dados, está carregando ou houve erro | Alta |

RF25 adicional: criar e autenticar a própria conta de paciente, manter seus dados e consultar apenas seus agendamentos. RF26 adicional: registrar contatos e permitir sua leitura pela equipe. RF27 adicional: o administrador pode criar atendentes e vincular uma ficha clínica após conferir a identidade.

## 7 Requisitos não funcionais

| Código | Critério e situação |
| --- | --- |
| RNF01 | Senhas somente com bcrypt, custo 10 ou maior, sem hash na resposta. Implementado e verificado. |
| RNF02 | Rotas privadas recusam token ausente com 401 e perfil insuficiente com 403. Implementado e testado. |
| RNF03 | Frontend compila e os seis módulos não transbordam a página em 360, 390, 768 e 1440 px. Verificação de largura executada. |
| RNF04 | Todos os 179 testes Jest e 95 testes do frontend passam. Resultado registrado em 11/11/2026. |
| RNF05 | Meta de resposta inferior a 2 segundos com 500 registros. Ainda não medida em ensaio de carga. |
| RNF06 | Campos com rótulo e mensagens acessíveis. Existem no código; validação integral assistiva permanece planejada. |

## 8 Regras de negócio

| Código | Módulo | Regra | Resposta |
| --- | --- | --- | --- |
| RN01 | Pacientes | E-mail único, normalizado para minúsculas. | 409; não duplica o cadastro. |
| RN02 | Pacientes | Nascimento existente e não futuro. | 400; conserva os dados para correção. |
| RN03 | Profissionais | Registro único, salvo em maiúsculas; e-mail também único. | 409; não grava a duplicidade. |
| RN04 | Profissionais | Especialidade informada deve existir. | 400 para ID inválido; 404 para referência ausente. |
| RN05 | Consultas | Um profissional não pode ter duas consultas no mesmo instante, exceto canceladas. | 409; índice único parcial protege a concorrência. |
| RN06 | Consultas | Início futuro em dia útil, das 08h até antes das 18h no fuso de Brasília. | 400; recusa horário fora das condições. |
| RN07 | Consultas | Mudanças seguem o fluxo de estados. Estados finais não têm saída. | 400; conserva o estado anterior. |
| RN08 | Especialidades | Nome único com collation pt e strength 1. | 409; recusa nome equivalente. |
| RN09 | Especialidades | Excluir apenas inativa; duração inteira de 15 a 120 minutos e preço não negativo. | 204 na inativação; 400 em entrada inválida. |
| RN10 | Convênios | ANS com seis dígitos, preservando zeros; ANS e nome únicos. | 400 no formato; 409 na duplicidade. |
| RN11 | Convênios | Excluir inativa; cobertura inteira entre 0 e 100. | 204 na inativação; 400 na cobertura inválida. |
| RN12 | Relatórios | Somente admin consulta; por especialidade conta apenas realizadas. | 403 para atendente ou paciente. |
| RN13 | Portal | JWT identifica o paciente; IDs de outras contas não autorizam acesso. | 403 ou 404; não revela consultas de terceiros. |
| RN14 | Acesso | Hash bcrypt com custo 10; senha de 8 caracteres a 72 bytes UTF-8. | 400 em formato inválido; 401 em login recusado. |

## 9 Fluxo de estados

| Estado atual | Pode ir para | Quem pode mudar |
| --- | --- | --- |
| marcada | confirmada ou cancelada | Equipe; paciente cancela somente consulta própria elegível. |
| confirmada | realizada, falta ou cancelada | Equipe; paciente cancela somente consulta própria elegível. |
| realizada | Nenhum estado | Estado final. |
| falta | Nenhum estado | Estado final. |
| cancelada | Nenhum estado | Estado final. |

## 10 Perfis de acesso

| Perfil | Acesso permitido | Restrições |
| --- | --- | --- |
| Público | Catálogo, criação da própria conta, login, contato e solicitação de recuperação. | Sem acesso a fichas ou consultas privadas. |
| paciente | Própria conta, horários livres, agendamentos próprios e cancelamento elegível. | Não acessa a gestão ou os dados de outras contas. |
| atendente | Gestão dos cinco módulos, status das consultas e mensagens. | Sem exclusões administrativas, Relatórios ou gestão de usuários. |
| admin | Gestão, exclusões lógicas, Relatórios e criação de atendentes. | Também respeita DTOs e regras de negócio. |

## 11 Dependências e restrições

Angular 21 no frontend, NestJS 11 na API e MongoDB com Mongoose. A execução local requer Node.js compatível, dependências instaladas, MongoDB ativo e o .env do backend configurado. Git distribui código; não distribui registros do banco ou segredos locais.

O layout deriva do Penpot fornecido pelo grupo. O mapa de telas e os wireframes de referência estão em docs/uiux. O endereço e os horários institucionais definitivos ainda precisam ser confirmados pela clínica fictícia do tema.

Relatórios: Não há filtro por período. Próximo passo: Adicionar datas inicial e final, validar a ordem e aplicar o intervalo nas agregações.

Tratamento de erros: Ainda usa o filtro padrão do NestJS; não há filtro global próprio com log de cada requisição. Próximo passo: Implementar o filtro da aula 14 e testar o contrato de erro sem expor credenciais.

Recuperação de senha: Código preparado; envio externo depende de SMTP. Próximo passo: Configurar o provedor no .env e verificar entrega real e link de uso único.

Testes: Cobertura unitária global de linhas em 24.62%. Há fluxos exercitados por verificadores HTTP fora desse relatório. Próximo passo: Priorizar testes unitários de Portal, Contatos e Recuperação, além dos casos restantes de Pacientes e Especialidades.

Acessibilidade: Larguras e navegação conferidas; auditoria completa com leitor de tela e contraste ainda não concluída. Próximo passo: Executar e registrar teclado, leitor de tela, contraste e zoom.

Entrega: A versão integrada está na develop pelo PR 11. Próximo passo: Realizar ensaio com os seis integrantes e, quando aprovado para entrega, publicar main e tag v1.0.
