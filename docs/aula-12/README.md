# Aula 12 da Clinora

- [Registro da atividade e roteiro de apresentação](registro-2026-11-05.md).
- [Material de apoio em Word](aula-12-autenticacao-2026-11-05.docx).
- [Checklist](checklist.md).
- [Contrato das rotas e dicionário de Usuários](contrato-e-dicionario.md).
- [Respostas de verificação](../respostas-bryanantonii.md).

Implementação: `backend/src/usuarios` e `backend/src/auth`. O catálogo público
está em `backend/src/profissionais/catalogo.controller.ts`.

Os arquivos em `evidencias/` não contêm senhas, hashes nem tokens. As credenciais
do administrador e o segredo JWT estão somente no `.env` local.

Referências técnicas usadas para a implementação:

- [Autenticação no NestJS 11](https://docs.nestjs.com/v11/techniques/authentication).
- [bcryptjs e o limite de entrada em UTF-8](https://github.com/dcodeIO/bcrypt.js/).
