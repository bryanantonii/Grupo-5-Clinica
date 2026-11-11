# Perguntas da banca por integrante

> Registro da preparação anterior. O PR 11 foi integrado à develop em 10/11/2026. Use [o roteiro final atualizado](../roteiro-da-apresentacao.md) para nomes, tempo e situação atual.


Clinora  Grupo 5  SENAI  Aula 15  9 de novembro de 2026

Cada integrante responde uma das seis perguntas da banca e apresenta uma evidência concreta do projeto. Use a resposta pronta para ensaiar, depois faça a demonstração nos arquivos e nas telas indicadas. As perguntas foram distribuídas de acordo com os papéis e os módulos do grupo.

### Distribuição das perguntas

| Nº | Papel e módulo | Pergunta |
| --- | --- | --- |
| 1 | PO e Scrum Master  A Pacientes | Se fossem continuar, o que fariam primeiro? |
| 2 | Git e Integração  B Profissionais | Por que essa relação é referência e não embutida? |
| 3 | Segurança  C Consultas | Como a senha é guardada? Dá para descobrir pelo banco? |
| 4 | Testes e Qualidade  D Especialidades | Mostre no código a regra que acabou de demonstrar. |
| 5 | UX UI e Acessibilidade  E Convênios | O que o usuário vê quando dá erro? E o log? |
| 6 | Documentação e Apresentação  F Relatórios | E se eu chamar essa rota sem token? E com o perfil errado? |

### Como preparar a resposta

Reserve cerca de um minuto para a fala e mais um minuto para mostrar a evidência. Comece respondendo à pergunta; depois abra o código, a tela ou a resposta HTTP. Os caminhos deste material são relativos à pasta Grupo-5-Clinica.

Deixe abertos VS Code, Swagger, Compass e terminal da API. Use dados fictícios. As credenciais locais e os JWTs não devem ser incluídos no material de apresentação nem projetados na tela.

A pergunta sobre logs tem uma limitação relevante: os erros 400 e 409 tratados ainda não geram um log por requisição. A resposta correspondente explica o comportamento atual; não afirma que existe um filtro próprio de logs.

## Integrante 1 PO e Scrum Master

Módulo A Pacientes

### Pergunta da banca

Se fossem continuar, o que fariam primeiro?

### Resposta pronta para falar

Nossa primeira prioridade seria concluir o filtro de período de Relatórios, porque ele está previsto na ficha de avaliação e o painel atual mostra totais gerais. Implementaríamos data inicial e final no formulário e na API, validando que o início não seja depois do fim. Também testaríamos limites de datas e períodos sem consultas. Depois priorizaríamos a configuração do SMTP, os logs de erros tratados e a revisão ampliada de acessibilidade. Como PO, eu organizaria essas tarefas no backlog, com responsável e critério de aceite.

### Passo a passo para demonstrar

1. Abra Gestão > Relatórios e mostre os indicadores atuais. Explique que ainda não há campos de período.
2. Abra docs/integracao-real/README.md e localize a pendência do filtro de período.
3. Explique o trabalho proposto: formulário de datas no Angular, parâmetros/DTO na API e filtro por dataHora nas consultas do MongoDB.
4. Defina o aceite: início menor ou igual ao fim, período aplicado aos dados de consultas e mensagem de sem dados. O total de pacientes ativos deve ter sua semântica definida, pois é um indicador de cadastro.
5. Explique os testes necessários: intervalo invertido, consulta no limite do período, período vazio e manutenção da regra de acesso por admin. Abra uma tarefa e depois um PR para a revisão do grupo.

### Onde mostrar no VS Code

- [frontend/src/app/features/relatorios/relatorios-painel.html](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/relatorios/relatorios-painel.html)
- [backend/src/relatorios/relatorios.controller.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/relatorios/relatorios.controller.ts)
- [backend/src/relatorios/relatorios.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/relatorios/relatorios.service.ts)
- [docs/integracao-real/README.md](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/integracao-real/README.md)

### Se a banca aprofundar

Por que não começar apenas por novas telas? O filtro atende um requisito conhecido e exige um comportamento verificável nas duas camadas. Esta é uma proposta de continuidade; o recurso ainda não está implementado.

Mostre o painel atual e a limitação documentada. Use futuro ao falar do que ainda será feito.

## Integrante 2 Git e Integração

Módulo B Profissionais

### Pergunta da banca

Por que essa relação é referência e não embutida?

### Resposta pronta para falar

