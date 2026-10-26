# Organização das branches da Clinora

Preparação em 26 de outubro de 2026. Cada branch contém o projeto completo; a divisão abaixo indica a responsabilidade das próximas alterações e dos materiais de apoio.

| Branch | Foco | Material do papel |
| --- | --- | --- |
| `profissionais/listagem` | Implementação Angular e atividade de listagem de profissionais | [Atividade de Angular](https://github.com/bryanantonii/Grupo-5-Clinica/blob/profissionais/listagem/docs/atividade-angular-listagem.md) |
| `clinica/uiux` | Padrão visual, responsividade, acessibilidade e revisão das telas | [Guia de UI/UX](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/uiux/docs/uiux/README.md) |
| `clinica/testes` | Plano de testes, execução, evidências e registro de bugs | [Orientações de Testes](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/testes/docs/testes/README.md) |
| `clinica/seguranca` | Autenticação, autorização, perfis e revisão do fluxo de estados | [Orientações de Segurança](https://github.com/bryanantonii/Grupo-5-Clinica/blob/clinica/seguranca/docs/seguranca/README.md) |

Os nomes seguem o padrão sem acentos. A branch `clinica/seguranca` já existia e estava igual à develop; foi reaproveitada com avanço de histórico, preservando os commits anteriores.

## Base compartilhada e ordem de integração

As três branches de papéis partem da interface revisada em `bb7e7af093d9fe61dfb6e7a8290ffd60ba8a6914`. Assim os colegas conseguem abrir as telas da Clinora enquanto trabalham. O front, os estilos e as imagens são dependências comuns; eles não são retirados da aplicação para separar responsabilidades.

O [PR #2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2) entrega essa base para `develop`. Na preparação destas branches ele ainda estava aberto. Integre primeiro esse PR, pela revisão normal do grupo. Depois atualize cada branch com `origin/develop` e abra o PR do papel para `develop`; assim a revisão fica concentrada na contribuição daquele papel. Não use force push.

Os commits novos das branches acrescentam materiais de apoio de cada papel. A implementação Angular anterior mantém seu histórico e autoria. A preparação das branches não representa conclusão de autenticação, cobertura de testes ou avaliação integral de acessibilidade.

## O que foi organizado para UI/UX

- Identidade derivada do Penpot: cores, fontes, botões, cartões e mensagens.
- Padrão implementado em `frontend/src/estilos-do-grupo.css`.
- Ajustes anteriores do início no celular e da faixa horizontal de destaques.
- Referências às imagens e às capturas existentes.
- Checklist inicial com evidências existentes e revisões pendentes.

A implementação de componentes, bindings, signals, filtros e eventos continua na entrega técnica do front. UI/UX define e revisa o padrão transversal, conforme o manual dos papéis.

## Como cada colega começa

No clone do repositório do grupo:

```bash
git fetch origin
git switch clinica/uiux
```

Troque a última linha por `git switch clinica/testes` ou `git switch clinica/seguranca`, conforme o papel. Se ainda não houver a branch local, use, por exemplo, `git switch --track origin/clinica/uiux`. Salve o trabalho atual antes de trocar de branch.

Para executar as telas, entre em `frontend`, execute `npm ci` se necessário e `npm start`. Acesse `http://localhost:4200`.

Após a integração da base na develop, dentro da própria branch:

```bash
git fetch origin
git merge origin/develop
```

Faça os commits da contribuição na própria conta, envie a branch e abra o PR para develop seguindo [CONTRIBUTING.md](../CONTRIBUTING.md). Combine mudanças nos arquivos compartilhados com o responsável pelo módulo.

## Referências do grupo

- [Documento Word da atividade](atividade-angular-clinora.docx): arquitetura, exemplos do código, evidências e roteiro de apresentação.
- [Regras de contribuição](../CONTRIBUTING.md).
- [Responsabilidades dos Integrantes](../guia/Responsabilidades%20dos%20Integrantes%20-%20Projeto%20Integrador.docx): papel transversal e módulo de cada integrante. A atribuição dos nomes continua sendo feita pelo grupo.
