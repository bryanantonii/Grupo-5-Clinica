# Exemplos dos documentos do grupo

Estes são os **templates de `guia/templates/` já preenchidos**, para você ver o nível de detalhe esperado em cada entrega.

> **Sistema fictício.** Os exemplos descrevem o *Bom Preço — Gestão do Mercadinho* (Grupo 0), um mercadinho de bairro com pedidos de entrega. Ele **não é um dos 5 temas da turma**. O módulo **Produtos** é o mesmo que já existe pronto no repositório base.
>
> Use os exemplos para entender **formato e profundidade**. **Não copie o conteúdo**: os campos, as regras e as rotas do seu grupo estão no manual do seu tema (`guia/temas/<tema>.md`).

## Os documentos

| Exemplo | Entrega | O que observar |
| --- | --- | --- |
| [`documento-de-visao.docx`](documento-de-visao.docx) | Aula 01 (C0) | Requisitos no formato "O sistema deve permitir que [perfil] [ação]"; regras com a resposta da API quando violadas; o "fora do escopo" explícito |
| [`contrato-da-api.docx`](contrato-da-api.docx) | Aula 01, atualizado até a aula 13 | Todos os códigos HTTP de cada rota; perfil de acesso; JSON de exemplo; **histórico de mudanças** com o motivo de cada alteração |
| [`dicionario-de-dados.docx`](dicionario-de-dados.docx) | Aula 07 (C2) | Dados pessoais marcados como sensíveis; índice com a consulta que ele acelera; a justificativa de referência × embutido |
| [`plano-de-testes.docx`](plano-de-testes.docx) | Aula 05, executado na aula 14 | Um caso de teste para cada regra de negócio; casos que falharam e foram corrigidos ("Falha → OK") ligados ao registro de bugs |
| [`manual-do-usuario.docx`](manual-do-usuario.docx) | Aula 14 (C5) | Linguagem de quem usa o sistema, sem termos técnicos; prints das telas; regras explicadas para o usuário |
| [`roteiro-da-apresentacao.docx`](roteiro-da-apresentacao.docx) | Aula 15 (C5) | Cada aluno mostra o próprio módulo **e** uma regra ou decisão técnica; limitações no formato "Identificamos / priorizamos / próximo passo" |
| [`respostas-bruno-costa.md`](respostas-bruno-costa.md) | Toda aula | Respostas às perguntas de verificação do Manual de Construção, citando o arquivo do próprio módulo |

## Como usar no seu grupo

1. Copie o **template** (não o exemplo) de `guia/templates/` para a pasta `docs/` do grupo, com o nome em minúsculas e hífens (ex.: `docs/documento-de-visao.docx`).
2. Abra o exemplo ao lado e preencha seção por seção com os dados do seu tema.
3. As respostas às perguntas de verificação ficam em `docs/respostas-<seu-nome>.md` (ex.: `docs/respostas-maria-souza.md`), uma seção por aula.
4. Suba pelo fluxo normal: branch → commit → Pull Request para a `develop`.