Em Profissionais, a especialidade é uma referência porque uma mesma especialidade atende vários profissionais e tem cadastro próprio. Guardamos seu ObjectId, em vez de copiar nome, duração e valor para cada profissional. Assim, a informação central fica em Especialidades e a API pode buscar os dados pelo ID. A existência da especialidade é validada no service; MongoDB não cria uma chave estrangeira automática. Embutir seria uma opção em outros contextos, como um conjunto de dados próprio de um único documento ou uma cópia histórica que precise ficar congelada.

### Passo a passo para demonstrar

1. Abra backend/src/profissionais/schemas/profissional.schema.ts e mostre especialidade: Types.ObjectId.
2. Abra o service de Profissionais e mostre a busca da especialidade antes da criação.
3. Abra profissionais-especialidades.service.ts e localize buscarPorId. Explique a resposta 404 para uma referência inexistente.
4. No Compass, compare o ID de especialidade de um profissional com o _id de um documento em especialidades. Não altere nem exclua os documentos para fazer essa conferência.
5. Mostre o contrato e dicionário e a ADR 001, que registra a justificativa dessa decisão.

### Onde mostrar no VS Code

- [backend/src/profissionais/schemas/profissional.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/profissionais/schemas/profissional.schema.ts)
- [backend/src/profissionais/profissionais.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/profissionais/profissionais.service.ts)
- [backend/src/profissionais/profissionais-especialidades.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/profissionais/profissionais-especialidades.service.ts)
- [docs/adr/001-referencias-entre-modulos.md](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/adr/001-referencias-entre-modulos.md)

### Se a banca aprofundar

Referência é sempre melhor? Não. Ela facilita compartilhar dados e atualizá-los em um cadastro central, mas exige consultas e validação dos vínculos. Dados embutidos podem ser adequados quando pertencem ao mesmo documento ou precisam de uma fotografia histórica.

Mostre schema, dicionário e ADR. O campo do schema é ObjectId; a busca da referência neste módulo é feita explicitamente pelo service, sem depender de populate automático.

## Integrante 3 Segurança

Módulo C Consultas

### Pergunta da banca

Como a senha é guardada? Dá para descobrir pelo banco?

### Resposta pronta para falar

A senha não é gravada em texto. O backend usa bcrypt.hash com custo 10 e salva o resultado em senhaHash na coleção usuarios. No login, bcrypt.compare verifica a senha digitada contra esse hash. O bcrypt usa um salt e não tem uma operação para descriptografar o hash e devolver a senha original. Isso não torna uma senha fraca impossível de adivinhar: quem obtém hashes pode tentar combinações. Por isso, além do hash, precisamos de senhas adequadas e controle de acesso ao banco. A API não devolve o hash nas respostas de conta.

### Passo a passo para demonstrar

1. Abra usuarios.service.ts e mostre const senhaHash = await bcrypt.hash(dto.senha, 10).
2. Abra auth.service.ts e mostre bcrypt.compare(senha, usuario.senhaHash). Explique que o login compara, não descriptografa.
3. Abra o schema de Usuario e mostre o campo senhaHash com select: false. As respostas da API também selecionam os campos públicos.
4. No Compass, use uma conta fictícia de demonstração em clinora.usuarios e localize senhaHash. Um valor bcrypt pode começar com $2b$10$. Não mostre senhas do .env ou hashes completos de contas reais no projetor.
5. Mostre que as respostas de login e conta contêm os dados permitidos e não a senha ou seu hash.

### Onde mostrar no VS Code

- [backend/src/usuarios/usuarios.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/usuarios/usuarios.service.ts)
- [backend/src/auth/auth.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/auth/auth.service.ts)
- [backend/src/usuarios/schemas/usuario.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/usuarios/schemas/usuario.schema.ts)
- [backend/src/usuarios/usuarios.service.spec.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/usuarios/usuarios.service.spec.ts)

### Se a banca aprofundar

O que significa o 10? É o fator de custo, que controla o trabalho do algoritmo; não significa o tamanho da senha nem dez execuções simples. Bcrypt é hash de senha e não criptografia reversível.

Mostre o campo senhaHash no Compass e as duas operações bcrypt no código. Use somente uma conta fictícia preparada para a apresentação.

## Integrante 4 Testes e Qualidade

Módulo D Especialidades

### Pergunta da banca

Mostre no código a regra que acabou de demonstrar.

### Resposta pronta para falar

