# Padrão visual e navegação da Clinora

Revisão de 11/11/2026. Responsável do grupo: Henrique Guilherme Rosa, módulo E Convênios. A interface deriva do design Penpot fornecido pelo grupo e está implementada em Angular. Este documento registra o padrão atual; não afirma que o arquivo original do Penpot foi editado nesta revisão.

## Padrão adotado

- Estilos comuns em frontend/src/estilos-do-grupo.css, complementando styles.css.
- Verde institucional para ações principais, fundos claros e títulos com hierarquia.
- Botões e campos com foco visível, rótulos ligados aos controles e estados de espera.
- Mensagens de erro com texto e papel de alerta, sem depender apenas da cor.
- Mesma organização para listar, filtrar, cadastrar, editar e confirmar exclusão.
- Menu e listas adaptados ao celular; faixas de destaques com interação e pausa.

Consulte as cores e os espaçamentos exatos nos tokens CSS. A existência de uma regra de contraste ou foco no código não é certificação de acessibilidade.

## Wireframes e telas

[Abrir os seis wireframes de referência](wireframes.html). São esquemas estruturais derivados das telas implementadas, com navegação entre módulos, filtro, ações e mensagens. Não são uma nova versão do arquivo Penpot. Os [prints atuais](../entrega-final/evidencias/) ilustram os seis módulos com dados fictícios e aparecem no [Manual do Usuário](../manual-do-usuario.md).

## Verificação atual

As seis listagens/painel foram navegadas em 360, 390, 768 e 1440 px. Não houve transbordamento horizontal da página nessas 24 medições. Tabelas podem usar sua própria região de rolagem, e isso não equivale a afirmar que todos os elementos passaram em todos os requisitos de reflow. A evidência registra a largura efetivamente medida.

[Checklist atualizado](checklist-acessibilidade.md) · [Medições](../entrega-final/evidencias/responsividade.json). Leitor de tela, auditoria de contraste, navegação integral por teclado e zoom ainda exigem execução própria e registro.
