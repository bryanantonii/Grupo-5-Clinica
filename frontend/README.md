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

Os dados ficam na sessão da aba e sobrevivem ao recarregamento. Nenhuma consulta real é marcada e nenhum e-mail ou mensagem é enviado. A integração com o backend ainda precisa ser feita.

Os componentes ficam em src/app/features/clinora/, os dados da demonstração em clinora.service.ts e os estilos em src/estilos-do-grupo.css. O backend e os exemplos didáticos foram preservados.

A configuração environment.usarMock continua controlando apenas o módulo didático Produtos. Ela não conecta Clinora à API automaticamente.

## Checkpoint C1

Abra http://localhost:4200/gestao para usar os cadastros de Pacientes, Profissionais, Consultas, Especialidades e Convênios e o painel de Relatórios. Cada módulo tem rotas de listagem, cadastrar e editar/:id. Os formulários e as listas compartilham componentes em features/gestao/shared, e as configurações de campos ficam nas pastas dos módulos.

Os providers dos cinco serviços e de Relatórios estão em app.config.ts. ClinicaMockStore guarda os exemplos em sessionStorage na chave clinora.c1.cadastros.v1. Recarregar mantém os cadastros da mesma aba. Para reiniciar os exemplos, feche a aba e abra uma nova ou remova essa chave nas ferramentas do navegador. Use apenas dados fictícios.

Os cadastros de profissionais e especialidades alimentam o catálogo público. As consultas do agendamento público anterior e as consultas da Gestão ainda usam fluxos demonstrativos separados; a unificação depende da integração da API. A área de Gestão não implementa autenticação real nesta etapa.

```powershell
npm run test:c1
npm run build
```

Para conferir estados de falha e ausência de dados, abra /gestao/pacientes?simularErro=1 e /gestao/relatorios?cenario=vazio. O primeiro endereço falha uma vez por carregamento da rota e oferece Tentar novamente. O segundo não altera os cadastros salvos.

O registro da atividade, os testes manuais e o roteiro de apresentação ficam em docs/c1 no diretório principal do projeto.

## Verificação

Compilação de produção concluída e fluxos de agendamento, bloqueio de horário ocupado, persistência, consulta, cancelamento, contato e navegação no celular verificados no navegador.
