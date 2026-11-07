# Aula 13 da Clinora

Registro de 6 de novembro de 2026. Gestão integrada com API e MongoDB, login da equipe e permissões por perfil.

- [Registro da atividade e roteiro de apresentação](registro-2026-11-06.md).
- [Material de apoio em Word](aula-13-integracao-2026-11-06.docx).
- [Contrato da API e dicionário de dados](contrato-e-dicionario.md).
- [Checklist da entrega](checklist.md).
- [Conferência concluída no Compass e roteiro para repetir](conferencia-compass.md).
- [Respostas das aulas 11 a 13](../respostas-bryanantonii.md).
- [Evidências de integração](evidencias/integracao.json), [seed](evidencias/seed-banco.json), [navegador](evidencias/navegador.json) e [Compass](evidencias/compass.json).

Entrada da equipe: http://localhost:4200/login. As credenciais ficam somente no `.env` do backend e não são incluídas neste material.

As rotas privadas usam JWT. Administradores também podem excluir cadastros, criar atendentes e consultar Relatórios. Cancelar consulta é uma transição de status permitida à equipe. O catálogo do site continua público.

A gestão usa API por padrão (`usarMock: false`). Cadastro, login e Meus dados do paciente também estão conectados ao MongoDB, com sessão e permissões separadas da equipe. O agendamento público permanece demonstrativo. Veja a [correção do cadastro público](cadastro-publico.md).

Referências técnicas:

- [Autorização no NestJS](https://docs.nestjs.com/security/authorization).
- [Interceptors HTTP no Angular](https://angular.dev/guide/http/interceptors).
- [Guards de navegação no Angular](https://angular.dev/guide/routing/route-guards).
