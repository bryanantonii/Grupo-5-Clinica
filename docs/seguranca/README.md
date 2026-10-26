# Segurança da Clinora

Branch: `clinica/seguranca`, reaproveitada da branch já existente. A preparação inclui a mesma interface demonstrativa usada pelos demais papéis e este levantamento para o responsável continuar o trabalho.

## O que existe hoje no front

| Recurso | Arquivo | Alcance atual |
| --- | --- | --- |
| Telas de entrar, cadastro e recuperação | `frontend/src/app/features/clinora/acesso.ts` | Fluxos de demonstração |
| Guarda de navegação sessaoDemo | `frontend/src/app/app.routes.ts` | Redireciona para entrar quando não existe perfil na demonstração |
| Perfil e consultas por sessão | `frontend/src/app/features/clinora/clinora.service.ts` | Dados no navegador, em sessionStorage |
| Mensagens e validação visual | Formulários e `estilos-do-grupo.css` | Retorno de preenchimento ao usuário |

A demonstração aceita os dados fictícios descritos no README do front. Não verifica uma senha em servidor, não emite JWT e não substitui autorização da API. Nenhuma senha é armazenada pelo ClinoraService. A associação de consultas por e-mail existe para a demonstração; a versão integrada deve usar a identidade autenticada definida pelo backend.

`environment.usarMock` controla somente o módulo didático Produtos. Mudar esse valor não integra autenticação ou os demais fluxos da Clinora.

## Próximas ações do responsável

1. Definir com o grupo os perfis e a matriz de permissão por rota, com base no contrato da API.
2. Implementar no backend o cadastro e login com hash de senha e a estratégia de autenticação definida para o projeto.
3. Validar entradas no servidor e impedir a exposição de senhas ou campos sensíveis nas respostas.
4. Aplicar autenticação e autorização nas rotas e conferir a identidade em cada operação de consulta ou alteração.
5. Conectar as telas de acesso à API junto com o responsável pelo front, incluindo os estados de erro, sessão encerrada e acesso negado.
6. Implementar e testar as transições de estado do módulo atribuído ao integrante.
7. Executar os testes obrigatórios quando os módulos necessários estiverem implementados.

O documento [Responsabilidades dos Integrantes](../../guia/Responsabilidades%20dos%20Integrantes%20-%20Projeto%20Integrador.docx) prevê bcrypt, JWT, guardas e perfis nas etapas de Segurança. Esta preparação de branch não implementa essas funções.

## Evidências a produzir na etapa de integração

- Matriz de perfis e rotas validada com o grupo.
- Casos de acesso sem autenticação (401) e sem permissão (403), usando a API real.
- Confirmação de que respostas da API não contêm senha ou hash.
- Testes de autenticação e autorização e de transições válidas e inválidas.
- Mensagens compreensíveis no front para falha de autenticação e falta de permissão.

O material de referência em [testes-obrigatorios](../../backend/testes-obrigatorios/) contém `auth.service.spec.ts`, `usuarios.service.spec.ts` e `perfis.guard.spec.ts`. Os oito testes didáticos aprovados anteriormente não substituem esses testes de Segurança.

## Coordenação com os demais papéis

Combine mudanças em `app.routes.ts`, `app.config.ts` e serviços compartilhados com o front. UI/UX revisa rótulos e mensagens; Testes repete os cenários e registra os resultados; Documentação consolida o contrato e as evidências.

Consulte o [README do front](../../frontend/README.md), o [documento da atividade](../atividade-angular-clinora.docx) e a [organização das branches](../organizacao-das-branches.md). Use somente dados fictícios enquanto o sistema estiver em demonstração.