A regra que vou demonstrar é a proibição de especialidades com o mesmo nome. No EspecialidadesService, verificarNome procura um registro existente usando collation de português com strength 1, que ignora diferenças de caixa e acentos. Se encontrar, lança ConflictException e a API responde 409. O teste impede nome duplicado usando a mesma collation do índice simula um registro existente, espera a exceção e confirma que create não foi chamado. Assim, mostramos tanto a implementação da regra quanto sua verificação automatizada.

### Passo a passo para demonstrar

1. Em Gestão > Especialidades, identifique uma especialidade existente e tente cadastrar o mesmo nome em outro registro fictício. Explique o conflito 409.
2. Abra especialidades.service.ts no método verificarNome e a chamada desse método dentro de criar.
3. Mostre findOne, collation({ locale: 'pt', strength: 1 }) e ConflictException. A proteção por índice único também trata a disputa entre requisições concorrentes.
4. Abra especialidades.regras.spec.ts no teste que impede nome duplicado. Mostre rejects.toBeInstanceOf(ConflictException) e expect(model.create).not.toHaveBeenCalled().
5. No terminal do backend, execute npm test -- --runInBand especialidades.regras.spec.ts e explique o resultado. Não confunda teste unitário com uma gravação real no banco.

### Onde mostrar no VS Code

- [backend/src/especialidades/especialidades.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/especialidades/especialidades.service.ts)
- [backend/src/especialidades/especialidades.regras.spec.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/especialidades/especialidades.regras.spec.ts)
- [backend/src/especialidades/schemas/especialidade.schema.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/especialidades/schemas/especialidade.schema.ts)
- [frontend/src/app/features/especialidades/especialidades.config.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/especialidades/especialidades.config.ts)

### Se a banca aprofundar

O teste prova tudo? Ele prova esse comportamento isolado. Os verificadores HTTP/MongoDB complementam a análise verificando a integração e a persistência reais.

Mostre service e teste lado a lado. A regra escolhida deve ser a mesma apresentada na tela.

## Integrante 5 UX UI e Acessibilidade

Módulo E Convênios

### Pergunta da banca

O que o usuário vê quando dá erro? E o log?

### Resposta pronta para falar

A tela mostra uma mensagem de erro ligada ao problema e conserva o formulário para correção. Os validadores do Angular ajudam antes do envio; se a API rejeitar a operação, GestaoApiService lê a mensagem da resposta e o componente a apresenta com role alert. Por exemplo, um ID inválido em Convênios retorna 400 com a mensagem O id do convênio não é válido. A API usa o filtro padrão de exceções do NestJS. Hoje não temos log por requisição para cada erro 400 ou 409 tratado. Temos logs de inicialização e tratamento de erros inesperados; registrar erros tratados de forma estruturada é uma melhoria pendente.

### Passo a passo para demonstrar

1. Abra um formulário de Convênio e preencha a cobertura com 120. Mostre a validação do campo e o bloqueio do envio inválido; nesse caso, a API pode nem ser chamada.
2. Para demonstrar uma resposta da API, use no Swagger GET /api/v1/convenios/id-invalido com autenticação de equipe. O resultado esperado é 400.
3. Mostre o corpo real: message, error e statusCode. Abra GestaoApiService.tratarErro e registro-form.html para explicar como a mensagem chega ao usuário.
4. Explique que RespostaInterceptor padroniza sucessos; ele não é um filtro próprio de erros. A resposta de erro vem do tratamento padrão de exceções do Nest.
5. Mostre o terminal da API sem atribuir a esse 400 uma linha que não existe. A ausência de log por requisição deve ser apresentada como pendência. Há um logger explícito de falha de SMTP no módulo de recuperação, mas ele é de outro cenário.

### Onde mostrar no VS Code

- [frontend/src/app/features/gestao/services/gestao-api.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/gestao/services/gestao-api.service.ts)
- [frontend/src/app/features/gestao/shared/registro-form.html](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/frontend/src/app/features/gestao/shared/registro-form.html)
- [backend/src/convenios/convenios.service.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/convenios/convenios.service.ts)
- [backend/src/common/interceptors/resposta.interceptor.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/common/interceptors/resposta.interceptor.ts)

### Se a banca aprofundar

O que adicionaríamos ao log? Método, rota, status, horário e um identificador da requisição, sem senhas, JWTs nem dados clínicos. Não afirme que já há um filtro de log próprio implementado.

Mostre o erro na tela e a resposta HTTP. Para a parte do terminal, explique o comportamento atual e a limitação; não simule uma evidência que o projeto não produz.

