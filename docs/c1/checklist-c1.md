# Checklist do C1

Revisão técnica de 27/10/2026. Os itens marcados têm implementação ou verificação registrada; não representam aprovação formal de outro integrante.

- [x] Cinco módulos: Pacientes, Profissionais, Consultas, Especialidades e Convênios.
- [x] Listagem, cadastro e edição em cada módulo, com links no menu Gestão.
- [x] Rotas organizadas em app.routes.ts, gestao.routes.ts e arquivos por módulo.
- [x] Parâmetro editar/:id, carregamento do cadastro e retorno à lista após salvar.
- [x] Rota coringa ** e página não encontrada.
- [x] Formulários reativos com validação e mensagens por campo.
- [x] Contratos de serviço e providers dos mocks registrados em app.config.ts.
- [x] Ao menos três registros iniciais em cada módulo.
- [x] Busca por texto e filtro por status em Consultas.
- [x] Exclusão lógica com confirmação e filtro Mostrar inativos.
- [x] Cancelamento de consultas com confirmação e preservação do histórico.
- [x] Estados de carregamento, erro, vazio, sucesso e salvamento.
- [x] Painel de Relatórios e Visão geral.
- [x] 16 testes dos mocks aprovados.
- [x] Build de produção do frontend aprovado.
- [x] Revisão representativa em 360, 390, 768 e 1440 px.
- [x] Rótulos, nomes acessíveis, foco, Tab, Enter, Escape e pular conteúdo conferidos.
- [x] Registro da atividade, backlog e roteiro de apresentação preparados.
- [ ] Revisão ampliada com leitor de tela, contraste medido e zoom.
- [x] Autenticação como henriquerosaaa e envio da branch ao fork.
- [x] PR 3 aberto para a develop do repositório do grupo.
- [x] Tag v0.1-c1 da entrega publicada no fork.
- [ ] Revisão e merge do PR na develop, conforme CONTRIBUTING.md.
- [ ] Publicação da tag no repositório do grupo, depois da revisão da integração.

A entrega e os comandos de integração são registrados em entrega-git.md. A conta tem permissão de leitura no original; por isso o merge depende de um integrante com permissão de escrita. Os testes Jest do backend ficaram limitados pelo resolvedor deste ambiente; lint e build do backend passaram.
