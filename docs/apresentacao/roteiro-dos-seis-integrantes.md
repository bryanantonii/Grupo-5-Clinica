# Roteiro de apresentação da Clinora

Grupo 5  SENAI  Programador Full Stack  9 de novembro de 2026

Este roteiro organiza a apresentação dos seis integrantes: o que cada módulo faz, como a função transversal contribui para o projeto e como demonstrar a entrega no site, no código e nos Pull Requests. A sequência sugerida dura de 15 a 20 minutos, seguida das perguntas da banca.

A versão atual reúne Angular no frontend, NestJS na API e MongoDB para persistência. A gestão e o portal utilizam a API real. Os PRs 10 e 11 ainda estão abertos; a demonstração mais completa está na branch clinica/integracao-completa, commit 9e339f8.

### Divisão da apresentação

| Nº | Papel | Módulo |
| --- | --- | --- |
| 1 | PO e Scrum Master | A  Pacientes |
| 2 | Git e Integração | B  Profissionais |
| 3 | Segurança | C  Consultas |
| 4 | Testes e Qualidade | D  Especialidades |
| 5 | UX UI e Acessibilidade | E  Convênios |
| 6 | Documentação e Apresentação | F  Relatórios |

### Explicação comum ao grupo

O Angular recebe as ações do usuário, valida o formulário e envia uma requisição HTTP. O controller da API recebe a rota e o DTO valida a entrada. O service aplica as regras e o model Mongoose acessa o MongoDB. A resposta retorna para a tela com sucesso, erro ou lista vazia.

As referências usam ObjectId: Pacientes pode ter Convênio; Profissionais tem Especialidade; Consultas liga Paciente e Profissional. Relatórios lê esses registros para montar os indicadores.

Na fala, relacione sua responsabilidade ao código e à demonstração. Quando a implementação aparece em um PR de integração, apresente-a como entrega do grupo e use o histórico para indicar a autoria registrada. A abertura de um PR e a autoria de cada commit são informações diferentes.

## Integrante 1 Pacientes

Papel PO e Scrum Master  |  Módulo A  |  Tempo 2 minutos

### O que foi implementado

O módulo cadastra, lista, pesquisa, edita e inativa as fichas dos pacientes. Guarda nome, e-mail, telefone, nascimento e convênio opcional. O service impede e-mail repetido e nascimento futuro; a exclusão muda ativo para false e preserva o histórico.

### Como explicar o papel

O papel de PO e Scrum Master organiza prioridades, acompanha o andamento, combina critérios de aceite e ajuda a resolver impedimentos. Na apresentação, abra com o problema da agenda em papel e explique como os seis módulos se conectam. Mostre o backlog como evidência de organização; confirme com o grupo as reuniões e decisões que realmente ocorreram.

### Passo a passo da demonstração

1. Entre na Área da equipe e abra Gestão > Pacientes.
2. Cadastre Paciente Apresentação, com e-mail paciente.apresentacao@example.com, telefone válido e nascimento passado. Escolha um convênio ativo ou particular.
3. Salve, pesquise pelo nome e recarregue a página para demonstrar persistência.
4. Edite o telefone. Tente usar o mesmo e-mail em outro cadastro e explique a resposta de conflito 409.
5. Mostre a validação de nascimento futuro. Inative outra ficha fictícia reservada para esse teste e localize-a com Mostrar inativos. Mantenha Paciente Apresentação ativo para a etapa de Consultas.

### Fala sugerida para ensaiar

No módulo de Pacientes, o grupo implementou o cadastro das pessoas atendidas pela clínica. O formulário orienta o preenchimento e a API confere as regras antes de salvar no MongoDB. O e-mail é único e o nascimento não pode ser futuro. Quando excluímos uma ficha, ela fica inativa e o histórico é mantido. Como PO e Scrum Master, minha parte na apresentação também é explicar as prioridades e como acompanhamos as entregas do grupo.

### Arquivos para abrir no VS Code

- [frontend/src/app/features/pacientes/pacientes.config.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/pacientes/pacientes.config.ts)
- [backend/src/pacientes/pacientes.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/pacientes/pacientes.service.ts)
- [backend/src/pacientes/schemas/paciente.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/pacientes/schemas/paciente.schema.ts)
- [docs/c1/backlog-c1.md](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/c1/backlog-c1.md)

