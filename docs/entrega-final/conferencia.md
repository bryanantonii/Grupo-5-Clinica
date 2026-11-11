# Conferência da documentação e da entrega

Revisão de 11/11/2026. Referência funcional: `develop`, merge `d8f60ed` do PR #11, com a revisão documental e do Swagger desta entrega.

## O que estava faltando e foi completado

- [x] Documento de Visão com persona, escopo, RF01 a RF24, regras, perfis e restrições.
- [x] Contrato das 54 operações, entradas, respostas e permissões, incluindo portal, contatos e recuperação.
- [x] Dicionário das oito coleções, campos sensíveis, índices e justificativa das referências.
- [x] Plano de Testes com rastreabilidade, resultados reais, cobertura e registro de bugs.
- [x] Manual do Usuário com os seis módulos, portal, perguntas frequentes e prints fictícios atuais.
- [x] Roteiro de 17 minutos com nomes, sequência e perguntas por integrante.
- [x] README sem instruções de mock na versão atual e com comando diário para API e frontend.
- [x] Nomes, papéis e perfis GitHub informados pelo grupo.
- [x] Seis arquivos de respostas de estudo, cada um cobrindo as 33 perguntas das aulas 01 a 14.
- [x] Swagger com descrições, exemplos de entrada, permissões e respostas; OpenAPI exportado.
- [x] Padrão visual, mapa de telas, wireframes de referência e evidências de largura atualizados.
- [x] Registro do PR 11 como integrado à develop, sem tratar a base do PR 10 como trabalho independente.

## Verificações desta revisão

179 testes Jest em 21 suítes e 95 testes do frontend passaram. Cobertura global de linhas: 24,62%, segundo o escopo padrão registrado em evidencias/qualidade.json. Foram capturados prints com dados fictícios em um banco temporário próprio, sem alterar o banco normal do grupo. As 24 medições dos seis módulos em quatro larguras não apontaram transbordamento horizontal da página.

Os verificadores HTTP anteriores continuam identificados por data. Esta revisão não declara ter repetido todos os fluxos manuais nem ter testado um provedor SMTP externo. Os arquivos Word têm fontes Markdown e foram renderizados e conferidos antes da entrega.

## O que continua pendente no projeto ou depende do grupo

- [ ] Implementar o filtro global próprio de exceções e logs por requisição da aula 14.
- [ ] Implementar filtro de período em Relatórios, com início menor ou igual ao fim.
- [ ] Configurar SMTP e verificar a entrega real do link.
- [ ] Ampliar os testes unitários dos services com cobertura baixa ou sem testes dedicados; a quantidade mínima por service não deve ser presumida pelo total global.
- [ ] Conferir o requisito antigo de componente específico com input/output em cada módulo; nem todos o implementam. ProfissionalCard é o exemplo explícito existente.
- [ ] Executar auditoria assistiva integral e ensaio de carga. Não há certificação de acessibilidade ou de desempenho.
- [ ] Cada integrante revisar as próprias respostas, conferir o histórico e conseguir explicar o código. Os arquivos não comprovam participação individual.
- [ ] Realizar ensaio cronometrado e a apresentação. A documentação não inventa data ou resultado de ensaio.
- [ ] Concluir o fluxo de entrega em main e tag v1.0 quando o grupo aprovar a versão. Esta tarefa não publicou uma versão final de produção.

Estes itens são pendências de implementação, configuração ou execução acadêmica, não lacunas ocultadas nos documentos. A documentação descreve o sistema que existe e fornece o roteiro para concluir a avaliação sem marcar como pronto algo que ainda não aconteceu.
