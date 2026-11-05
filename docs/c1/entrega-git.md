# Entrega Git do C1

Responsável pelo frontend: henriquerosaaa <henriquerosa1307@gmail.com>.

- Branch: clinica/c1-frontend.
- Fork de envio: https://github.com/henriquerosaaa/Grupo-5-Clinica/tree/clinica/c1-frontend.
- PR para a develop do grupo: https://github.com/bryanantonii/Grupo-5-Clinica/pull/3.
- Tag da entrega no fork: https://github.com/henriquerosaaa/Grupo-5-Clinica/releases/tag/v0.1-c1.

## O que foi enviado

O commit e8a89b2 contém os cadastros e os Relatórios. O commit 34da27b acrescenta os 16 testes dos mocks. Um commit próprio reúne a documentação e as evidências; a tag anotada v0.1-c1 identifica esse conjunto. Os commits do C1 usam o nome e o e-mail informados pelo responsável pelo frontend.

A autenticação foi concluída pela CLI oficial do GitHub. A conta tem permissão de leitura no repositório de bryanantonii, por isso o envio foi feito ao fork de henriquerosaaa, com o remote local chamado henrique. Nenhuma credencial faz parte da entrega.

## O que falta ao grupo

O PR está aberto para revisão. O merge na develop original ainda não foi realizado. CONTRIBUTING.md prevê revisão por outro integrante; alguém com permissão de escrita precisa conferir os checks e concluir a integração. O PR 2 da interface anterior também estava aberto nesta consulta e a branch C1 inclui aquela base; conferir a ordem dos merges.

A develop consultada já era ancestral da branch C1: o merge de origin/develop retornou Already up to date. A modificação anterior em frontend/angular.json ficou fora dos commits do C1 e o stash anterior foi preservado.

Depois de um merge que preserve os commits, um integrante autorizado pode conferir e publicar a mesma tag no repositório do grupo:

```powershell
git fetch origin
git fetch henrique tag v0.1-c1
git merge-base --is-ancestor v0.1-c1 origin/develop
# Continue somente se o comando anterior retornar código 0:
git push origin refs/tags/v0.1-c1
```

Se o grupo optar por squash ou rebase, os commits serão diferentes. Nesse caso, alinhar a identificação da entrega antes de publicar a tag no original. Não mover uma tag publicada nem usar force push.

## Comandos para este PC

```powershell
cd C:\Users\Aluno\Documents\Grupo-5-Clinica
git switch clinica/c1-frontend
git status
git show --no-patch v0.1-c1
git log -3 --oneline
```

Para continuar a branch em outro PC, clone o fork ou adicione-o como remote, busque clinica/c1-frontend e crie uma branch local que acompanhe henrique/clinica/c1-frontend. Antes de trocar de branch, confira git status para preservar alterações locais.