## Integrante 6 Documentação e Apresentação

Módulo F Relatórios

### Pergunta da banca

E se eu chamar essa rota sem token? E com o perfil errado?

### Resposta pronta para falar

Podemos demonstrar com GET /api/v1/relatorios/resumo. Sem token, o guard JWT retorna 401 porque não há autenticação válida. Com um token válido de atendente, o PerfisGuard retorna 403, pois Relatórios exige admin. Com um token válido de administrador, a mesma rota retorna 200. Portanto, 401 significa que a autenticação não foi aceita; 403 significa que a pessoa foi autenticada, mas não tem permissão para aquela ação. A verificação acontece no backend, mesmo que alguém conheça a URL ou modifique o menu no navegador.

### Passo a passo para demonstrar

1. Abra http://localhost:3000/api/docs e selecione GET /relatorios/resumo.
2. Remova qualquer autorização anterior no Swagger e execute a rota. Mostre 401 e Token não informado.
3. Faça login como atendente em POST /auth/login, usando as credenciais locais sem projetá-las. Cole somente o accessToken em Authorize; o Swagger envia o Bearer.
4. Execute a mesma rota e mostre 403 e a mensagem de falta de permissão. Um token inválido ou expirado continuaria gerando 401, não 403.
5. Autorize com um token de admin e repita a requisição. Mostre 200 e os indicadores.
6. Abra relatorios.controller.ts para mostrar @Perfis('admin') e os guards de JWT e perfis. Mostre o contrato das rotas.

### Onde mostrar no VS Code

- [backend/src/relatorios/relatorios.controller.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/relatorios/relatorios.controller.ts)
- [backend/src/auth/guards/jwt-auth.guard.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/auth/guards/jwt-auth.guard.ts)
- [backend/src/auth/guards/perfis.guard.ts](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/backend/src/auth/guards/perfis.guard.ts)
- [docs/aula-13/contrato-e-dicionario.md](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/integracao-completa/docs/aula-13/contrato-e-dicionario.md)

### Se a banca aprofundar

Toda rota precisa de token? Não. Existem rotas públicas como o catálogo e o login. O exemplo usa uma rota privada exclusiva de admin para tornar a diferença entre 401 e 403 visível.

Conferido na API local: sem token 401; atendente autenticado 403; administrador autenticado 200. Nenhuma credencial ou token acompanha este material.

## Ensaio em duplas e conferência das evidências

### Duplas sugeridas

| Dupla | O que estudar juntos |
| --- | --- |
| 1 e 6 | Pacientes e Relatórios. Relacionar o backlog e os critérios de aceite ao filtro de período proposto. |
| 2 e 4 | Profissionais e Especialidades. Conferir o ObjectId, a validação da referência e o teste de nome único. |
| 3 e 5 | Consultas e Convênios. Relacionar segurança, hash, permissões e mensagens de erro para o usuário. |

Cada pessoa deve conseguir explicar uma regra do módulo do colega. Durante o ensaio, uma pessoa faz a pergunta e a outra responde e abre a evidência. Depois troquem os papéis.

### Conferência realizada na API local

| Requisição | Resultado confirmado |
| --- | --- |
| GET /api/v1/relatorios/resumo sem token | 401  Token não informado |
| Mesma rota com JWT de atendente | 403  Sem permissão para a ação |
| Mesma rota com JWT de admin | 200  Indicadores retornados |
| GET /api/v1/convenios/id-invalido com JWT de equipe | 400  O id do convênio não é válido. |

O teste especialidades.regras.spec.ts foi executado: uma suíte e três testes aprovados. Inclui o caso de nome duplicado, a disputa de índice único e o ID inexistente. As conferências HTTP acima não criaram, alteraram ou removeram registros da clínica.

### Antes de começar

Use a branch clinica/integracao-completa, que contém a integração atual. Os PRs 10 e 11 ainda estavam abertos na revisão do roteiro.

Mantenha o backend e o frontend em execução e use a conexão Clinora local - API no Compass.

Abra a ADR 001 e o dicionário antes da resposta de referências. Na resposta de senha, use somente uma conta fictícia.

Diferencie implementação atual e proposta: filtro de período, SMTP configurado e logs por requisição não devem ser apresentados como concluídos.

Referência da atividade: slide As perguntas que a banca costuma fazer, Aula 15 Banca Final, página 13, fornecido pelo grupo. As evidências técnicas estão nos arquivos indicados em cada resposta.
