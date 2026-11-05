# Aula 11 de Convênios

Entrega de ValentinadelosAngeles, de 4 de novembro de 2026, na branch `convenios/regras-aula11`.

- [Pull Request 7 para develop](https://github.com/bryanantonii/Grupo-5-Clinica/pull/7).
- [Registro completo e roteiro para apresentação](registro-2026-11-04.md).
- [Documento Word](aula-11-convenios-2026-11-04.docx).
- [Checklist](checklist.md).
- [Resultados dos testes](evidencias/testes.json).
- [Conferência real no MongoDB](evidencias/verificacao-real.json).

A entrega implementa RN10 e RN11 na camada de serviço do módulo E. Ela parte do schema e seed do [PR 5](https://github.com/bryanantonii/Grupo-5-Clinica/pull/5), ainda separado da develop. O diff para develop também inclui essa base anterior. Os commits novos da aula 11 acrescentam somente o service, seu registro, testes, verificador e documentação.

O service é acessível pelo container do Nest. Não há controller HTTP de Convênios nesta base; a atividade não acrescenta rotas, autenticação ou integração Angular. Estados de Consultas e relatórios pertencem aos módulos C e F. JWT, senhas e perfis são das aulas seguintes.
