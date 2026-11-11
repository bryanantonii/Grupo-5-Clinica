# Checklist de acessibilidade e responsividade

Revisão de 11/11/2026, responsável do grupo Henrique Guilherme Rosa. O quadro distingue implementação, verificação executada e itens que ainda exigem auditoria.

| Item | Situação | Evidência ou próxima ação |
| --- | --- | --- |
| Estilos comuns e padrão de ações | Implementado | estilos-do-grupo.css e telas compartilhadas. |
| Rótulos, estados de validação e mensagens | Implementado | RegistroForm e Acesso; testes de formulários. |
| Foco visível e link para conteúdo | Implementado | CSS e layout; auditoria completa por teclado pendente. |
| Seis módulos em 360, 390, 768 e 1440 px | Verificado quanto à largura | 24 medições sem overflow da página em responsividade.json. |
| Navegação autenticada dos seis módulos | Executada | Prints atuais com dados fictícios no Manual do Usuário. |
| Mensagem quando a API está inacessível | Testada no componente | Campos preservados e repetição após recuperação do serviço. |
| Wireframes estruturais dos seis módulos | Documentado | wireframes.html, derivados da implementação. |
| Movimento reduzido e pausa do carrossel | Implementado | CSS e controle de destaques; repetir em dispositivos assistivos. |
| Todas as tarefas somente com teclado | Pendente | Registrar ordem de foco, acionamento e retorno de foco. |
| Leitor de tela | Pendente | Conferir nomes, descrições, erros, estado e navegação. |
| Contraste de todas as combinações | Pendente | Medir textos, campos, foco, botões e etiquetas. |
| Zoom 200% e reflow 400% | Pendente | Validar cortes, sobreposição e alcance de controles. |
| Alternativas textuais de todas as imagens | Pendente de auditoria | Revisar finalidade e decoração em todas as páginas. |

Este checklist não declara conformidade integral com um padrão de acessibilidade. Resultados que dependem de execução humana ou de dispositivos específicos não foram marcados como aprovados apenas por inspeção do código.
