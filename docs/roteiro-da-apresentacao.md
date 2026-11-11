# Roteiro da Apresentação da Clinora

| Sistema | Grupo | Tema | Versão e data |
| --- | --- | --- | --- |
| Clinora | 5 | Clínica | Entrega final 11/11/2026 |

Roteiro de 17 minutos: 11 de apresentação e 6 de perguntas. Cada integrante demonstra seu módulo e explica uma decisão. Deixe o site, o serviço da API, o Swagger e o Compass prontos antes de iniciar. A versão integrada está na develop pelo PR 11.

## Roteiro e tempo

| Tempo | Parte | Responsável | O que mostrar |
| --- | --- | --- | --- |
| 1 min | Problema e persona | William | Agenda em papel, conflitos de horários e cenário da recepção. |
| 1 min | Valor e escopo | William | Cinco cadastros, agenda, portal e relatórios; explicitar o que ficou fora. |
| 7 min | Demonstração | Os seis integrantes | Aproximadamente um minuto por módulo e um minuto para login/perfis. |
| 2 min | Decisões e limites | Neirkis com apoio do grupo | Referências, bcrypt, regra da agenda, limitações e prioridades. |
| 6 min | Perguntas | Conforme chamada da banca | Mostrar o código e a evidência correspondente à pergunta. |

## Roteiro da demonstração

| Nº | Quem | Módulo | Ação e explicação |
| --- | --- | --- | --- |
| 1 | William | Pacientes | Buscar, cadastrar um registro fictício, mostrar a validação de nascimento e a inativação administrativa. |
| 2 | Bryan | Profissionais | Mostrar a especialidade, explicar a referência ObjectId e localizar o PR 11 já integrado. |
| 3 | Valentina | Consultas | Criar ou consultar um horário de demonstração; confirmar a marcada e explicar estados finais e conflito. |
| 4 | Kamila | Especialidades | Mostrar duração e valor; executar o teste de nome duplicado e apresentar a cobertura real. |
| 5 | Henrique | Convênios | Mostrar ANS com zero inicial, cobertura e adaptação ao celular; explicar rótulos e feedback. |
| 6 | Neirkis | Relatórios | Mostrar totais e agrupamentos; explicar que não há cadastro de relatório nem filtro de período nesta versão. |

Use registros fictícios próprios do ensaio. Não inative o paciente ou profissional que será usado na demonstração da agenda. Aponte a diferença entre conta de acesso e ficha clínica. Não mostre senhas, hashes completos ou tokens no telão.

## Decisões técnicas para defender

| Decisão | Motivo | Alternativa considerada |
| --- | --- | --- |
| Angular com serviços e providers HTTP | Mantém tela e regra de negócio separadas e permite testar dependências. | Mock usado nas primeiras aulas; hoje restrito aos testes históricos. |
| Referências ObjectId | Especialidades, convênios e pessoas têm ciclo de vida próprio e são compartilhados. | Embutir cópias exige sincronização e pode duplicar dados. |
| Bcrypt e JWT | Conferir senha sem armazenar seu texto; autenticar e autorizar no servidor. | Senha reversível ou permissão decidida somente pelo navegador. |
| Exclusão lógica e estados | Preserva histórico e impede regressões em consultas encerradas. | Apagar atendimentos perderia registros usados nos indicadores. |
| Índice único parcial | Protege a agenda também sob concorrência e libera consulta cancelada. | Só consultar antes de inserir não fecha a corrida entre requisições. |

## Uma pergunta para cada integrante

| Integrante | Pergunta | Onde demonstrar |
| --- | --- | --- |
| William | Se continuassem o projeto, o que fariam primeiro? | Limitações, priorizando período de Relatórios e robustez de erros. |
| Bryan | Por que referência em vez de embutido? | Schema de Profissionais, service de especialidades e ADR 001. |
| Valentina | Como a senha é guardada? | bcrypt.hash e bcrypt.compare; mostrar só o nome senhaHash. |
| Kamila | Onde está a regra demonstrada? | EspecialidadesService e especialidades.regras.spec.ts. |
| Henrique | O que o usuário vê quando dá erro? E o log? | Mensagem acessível da tela e resposta HTTP; admitir que logs globais por requisição ainda faltam. |
| Neirkis | E sem token? E com perfil errado? | Relatórios no Swagger: 401 sem token e 403 com atendente; admin recebe 200. |

## Limitações e próximos passos

Relatórios: Não há filtro por período. Próxima ação: Adicionar datas inicial e final, validar a ordem e aplicar o intervalo nas agregações.

Tratamento de erros: Ainda usa o filtro padrão do NestJS; não há filtro global próprio com log de cada requisição. Próxima ação: Implementar o filtro da aula 14 e testar o contrato de erro sem expor credenciais.

Recuperação de senha: Código preparado; envio externo depende de SMTP. Próxima ação: Configurar o provedor no .env e verificar entrega real e link de uso único.

Testes: Cobertura unitária global de linhas em 24.62%. Há fluxos exercitados por verificadores HTTP fora desse relatório. Próxima ação: Priorizar testes unitários de Portal, Contatos e Recuperação, além dos casos restantes de Pacientes e Especialidades.

Acessibilidade: Larguras e navegação conferidas; auditoria completa com leitor de tela e contraste ainda não concluída. Próxima ação: Executar e registrar teclado, leitor de tela, contraste e zoom.

Entrega: A versão integrada está na develop pelo PR 11. Próxima ação: Realizar ensaio com os seis integrantes e, quando aprovado para entrega, publicar main e tag v1.0.

## Checklist do dia

Verificar: Conferir MongoDB, backend e frontend ligados; abrir /api/docs.

Verificar: Entrar com contas de teste de admin, atendente e paciente, sem exibir suas senhas.

Verificar: Preparar registros fictícios coerentes e anotar IDs para as consultas do Swagger.

Verificar: Manter os prints do Manual do Usuário como reserva.

Verificar: Ensaiar 11 minutos de fala e 6 de perguntas com cronômetro.

Verificar: Trocar explicações em duplas: William com Neirkis, Bryan com Kamila e Valentina com Henrique.

Verificar: Revisar as respostas individuais e demonstrar entendimento do código.

Verificar: Confirmar a versão de entrega antes de publicar main e a tag v1.0.

Roteiros detalhados de fala e perguntas também estão em docs/apresentacao. Este documento é o roteiro principal da versão atual e substitui menções antigas a PR 11 aberto ou a uma apresentação de 15 a 20 minutos.
