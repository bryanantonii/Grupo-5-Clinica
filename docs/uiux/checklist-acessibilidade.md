# Checklist de acessibilidade e responsividade

Referência: front Clinora em `bb7e7af093d9fe61dfb6e7a8290ffd60ba8a6914`, revisão anterior em 26 de outubro de 2026. Este arquivo é um ponto de partida para a pessoa responsável por UI/UX.

**Implementado** indica que o recurso existe no código; **verificado anteriormente** indica evidência registrada na revisão do front; **pendente** exige execução e registro pelo responsável. Nenhum estado abaixo certifica conformidade integral de acessibilidade.

| Item | Situação inicial | Evidência ou próxima ação |
| --- | --- | --- |
| Padrão visual do grupo centralizado | Implementado | `frontend/src/estilos-do-grupo.css` |
| Foco visível nos controles | Implementado | Regras `:focus-visible`; percorrer todas as telas pelo teclado |
| Link para pular ao conteúdo | Implementado | Layout; conferir destino e ordem de foco em cada rota |
| Rótulos e mensagens nos formulários | Implementado | Telas do front; revisar associação e leitura em todos os campos |
| Menu do celular | Implementado | Layout responsivo; repetir abertura, fechamento e navegação pelo teclado |
| Lista vazia e ação de recuperação | Verificado anteriormente | Captura de lista vazia e teste de Limpar filtros |
| Listagem em 390 px sem transbordamento horizontal | Verificado anteriormente | `docs/evidencias/listagem-profissionais-celular.jpg` |
| Listagem no computador | Verificado anteriormente | `docs/evidencias/listagem-profissionais-desktop.jpg` |
| Início mais compacto no celular | Verificado anteriormente | Ajuste anterior da abertura; responsável deve registrar nova evidência na revisão |
| Faixa horizontal com pausa e interação manual | Implementado e verificado anteriormente | `pages/inicio/inicio.ts`; repetir com toque e teclado |
| Respeito a movimento reduzido | Implementado | CSS e verificação de preferência no carrossel; validar a preferência no dispositivo |
| Todas as rotas em 360, 390, 768 e 1440 px | Pendente | Anotar navegador, viewport, resultado e capturas |
| Todas as ações somente pelo teclado | Pendente | Ordem de foco, Enter, Espaço, setas e retorno de foco |
| Leitor de tela | Pendente | Verificar nomes, títulos, erros e mudanças de estado |
| Zoom em 200% e reflow em 400% | Pendente | Verificar corte de texto, sobreposição e controles acessíveis |
| Contraste de texto, bordas, foco e estados | Pendente | Medir as combinações usadas nas telas |
| Informação compreensível sem depender só da cor | Pendente | Conferir etiquetas, seleção, mensagens e erros em todas as páginas |
| Textos alternativos e ícones decorativos | Pendente | Revisar a finalidade de cada imagem e ícone |
| Mensagens de carregamento e falha da API real | Pendente de integração | Revisar junto com o front após conectar os serviços |
| Wireframes atualizados no Penpot | Pendente de revisão do responsável | Registrar versão, data e link compartilhado |

## Registro da próxima execução

Copie a linha abaixo para cada verificação realizada:

| Data | Pessoa responsável | Rota | Navegador e viewport | Item | Esperado | Obtido | Evidência/bug |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher | A preencher |

Os campos da linha de registro estão intencionalmente vazios de resultados: devem refletir a execução real do integrante.

## Referências

- [Guia visual da Clinora](README.md).
- [Organização das branches](../organizacao-das-branches.md).
- [Capturas existentes](../evidencias/).