PRs relacionados: [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3), [#10](https://github.com/bryanantonii/Grupo-5-Clinica/pull/10), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

Conta e ficha são a mesma coisa? A conta de acesso fica em usuarios, com senha em hash. A ficha clínica fica em pacientes; no portal, é criada com os dados clínicos do primeiro agendamento.

## Integrante 2 Profissionais

Papel Git e Integração  |  Módulo B  |  Tempo 2 a 3 minutos

### O que foi implementado

O módulo gerencia nome, registro profissional, especialidade, e-mail, telefone e situação. Usa listagem com busca e filtro, cadastro, edição e inativação. O registro é normalizado em maiúsculas; registro e e-mail não podem se repetir. A especialidade selecionada precisa existir.

### Como explicar o papel

Git e Integração reúne as entregas por branches e Pull Requests, verifica conflitos e acompanha os checks. Explique a evolução do formulário com mock para a API real. A branch atual clinica/integracao-completa contém a base do PR 10 e os complementos do PR 11; os dois ainda estão abertos nesta revisão.

### Passo a passo da demonstração

1. Abra Gestão > Profissionais e mostre a busca e a especialidade exibida pelo nome.
2. Cadastre um profissional fictício com uma especialidade existente, registro e e-mail novos.
3. Salve, recarregue e edite o telefone. Tente repetir o registro em outro cadastro para mostrar o conflito.
4. Mostre o mesmo profissional no catálogo público /profissionais, que não expõe seu contato privado.
5. Abra o PR 6: explique Files changed, Commits e Checks. Depois mostre o PR 11 e sua dependência do PR 10.
6. Explique o fluxo branch de trabalho > commit > push > Pull Request > revisão > merge na develop.

### Fala sugerida para ensaiar

O módulo de Profissionais mantém os dados da equipe e relaciona cada profissional a uma especialidade. O Angular envia as operações para a API, e o MongoDB conserva os registros. Além desse módulo, minha função de integração é mostrar como as entregas entram no projeto: trabalhamos em branches, registramos commits e abrimos Pull Requests para revisão. O PR 6 entrega a API de Profissionais; os PRs 10 e 11 reúnem a integração mais recente dos módulos.

### Arquivos para abrir no VS Code

- [frontend/src/app/features/profissionais/profissionais.config.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/profissionais/profissionais.config.ts)
- [backend/src/profissionais/profissionais.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/profissionais/profissionais.service.ts)
- [frontend/src/app/features/profissionais/profissional-card/profissional-card.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/profissionais/profissional-card/profissional-card.ts)
- [frontend/src/app/app.config.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/app.config.ts)

PRs relacionados: [#2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2), [#6](https://github.com/bryanantonii/Grupo-5-Clinica/pull/6), [#8](https://github.com/bryanantonii/Grupo-5-Clinica/pull/8), [#10](https://github.com/bryanantonii/Grupo-5-Clinica/pull/10), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

Qual é a função do cartão? Ele recebe dados com input() e avisa a página pai com output(). A página coordena a ação. Os componentes da gestão também reaproveitam uma lista e um formulário configuráveis.

## Integrante 3 Consultas

Papel Segurança  |  Módulo C  |  Tempo 3 minutos

### O que foi implementado

O módulo relaciona paciente e profissional, data e hora e motivo opcional. A consulta começa marcada. A API valida dia útil, horário futuro entre 8h e antes de 18h no fuso de Brasília e conflito do mesmo profissional no mesmo instante. Um índice único também protege reservas concorrentes.

### Como explicar o papel

Segurança autentica a equipe e o paciente e limita as operações por perfil. A senha é armazenada como hash bcrypt; o login gera JWT com validade de uma hora. O guard verifica identidade, situação da conta e versão da sessão. PerfisGuard aplica autorização. O portal filtra os registros pelo usuário autenticado.

### Passo a passo da demonstração

1. Abra Gestão > Consultas e selecione paciente, profissional e horário futuro em um dia útil.
2. Salve e mostre o estado Marcada. Mude para Confirmada e depois para Realizada ou Falta.
3. Explique o mapa: marcada permite confirmada ou cancelada; confirmada permite realizada, falta ou cancelada. Os três estados finais não têm saída.
4. Em outra consulta fictícia, demonstre cancelamento e preservação do histórico. Tentar reutilizar um horário ocupado deve gerar 409.
5. Mostre no código o mapa TRANSICOES e o método mudarStatus. Explique que alterar o botão no navegador não contorna a regra da API.
6. Demonstre a diferença entre os acessos: equipe em /login, paciente em /entrar. Relatórios e exclusões administrativas exigem admin.

### Fala sugerida para ensaiar

A segurança tem duas partes: identificar quem acessa e permitir somente as ações do seu perfil. A senha fica como hash bcrypt, e o JWT identifica a sessão. Em Consultas, também protegemos o fluxo do atendimento: a API só aceita as mudanças previstas no mapa de estados. Isso impede reabrir uma consulta encerrada ou saltar etapas. O paciente consulta e cancela apenas seus próprios agendamentos; a equipe utiliza as rotas da gestão.

### Arquivos para abrir no VS Code

- [backend/src/consultas/schemas/consulta.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/consultas/schemas/consulta.schema.ts)
- [backend/src/consultas/consultas.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/consultas/consultas.service.ts)
- [backend/src/auth/guards/jwt-auth.guard.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/auth/guards/jwt-auth.guard.ts)
- [backend/src/auth/guards/perfis.guard.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/auth/guards/perfis.guard.ts)

PRs relacionados: [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3), [#9](https://github.com/bryanantonii/Grupo-5-Clinica/pull/9), [#10](https://github.com/bryanantonii/Grupo-5-Clinica/pull/10), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

401 e 403 significam a mesma coisa? 401 indica falta de autenticação válida; 403 indica que a identidade foi reconhecida, mas o perfil não permite aquela operação.

## Integrante 4 Especialidades

Papel Testes e Qualidade  |  Módulo D  |  Tempo 2 a 3 minutos

### O que foi implementado

O módulo registra nome, descrição, duração da consulta e valor particular. A duração é inteira de 15 a 120 minutos; o valor não pode ser negativo. Nome repetido é recusado sem diferenciar caixa e acentos. A exclusão é lógica, e as especialidades alimentam o cadastro de Profissionais.

### Como explicar o papel

Testes e Qualidade prepara casos válidos e inválidos, registra evidências e verifica regressões. O backend possui testes unitários em Jest. Os testes do frontend usam o executor de testes do Node, com recursos do Angular. Os verificadores HTTP usam NestJS e MongoDB reais em bancos temporários isolados.

### Passo a passo da demonstração

1. Abra Gestão > Especialidades e cadastre Especialidade Apresentação com duração 30 e valor 150.
2. Tente duração 10, duração fracionada e valor negativo. Mostre as mensagens e o bloqueio do formulário.
3. Tente repetir o nome. Edite a descrição e mostre a inativação com Mostrar inativos.
4. Abra especialidades.regras.spec.ts e explique preparação, execução e comparação do resultado esperado.
5. No backend, execute npm test -- --runInBand. No frontend, execute npm test. Explique que lint, testes e build verificam coisas diferentes.
6. Abra os checks de um PR e uma evidência de verificar:integracao ou verificar:portal. Mostre que o banco usado pelo verificador é temporário.

### Fala sugerida para ensaiar

Em Especialidades, o grupo definiu validações para os serviços oferecidos pela clínica. Minha parte de qualidade é explicar como verificamos essas regras: usamos casos válidos e também valores que devem ser rejeitados. Jest testa o backend de forma automatizada. Os verificadores de integração enviam requisições HTTP e conferem a gravação no MongoDB. A integração registra 176 testes de backend e 93 de frontend aprovados, além dos verificadores da API. Esses números não representam uma cobertura de 100 por cento.

### Arquivos para abrir no VS Code

- [frontend/src/app/features/especialidades/especialidades.config.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/especialidades/especialidades.config.ts)
- [backend/src/especialidades/dto/especialidade.dto.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/especialidades/dto/especialidade.dto.ts)
- [backend/src/especialidades/especialidades.regras.spec.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/especialidades/especialidades.regras.spec.ts)
- [backend/src/portal/verificar-portal.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/portal/verificar-portal.ts)

PRs relacionados: [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3), [#6](https://github.com/bryanantonii/Grupo-5-Clinica/pull/6), [#7](https://github.com/bryanantonii/Grupo-5-Clinica/pull/7), [#9](https://github.com/bryanantonii/Grupo-5-Clinica/pull/9), [#10](https://github.com/bryanantonii/Grupo-5-Clinica/pull/10), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

Por que ainda existem mocks no repositório? São apoio para testes e etapas antigas. Os providers atuais da aplicação usam serviços HTTP; um substituto em um teste unitário não significa que o site usa mock em produção.

## Integrante 5 Convênios

Papel UX UI e Acessibilidade  |  Módulo E  |  Tempo 2 a 3 minutos

### O que foi implementado

O módulo gerencia nome, código ANS textual com seis dígitos, cobertura de 0 a 100 e telefone opcional. O schema também contempla modalidade. ANS e nome têm proteção contra duplicidade. O seed insere exemplos ausentes e preserva os registros. A inativação conserva o documento e oculta o convênio da lista padrão.

### Como explicar o papel

A identidade vem do Penpot: logo, cores, tipografia, botões e cartões. Os estilos do grupo concentram o padrão visual. Há layout responsivo, menu para celular, faixas horizontais, foco visível, labels ligados aos campos, mensagens de erro e suporte a movimento reduzido. A revisão completa com leitor de tela e medição de contraste continua uma atividade a demonstrar com evidências.

### Passo a passo da demonstração

1. Abra Gestão > Convênios e mostre um ANS com zero à esquerda, como 045678.
2. Em um cadastro fictício, teste cobertura fora de 0 a 100 e ANS com quantidade incorreta de dígitos.
3. Explique o conflito de ANS repetido, a edição e a inativação. Mostre que o plano inativo deixa o catálogo público.
4. Reduza a largura da janela ou abra a visualização de celular. Mostre menu, campos e navegação horizontal dos destaques.
5. Use Tab e Shift+Tab para percorrer controles e mostrar o foco. Toque um campo inválido para explicar o rótulo e a mensagem.
6. Abra estilos-do-grupo.css e registro-form.html. Mostre :focus-visible, label/for, aria-invalid e o controle desabilitado durante envio.

### Fala sugerida para ensaiar

No módulo de Convênios, o código ANS é texto para preservar zeros à esquerda. A API valida a cobertura e impede duplicidade. Na parte de UX e acessibilidade, o grupo aplicou a identidade do Penpot e organizou telas que funcionam em diferentes larguras. Os campos têm rótulos e mensagens de erro, e o foco ajuda a navegação por teclado. Vou demonstrar esses recursos existentes, sem apresentar como concluída uma auditoria completa de acessibilidade.

### Arquivos para abrir no VS Code

- [backend/src/convenios/schemas/convenio.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/convenios/schemas/convenio.schema.ts)
- [backend/src/convenios/convenios.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/convenios/convenios.service.ts)
- [frontend/src/estilos-do-grupo.css](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/estilos-do-grupo.css)
- [frontend/src/app/features/gestao/shared/registro-form.html](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/gestao/shared/registro-form.html)

PRs relacionados: [#2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2), [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3), [#5](https://github.com/bryanantonii/Grupo-5-Clinica/pull/5), [#7](https://github.com/bryanantonii/Grupo-5-Clinica/pull/7), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

O que os PRs 5 e 7 entregam? O 5 cria schema, índices e seed de Convênios. O 7 acrescenta regras do service e testes. A integração HTTP completa chega na etapa posterior.

## Integrante 6 Relatórios

Papel Documentação e Apresentação  |  Módulo F  |  Tempo 2 a 3 minutos

### O que foi implementado

O painel consulta indicadores reais, em leitura: pacientes ativos, consultas marcadas ou confirmadas e faltas. Mostra todas as consultas agrupadas por status e atendimentos realizados por especialidade. O backend usa contagens e agregações do MongoDB, incluindo referências a profissionais e especialidades. Apenas admin acessa as rotas de Relatórios.

### Como explicar o papel

Documentação e Apresentação organiza visão, regras, contrato da API, dicionário de dados, testes e evidências. Na banca, conecte a demonstração às rotas e explique quais dados cada coleção guarda. Use a documentação de integração real para o estado atual; documentos de checkpoints registram etapas anteriores.

### Passo a passo da demonstração

1. Entre como administrador e abra Gestão > Relatórios ou a Visão geral.
2. Explique cada cartão. O total de Consultas marcadas soma os estados marcada e confirmada.
3. Mostre a tabela por status e a de realizadas por especialidade. Se não houver dados, explique a mensagem de vazio.
4. Atualize o painel depois de uma consulta fictícia ter sido marcada como realizada pelo módulo C.
5. No Swagger, mostre as três rotas GET de /relatorios. No service, explique countDocuments, $group e $lookup.
6. Abra a documentação de integração e as evidências do Compass. Apresente o fluxo Angular > API > MongoDB e encerre retomando o problema da clínica.

### Fala sugerida para ensaiar

Relatórios transforma os cadastros e as consultas em indicadores para a administração. Os valores são calculados na API a partir do MongoDB. O painel conta pacientes ativos, compromissos marcados ou confirmados e faltas, e também agrupa os atendimentos. Na documentação, o grupo registra os contratos, regras e evidências que permitem conferir o comportamento. O painel atual apresenta totais gerais; o filtro de período ainda precisa ser concluído para atender àquele item da ficha de avaliação.

### Arquivos para abrir no VS Code

- [backend/src/relatorios/relatorios.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/relatorios/relatorios.service.ts)
- [backend/src/relatorios/relatorios.controller.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/relatorios/relatorios.controller.ts)
- [frontend/src/app/features/relatorios/relatorios-painel.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/relatorios/relatorios-painel.ts)
- [docs/integracao-real/README.md](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/integracao-real/README.md)

PRs relacionados: [#1](https://github.com/bryanantonii/Grupo-5-Clinica/pull/1), [#3](https://github.com/bryanantonii/Grupo-5-Clinica/pull/3), [#10](https://github.com/bryanantonii/Grupo-5-Clinica/pull/10), [#11](https://github.com/bryanantonii/Grupo-5-Clinica/pull/11)

O painel inclui faturamento e filtro de período? O código atual não calcula faturamento e não oferece seleção inicial/final de datas. Apresente somente os indicadores existentes e registre o filtro como pendência.

## Como explicar os Pull Requests iniciais

Esta linha do tempo mostra a evolução do projeto. Um PR integrado na develop aparece como mesclado; um PR aberto ainda depende da revisão e da integração do grupo.

### PR 1 Documentação base

Aberto por bryanantonii  |  Situação mesclado na develop

Reúne a base e exemplos de documentos do professor. Serve como referência de estrutura; os commits de base não comprovam autoria individual do integrante de Documentação.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/1

### PR 2 Interface e Profissionais

Aberto por bryanantonii  |  Situação mesclado na develop

Entrega a identidade do Penpot, páginas do site e a gestão inicial de Profissionais com formulários reativos, cartão reutilizável e dados mock. A autenticação ainda era demonstrativa nesta etapa.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/2

### PR 3 Frontend completo do C1

Aberto por henriquerosaaa  |  Situação mesclado na develop

Amplia o frontend do C1 para os cinco cadastros e Relatórios. Inclui rotas, busca, formulários, regras locais e estados de carregamento, erro e vazio. Os dados daquela etapa ficavam na sessão.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/3

### PR 4 Convênios substituído

Aberto por ValentinadelosAngeles  |  Situação encerrado sem merge

Primeira tentativa de entrega de Convênios com Mongoose. Foi encerrado sem merge e substituído pelo PR 5; não conte como uma segunda entrega independente.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/4

### PR 5 Schema e seed de Convênios

Aberto por ValentinadelosAngeles  |  Situação mesclado na develop

Implementa schema, índices e seed de Convênios. Valida ANS, cobertura, modalidade e timestamps; o seed preserva exemplos existentes. Ainda não entrega a integração HTTP completa.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/5

### PR 6 API de Profissionais

Aberto por bryanantonii  |  Situação mesclado na develop

Implementa a API CRUD de Profissionais, DTOs, Swagger, testes, exclusão lógica e integração com Angular. Também reúne entregas anteriores e resolve a integração dos formulários.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/6

## Como explicar os Pull Requests de integração

### PR 7 Regras de Convênios

Aberto por ValentinadelosAngeles  |  Situação mesclado na develop

Acrescenta as regras de negócio do service de Convênios e testes de unicidade e persistência. É a evolução do modelo entregue no PR 5.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/7

### PR 8 Organização do banco e rotas

Aberto por bryanantonii  |  Situação mesclado na develop

Retira Produtos da execução da clínica, preservando o exemplo em referencias. Ajusta rotas, seed da clínica, testes de navegação e documentação.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/8

### PR 9 Autenticação JWT

Aberto por bryanantonii  |  Situação mesclado na develop

Implementa autenticação no backend com hash bcrypt, JWT e guard global. Prepara administrador via .env e catálogo público. A integração completa de login e permissões do Angular vem depois.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/9

### PR 10 Integração da gestão

Aberto por bryanantonii  |  Situação aberto

Conecta os cinco módulos e Relatórios à API, aplica perfis, integra login da equipe e cadastro/conta do paciente. Acrescenta regras da agenda, índices e verificações HTTP/MongoDB.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/10

### PR 11 Portal e integração final

Aberto por bryanantonii  |  Situação aberto

Parte da base do PR 10 e completa portal, horários, agendamento, histórico, cancelamento, contato, contas da equipe e recuperação por SMTP configurável. Corrige CORS local e registra a configuração do Compass.

https://github.com/bryanantonii/Grupo-5-Clinica/pull/11

### Leitura do histórico

A abertura dos PRs registra as contas bryanantonii, henriquerosaaa e ValentinadelosAngeles. Existem commits de outras contas na história por causa da base e dos merges. Atribua a participação de cada integrante aos commits e às revisões correspondentes, além da divisão de módulos combinada pelo grupo.

Os PRs 10 e 11 compartilham a mesma base: o 11 inclui os commits do 10. Não some seus arquivos, testes e funcionalidades como se fossem duas implementações distintas.

## Ensaio da demonstração completa

### Antes de apresentar

Confirme a branch clinica/integracao-completa e os checks do PR 11. Não apresente a develop antiga esperando encontrar as mesmas telas.

Mantenha MongoDB, backend e frontend ativos. API: backend > npm run start:dev. Site: frontend > npm start. O frontend sozinho não inicia a API.

Entre pela Área da equipe em /login. Use as credenciais locais já preparadas, sem mostrá-las no projetor, no documento ou no GitHub.

No Compass, abra Clinora local - API > clinora. Clique em Refresh depois de criar ou alterar dados. O banco e o .env não são transportados pelo Git.

Use nomes e e-mails fictícios identificados como Apresentação. Prepare uma especialidade e um convênio ativos para os selects.

### Sequência entre os integrantes

1. O integrante 1 apresenta o problema, a divisão do grupo e cadastra o paciente fictício.

2. O integrante 2 cadastra o profissional usando uma especialidade existente e mostra o fluxo de Git e PR.

3. O integrante 3 agenda com esse paciente e profissional, demonstra os estados e explica autenticação e autorização.

4. O integrante 4 mostra Especialidades, provoca um caso inválido e explica os testes automatizados e os checks.

5. O integrante 5 apresenta Convênios e demonstra o padrão visual, a versão de celular e o uso do teclado.

6. O integrante 6 atualiza os Relatórios após a mudança de status, mostra a persistência no Compass e conecta as evidências à documentação.

### Perguntas que todos devem saber responder

CRUD significa criar, consultar, atualizar e excluir. Nos cadastros da clínica, excluir é inativar; em Consultas, a operação cancela e mantém o histórico.

DTO valida o formato da entrada. Service aplica regras como duplicidade e transições de estado. Schema define como o documento é armazenado.

JWT identifica a sessão. Bcrypt gera um hash para conferir a senha sem armazená-la em texto. Esconder um botão não substitui a autorização da API.

Os arquivos mock continuam como material de testes. app.config.ts registra os serviços HTTP para a aplicação atual.

## Conferências para a apresentação

### Resultados registrados na integração

| Verificação | Resultado registrado |
| --- | --- |
| Backend | 176 testes Jest em 20 suítes; lint e build aprovados. |
| Frontend | 93 testes e build aprovados. |
| HTTP e MongoDB | 81 casos de gestão, 56 de conta e 68 de portal. |
| GitHub | Backend e frontend aprovados no commit 9e339f8 do PR 11. |

Os testes de API usam bancos temporários. No verificador do portal, somente o transporte de e-mail é substituído para conferir o link sem enviar mensagens externas. Esses resultados são os registrados na integração consultada, não uma medição de cobertura de código.

### O que apresentar como pendência

Filtro de período em Relatórios: o painel atual mostra totais gerais e não possui validação de data inicial e final.

SMTP: a integração de recuperação de senha está preparada; falta configurar o provedor e verificar a entrega externa. Não demonstre um e-mail como enviado se o serviço não estiver configurado.

Acessibilidade: há recursos no código, mas uma auditoria completa com leitor de tela e medições deve ter suas próprias evidências.

Git: os PRs 10 e 11 ainda estavam abertos nesta revisão. Confirme seu estado antes da banca e complete nomes, revisões e respostas individuais do grupo.

### Fontes para conferir os detalhes

- [Manual do tema e divisão dos módulos](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/guia/temas/clinica.md)
- [Regras de Git e Pull Request](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/CONTRIBUTING.md)
- [Configuração atual da aplicação Angular](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/app.config.ts)
- [Integração real e configuração do banco](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/integracao-real/README.md)
- [Guia visual e checklist de acessibilidade](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/uiux/README.md)
- [Testes de integração do portal](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/portal/verificar-portal.ts)
As seções de cada integrante também indicam os arquivos de código e os PRs específicos. Os documentos antigos de checkpoints descrevem o estado da aplicação naquelas datas; priorize o código e a documentação de integração para explicar a versão demonstrada.
