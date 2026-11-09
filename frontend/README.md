# Clinora — Frontend Angular

Interface baseada no Penpot. A gestão da equipe usa a API NestJS e o MongoDB por padrão desde a aula 13.

## Executar

Na pasta frontend, execute `npm ci` e `npm start`. Abra http://localhost:4200.
Inicie também o backend conforme o [README da API](../backend/README.md).

## Login da equipe

Abra `/gestao`; sem sessão, o Router redireciona para `/login`. As credenciais de administrador e atendente ficam no `.env` do backend, preparadas por `npm run configurar:auth` e `npm run seed`. Não são credenciais do GitHub ou do Atlas.

A sessão usa sessionStorage, vinculado à aba. O interceptor envia o JWT somente às rotas privadas de `environment.apiUrl`. Em 401 encerra a sessão; 403 informa falta de permissão sem deslogar. O backend mantém a decisão final de acesso.

Atendentes podem listar, cadastrar, editar e mudar status de consultas. Administradores também podem excluir cadastros e acessar Relatórios. O menu e os botões acompanham o perfil; o acesso direto a Relatórios usa perfilGuard.

## Dados reais da gestão

Os cinco módulos são Pacientes, Profissionais, Consultas, Especialidades e Convênios. O painel de Relatórios consulta agregações da API. Os providers HTTP ficam em `src/app/app.config.ts`. `src/environments/environment.ts` contém o endereço da API; não há chave para ativar mocks em produção. Os mocks históricos permanecem para testes e não fornecem dados às telas.

As referências dos formulários são obtidas da API e usam IDs do MongoDB. O campo de nascimento mantém AAAA-MM-DD; datetime-local de Consultas é convertido para ISO com fuso. A confirmação de exclusão mantém o documento inativo, e cancelamento de consulta usa a rota de status.

O catálogo de profissionais continua público, usando `/api/v1/catalogo`, sem contato privado.

## Conta do paciente

`/criar-conta` grava uma conta com perfil paciente em `clinora.usuarios`, e `/entrar` valida e-mail e senha na API. `/meus-dados` consulta e atualiza a própria conta no MongoDB. A sessão do paciente é separada da equipe e não permite acessar os cadastros da gestão. O perfil antigo de demonstração no cache não libera a área.

O agendamento exige a conta do paciente e salva uma consulta real no MongoDB. Histórico, detalhe e cancelamento consultam `/conta/consultas`; os horários e convênios vêm do catálogo da API. O contato salva uma mensagem, disponível em **Gestão → Mensagens**. O admin pode criar atendentes em **Usuários e acessos**. A recuperação de senha usa a API e requer configurar SMTP no backend. Use dados fictícios no projeto acadêmico.

Consulte [a integração real](../docs/integracao-real/README.md) para entender o vínculo entre usuário e paciente, o Compass, a configuração de e-mail e os limites da verificação.

## Verificar

```powershell
npm test
npm run build
```

São 93 testes, incluindo autenticação, adaptadores HTTP, formulários e 32 casos com o Router real. `npm run test:tipos` confere a tipagem; `npm run test:rotas` executa somente a navegação. O build verifica os templates e gera `dist/frontend/browser`.

O registro, as evidências e o roteiro de apresentação ficam em [docs/aula-13](../docs/aula-13/README.md). Os registros anteriores permanecem em [docs/c1](../docs/c1) e [API de Profissionais](../docs/api-profissionais.md).
