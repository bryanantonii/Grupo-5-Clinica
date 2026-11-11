# Perfis e rotas da Clinora

Revisão de 11/11/2026. Referência funcional: `develop`, merge `d8f60ed` do PR #11, com a revisão documental e do Swagger desta entrega.

| Operação | Público | Paciente | Atendente | Admin |
| --- | --- | --- | --- | --- |
| Catálogo e horários | Sim | Sim | Sim | Sim |
| Criar a própria conta, login e contato | Sim | Sim | Sim | Sim |
| GET/PATCH da própria conta e consultas do portal | Não | Sim | Não | Não |
| GET/POST/PATCH dos cinco cadastros | Não | Não | Sim | Sim |
| PATCH de status da consulta | Não | Não | Sim | Sim |
| DELETE administrativo | Não | Não | Não | Sim |
| PATCH ativo de Profissionais | Não | Não | Não | Sim |
| Relatórios | Não | Não | Não | Sim |
| Listar usuários, criar atendente ou vincular ficha | Não | Não | Não | Sim |
| Ler contato e marcar leitura | Não | Não | Sim | Sim |

As rotas de paciente exigem uma conta com perfil paciente, mesmo que o token de equipe seja válido. O portal verifica propriedade; conhecer o ID de uma consulta não autoriza acesso. O perfil `consulta` sugerido no manual do tema não foi adotado. Os perfis implementados são admin, atendente e paciente.

401 indica identidade ausente, inválida, expirada ou revogada; 403 indica perfil sem permissão. Esconder botões não substitui o controle no backend.

[Contrato de todas as rotas](../contrato-da-api.md) · [OpenAPI](openapi.json) · [Evidência real de 401 e 403](../apresentacao/evidencias-perguntas-banca.json).
