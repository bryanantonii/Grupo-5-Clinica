# Rotas atuais da Clinora

Revisão de 11/11/2026. Referência funcional: `develop`, merge `d8f60ed` do PR #11, com a revisão documental e do Swagger desta entrega.

| Área | Rotas principais |
| --- | --- |
| Público | /, /profissionais, /profissionais/:id, /convenios, /sobre, /contato |
| Conta do paciente | /criar-conta, /entrar, /recuperar-acesso, /nova-senha |
| Paciente autenticado | /minha-area, /meus-dados, /agendar, /consultas/:id, /consultas/:id/cancelar |
| Equipe | /login, /gestao e as listagens dos cinco módulos |
| Cadastros | /gestao/<modulo>, /gestao/<modulo>/cadastrar e /gestao/<modulo>/editar/:id |
| Administração | /gestao/relatorios e /gestao/usuarios |
| Mensagens | /gestao/mensagens |

Os módulos de cadastro são pacientes, profissionais, consultas, especialidades e convenios. Relatórios não possui cadastro ou edição. Existem ainda páginas de resultado e redirecionamentos de URLs antigas, definidos em frontend/src/app/app.routes.ts. A rota desconhecida mostra a página de não encontrado.

Os caminhos da interface são diferentes das rotas HTTP. A API tem prefixo /api/v1 e seu [contrato completo está aqui](contrato-da-api.md). Veja também a [matriz de permissões](entrega-final/perfis-e-rotas.md) e o [Manual do Usuário](manual-do-usuario.md).
