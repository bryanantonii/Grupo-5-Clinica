# Atividade de Angular com listagem de profissionais

Data da revisão: 26 de outubro de 2026. Módulo escolhido para demonstrar a atividade: Profissionais.

## O que já existia

- Angular 21 com componentes standalone e organização core, layout, pages e features.
- Interface Clinora baseada no Penpot, menu, página inicial e listagem com busca e filtro.
- Cartão reutilizado no início e na listagem, recebendo o profissional por input().
- Interpolação, property binding, class binding, eventos, signals com set() e update(), @if, @else e @for com track.
- DatePipe nas consultas e CurrencyPipe no módulo didático Produtos.
- Padrão visual em frontend/src/estilos-do-grupo.css.

## O que foi completado nesta atividade

1. Modelo frontend/src/app/features/profissionais/profissional.model.ts com todos os campos do módulo B: _id, nome, registro, especialidade, email, telefone, ativo e datas opcionais; tipo de entrada separado.
2. Organização do módulo Profissionais em profissionais-lista, profissional-card e perfil-profissional.
3. Cartão de apresentação sem acesso a serviço ou roteador. Recebe profissional e nomeEspecialidade com input.required() e emite conhecer com output().
4. Página pai trata (conhecer) com abrirPerfil($event). O início também reutiliza o mesmo cartão e trata o evento.
5. @for com track p._id e @empty na listagem. O botão Limpar filtros restaura os três resultados.
6. Registro e e-mail demonstrativos exibidos no cartão. A listagem considera profissionais ativos.
7. develop local atualizada com a base oficial do professor no commit e36588a. Criada a branch profissionais/listagem.
8. Prints da listagem, lista vazia e celular em docs/evidencias/.
9. Pull Request [#2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2) aberto de profissionais/listagem para develop, com o print na descrição. Revisão e merge pendentes do grupo.

## Validação do front end

- npm run build concluído sem erros.
- Busca RAFAEL encontrou um profissional.
- Busca sem-correspondencia exibiu a mensagem de lista vazia.
- Limpar filtros restaurou três profissionais.
- Conhecer profissional emitiu o evento e a página pai abriu o perfil correto.
- Cartão reutilizado no início abriu o perfil correto.
- Tela de 390 px sem transbordamento horizontal e navegador sem erros de console durante os testes.

## Verificações adicionais do repositório

Sem alterar arquivos de código do backend, foram aprovados o ESLint sem --fix, os oito testes unitários e o build do backend. Essas verificações não representam integração real da Clinora com a API.

## Limites do escopo

A entrega atual é uma demonstração do front end. Não há autenticação real nem integração do domínio Clinora com a API. O contrato de Profissionais segue o manual, mas os dados de apresentação ainda usam slugs e registros fictícios. O cadastro, a edição e a inativação de profissionais previstos para etapas posteriores do manual não fazem parte da entrega de listagem desta aula.

A guarda do front end organiza a navegação e não substitui autorização no servidor. A API deverá validar regras e referências, e o banco fará a persistência. environment.usarMock atualmente controla apenas o módulo didático Produtos.

## Material de apoio

O documento Word da atividade contém a matriz completa dos requisitos, exemplos do código, explicação dos conceitos, evidências e roteiro de apresentação. Sua versão final está em [atividade-angular-clinora.docx](atividade-angular-clinora.docx).
