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

Os arquivos didáticos de Produtos foram movidos para referencias/produtos/frontend, fora do aplicativo Angular. As rotas e os serviços de Produtos não participam da Clinora. A relação das rotas reais está em [Rotas da Clinora](../docs/rotas-clinora.md).

## Checkpoint C1

Abra http://localhost:4200/gestao para usar os cadastros de Pacientes, Profissionais, Consultas, Especialidades e Convênios e o painel de Relatórios. Cada módulo tem rotas de listagem, cadastrar e editar/:id. Os formulários e as listas compartilham componentes em features/gestao/shared, e as configurações de campos ficam nas pastas dos módulos.

Os providers dos cinco serviços e de Relatórios estão em app.config.ts. Profissionais usa ProfissionaisApiService por padrão. ClinicaMockStore guarda os exemplos dos demais módulos em sessionStorage na chave clinora.c1.cadastros.v1. Recarregar mantém os cadastros da mesma aba. Para reiniciar os exemplos, feche a aba e abra uma nova ou remova essa chave nas ferramentas do navegador. Use apenas dados fictícios.

O catálogo público de profissionais e suas especialidades vem das rotas de leitura `/api/v1/catalogo/profissionais` e `/api/v1/catalogo/especialidades`, sem exigir token ou expor contato privado. Os mocks dos outros módulos continuam separados. As consultas do agendamento público anterior e as consultas da Gestão ainda usam fluxos demonstrativos separados; a unificação depende da integração da API. Na aula 12, a API passa a exigir JWT nas rotas de gestão. O login demonstrativo do Angular ainda não envia esse token; essa integração pertence à aula 13. Portanto, a gestão de Profissionais recebe 401 até o envio do JWT, enquanto o catálogo público continua disponível. Para demonstrar a autenticação nesta aula, use o Swagger conforme [o roteiro da aula 12](../docs/aula-12/README.md).

```powershell
npm run test:c1
npm run build
```

Para conferir estados de falha e ausência de dados, abra /gestao/pacientes?simularErro=1 e /gestao/relatorios?cenario=vazio. O primeiro endereço falha uma vez por carregamento da rota e oferece Tentar novamente. O segundo não altera os cadastros salvos.

O registro da atividade, os testes manuais e o roteiro de apresentação ficam em docs/c1 no diretório principal do projeto.

## Verificação

Compilação de produção concluída e fluxos de agendamento, bloqueio de horário ocupado, persistência, consulta, cancelamento, contato e navegação no celular verificados no navegador.

## API de Profissionais — aulas 09 e 10

Em src/environments/environment.ts, usarMockProfissionais=false ativa a API; true volta ao mock C1. A opção antiga usarMock foi removida porque era usada somente pelo exemplo didático.

Inicie o MongoDB e, em backend, configure o .env conforme .env.example, execute npm ci, npm run configurar:auth, npm run seed e npm run start:dev. Depois inicie o Angular em http://localhost:4200. O seed insere exemplos ausentes sem limpar o banco.

As telas em /gestao/profissionais oferecem listar, buscar, cadastrar, editar, mostrar inativos e excluir com confirmação. Desde a aula 12, os endpoints dessas operações exigem JWT; a ligação com o login Angular será entregue na aula 13. A exclusão inativa o documento. As especialidades do select usam IDs do MongoDB; editar o mock de Especialidades não altera essa lista.

Swagger: http://localhost:3000/api/docs. A documentação completa das rotas, validações, testes, limites e roteiro de apresentação fica em [docs/api-profissionais.md](../docs/api-profissionais.md). Os relatórios e os demais cadastros ainda usam mocks.

Execute npm run test:c1 para os testes existentes e os novos testes da integração. npm run test:api roda apenas a conexão de Profissionais.

## Integração dos PRs de frontend

A gestão de Profissionais usa as telas do C1 e o serviço HTTP do PR #6. Os endereços
da primeira versão (/profissionais/gerenciar, /profissionais/novo e
/profissionais/:id/editar) redirecionam para /gestao/profissionais.
O acesso demonstrativo mantém as validações e os recursos de acessibilidade do
PR #2. O agendamento valida profissional ativo, especialidade e data futura.

Execute npm test para conferir os testes do C1, do adaptador HTTP, dos formulários
de acesso, da integração do agendamento e da navegação real com o Router. Para
conferir somente a navegação, execute npm run test:rotas. npm run build verifica
os templates e gera o frontend de produção.

Os testes TypeScript possuem configuração própria em `tsconfig.tests.json` e os
tipos do Node como dependência de desenvolvimento. `npm run test:tipos` confere
esses arquivos antes da execução dos testes; essa etapa também faz parte de
`npm test`.
