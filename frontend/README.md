# Clinora — Front-end Angular

Projeto Integrador SENAI. Interface baseada no Penpot, com a marca e a foto originais.

## Executar

Na pasta frontend:

```powershell
npm ci
npm start
```

Abra http://localhost:4200. As dependências já estão instaladas nesta máquina.

Para gerar a produção, execute npm run build. Os arquivos ficam em dist/frontend/browser/.

## Funcionalidades

- Início, profissionais com busca e filtro, perfil, convênios, contato e sobre.
- Agendamento em quatro etapas, confirmação, área do paciente, edição do perfil e cancelamento.
- Telas de acesso, cadastro e recuperação de senha para demonstração.
- Layout responsivo, menu para celular, navegação por teclado e formulários validados.

## Demonstração

Use dados fictícios. Entre com o mesmo e-mail informado no agendamento e qualquer senha fictícia de oito ou mais caracteres. Nenhuma senha é armazenada.

Os dados dos fluxos demonstrativos ficam na sessão da aba. Nenhuma consulta real é marcada e nenhum e-mail ou mensagem é enviado. O cadastro de Profissionais já usa a API NestJS e o MongoDB; veja a seção abaixo.

Os fluxos públicos ficam em src/app/features/clinora/ e os estilos em src/estilos-do-grupo.css. Os componentes reutilizados da gestão ficam em features/gestao/shared.

A configuração environment.usarMock continua controlando apenas o módulo didático Produtos. Ela não conecta Clinora à API automaticamente.

## Checkpoint C1

Abra http://localhost:4200/gestao para usar os cadastros de Pacientes, Profissionais, Consultas, Especialidades e Convênios e o painel de Relatórios. Cada módulo tem rotas de listagem, cadastrar e editar/:id. Os formulários e as listas compartilham componentes em features/gestao/shared, e as configurações de campos ficam nas pastas dos módulos.

Os providers dos cinco serviços e de Relatórios estão em app.config.ts. Profissionais usa ProfissionaisApiService por padrão. ClinicaMockStore guarda os exemplos dos demais módulos em sessionStorage na chave clinora.c1.cadastros.v1. Recarregar mantém os cadastros da mesma aba. Para reiniciar os exemplos, feche a aba e abra uma nova ou remova essa chave nas ferramentas do navegador. Use apenas dados fictícios.

O catálogo público de profissionais e suas especialidades agora vêm da API. Os mocks dos outros módulos continuam separados. As consultas do agendamento público anterior e as consultas da Gestão ainda usam fluxos demonstrativos separados; a unificação depende da integração da API. A área de Gestão não implementa autenticação real nesta etapa.

```powershell
npm run test:c1
npm run build
```

Para conferir estados de falha e ausência de dados, abra /gestao/pacientes?simularErro=1 e /gestao/relatorios?cenario=vazio. O primeiro endereço falha uma vez por carregamento da rota e oferece Tentar novamente. O segundo não altera os cadastros salvos.

O registro da atividade, os testes manuais e o roteiro de apresentação ficam em docs/c1 no diretório principal do projeto.

## Verificação

Compilação de produção concluída e fluxos de agendamento, bloqueio de horário ocupado, persistência, consulta, cancelamento, contato e navegação no celular verificados no navegador.

## API de Profissionais — aulas 09 e 10

Em src/environments/environment.ts, usarMockProfissionais=false ativa a API; true volta ao mock C1. A opção usarMock continua controlando somente Produtos.

Inicie o MongoDB e, em backend, configure o .env conforme .env.example, execute npm ci, npm run seed:profissionais e npm run start:dev. Depois inicie o Angular em http://localhost:4200. O seed insere exemplos ausentes sem limpar o banco.

A gestão em /gestao/profissionais permite listar, buscar, cadastrar, editar, mostrar inativos e excluir com confirmação. A exclusão inativa o documento. As especialidades do select usam IDs do MongoDB; editar o mock de Especialidades não altera essa lista.

Swagger: http://localhost:3000/api/docs. A documentação completa das rotas, validações, testes, limites e roteiro de apresentação fica em [docs/api-profissionais.md](../docs/api-profissionais.md). Os relatórios e os demais cadastros ainda usam mocks.

Execute npm run test:c1 para os testes existentes e os novos testes da integração. npm run test:api roda apenas a conexão de Profissionais.

## Integração dos PRs de frontend

A gestão de Profissionais usa as telas do C1 e o serviço HTTP do PR #6. Os endereços
da primeira versão (/profissionais/gerenciar, /profissionais/novo e
/profissionais/:id/editar) redirecionam para /gestao/profissionais.
O acesso demonstrativo mantém as validações e os recursos de acessibilidade do
PR #2. O agendamento valida profissional ativo, especialidade e data futura.

Execute npm test para conferir os testes do C1, do adaptador HTTP, dos formulários
de acesso e da integração do agendamento com o catálogo. npm run build verifica
os templates e gera o frontend de produção.
