# Formulários reativos da Clinora

Atualização de 26 de outubro de 2026. Módulo: Profissionais. Branch: profissionais/listagem. Esta entrega complementa a etapa anterior de listagem.

## Conferência dos tópicos da atividade

| Tópico | Situação | Onde foi aplicado ou explicado |
| --- | --- | --- |
| Template-driven e reativos; motivo da escolha | Documentado | Comparação abaixo; a aplicação usa formulários reativos |
| FormGroup, FormControl, FormBuilder e bindings | Aplicado | profissional-form.ts, profissional.validadores.ts e profissional-form.html |
| required, minLength, min, email e pattern | Aplicado conforme o campo | Profissionais usa required, minLength, maxLength, email e pattern; min é explicado para campos numéricos e já está no exemplo Produtos |
| valid, invalid, touched e dirty | Aplicado e documentado | Validação, mensagens após toque e aviso de alterações não salvas |
| ngSubmit e bloqueio do envio inválido | Aplicado | Cadastro/edição de profissionais e telas de acesso |
| Erros somente após tocar o campo | Aplicado e verificado no navegador | invalido() exige invalid e touched |
| Validação personalizada das regras do tema | Aplicado | Texto sem espaços vazios, referência existente, duplicidade, estado booleano e data/hora futura no agendamento |
| Select, datas e referências entre módulos | Aplicado conforme o módulo | Select de especialidade com ID; idDe no carregamento da edição; data/hora na agenda |
| Rótulos, foco, contraste e ajuda | Aplicado e revisado nas telas alteradas | label/for, aria-invalid, aria-describedby, mensagens, foco após erro e estilos do grupo |
| Mesmo formulário para cadastrar e editar | Aplicado | ProfissionalForm recebe o id da rota; usa criar ou atualizar conforme a operação |
| Componente profissional-form com campos do manual | Criado | Nome, registro, especialidade, e-mail e telefone; ativo é automático |
| Validações do manual | Aplicadas | Limites, formato de telefone, registro em maiúsculas, unicidade de registro/e-mail e especialidade existente |
| Erro, sucesso e botão desabilitado | Aplicado e verificado | Mensagens no formulário e na listagem; bloqueio enquanto inválido, carregando ou salvando |
| Casos inválidos | Testados | 34 testes automatizados em npm test e testes manuais descritos abaixo |
| Login e cadastro de usuário com mock | Revisados e testados | Campos obrigatórios, e-mail, senha de 8 caracteres, confirmação e ciência da demonstração |

## Por que usar formulários reativos

Em um formulário template-driven, boa parte da definição do formulário fica no HTML, usando recursos como ngModel e NgForm. É uma alternativa útil para formulários simples.

No formulário reativo, a classe TypeScript define os controles, os valores e as regras. O template conecta os campos a essa estrutura. O projeto usa essa abordagem porque cadastro e edição compartilham regras, precisam carregar dados existentes, apresentar erros por campo e permitir testes diretos das validações.

- FormControl representa um campo e guarda seu valor, erros e estados.
- FormGroup reúne os controles e representa o estado do formulário completo.
- FormBuilder ajuda a criar o grupo e seus controles.
- nonNullable mantém os valores dos campos tipados sem acrescentar null ao reset.
- [formGroup]="form" conecta o elemento form ao grupo da classe.
- formControlName="nome" conecta o campo Nome ao controle correspondente.
- (ngSubmit)="salvar()" trata o envio no componente.

O projeto não ganhou um segundo formulário template-driven: a comparação é conteúdo de estudo; as telas seguem o padrão reativo da base.

## Regras dos campos de Profissionais

| Campo | Regras |
| --- | --- |
| Nome | Obrigatório, de 3 a 80 caracteres; espaços nas bordas não tornam um nome vazio válido |
| Registro | Obrigatório, de 4 a 20 caracteres, único e salvo em maiúsculas |
| Especialidade | Obrigatória; o ID precisa estar entre as opções disponíveis |
| E-mail | Obrigatório, formato válido, único e normalizado para minúsculas |
| Telefone | Obrigatório, com DDD: (51) 99999-9999 ou (51) 9999-9999 |
| Ativo | Verdadeiro ao cadastrar; a inativação ocorre pela ação confirmada na gestão |
| ID e datas técnicas | Gerados pelo mock e preservados na edição; não são digitados no formulário |

required rejeita campo obrigatório vazio. minLength e maxLength verificam quantidade de caracteres. email verifica o formato do endereço. pattern aplica uma expressão regular, usada para o telefone.

min compara um valor numérico com um limite, por exemplo Validators.min(0) para impedir preço negativo. O exemplo didático Produtos já usa essa regra. Profissionais não tem preço no manual, então não foi acrescentado um campo numérico sem relação com o cadastro.

O validador textoAparado também confere o conteúdo sem os espaços nas bordas. referenciaExistente rejeita uma especialidade fora da lista. O mock repete as validações e verifica registro e e-mail duplicados, inclusive ao editar, desconsiderando o próprio registro.

## Estados, mensagens e envio

valid significa que as regras foram atendidas; invalid indica alguma falha. touched é marcado após o campo receber e perder o foco. dirty registra alteração feita pelo usuário e não significa, sozinho, que o campo seja inválido.

O formulário começa sem mensagens de erro. Cada mensagem de campo aparece apenas se o controle estiver invalid e touched. O estado dirty também é usado para avisar que existem alterações ainda não salvas.

O botão Salvar fica desabilitado enquanto houver campos inválidos, validação pendente, carregamento ou envio em andamento. O método salvar também confere esses estados: o bloqueio visual não é a única verificação.

Durante o envio, aparece Salvando. Uma falha mantém a pessoa no formulário, informa o problema e, quando a falha pertence a um campo, posiciona o foco nele. Após salvar, a listagem exibe a confirmação de cadastro ou atualização.

## Referências, datas e status

O select exibe o nome da especialidade e guarda seu ID no FormControl. Ao carregar a edição, idDe aceita tanto a referência em texto quanto um objeto com _id, conforme a receita 4 do guia/RECEITAS.md.

A lista de especialidades da demonstração é compartilhada com o restante da interface. Isso permite o formulário funcionar enquanto o módulo Especialidades do grupo ainda está em desenvolvimento; não significa que o cadastro completo desse módulo esteja pronto.

Profissionais não tem data de nascimento nem valor monetário no formulário do manual. No fluxo de agendamento existente, dataHoraFutura verifica se a data e o horário existem e estão no futuro. Uma data como 30 de fevereiro é rejeitada, mesmo que o JavaScript tente ajustá-la automaticamente. O agendamento também confere se o profissional está ativo e pertence à especialidade escolhida.

O mock aceita apenas booleanos para ativo. A inativação é lógica: mantém o registro e o retira da equipe disponível para novos agendamentos.

## Rotas e funcionamento da demonstração

| Rota | Uso |
| --- | --- |
| /profissionais | Página pública com busca e perfis |
| /profissionais/gerenciar | Listagem da equipe com cadastro, edição e inativação |
| /profissionais/novo | Mesmo componente ProfissionalForm no modo cadastro |
| /profissionais/:id/editar | ProfissionalForm no modo edição |
| /entrar | Login de demonstração |
| /criar-conta | Cadastro de conta de demonstração |

O rodapé contém o link Área da equipe. As rotas específicas novo e gerenciar são registradas antes da rota de perfil por ID.

ProfissionaisService define o contrato de listar, buscarPorId, criar, atualizar, remover e obter opções de especialidade. ProfissionaisMockService é registrado no app.config.ts. ProfissionaisStore mantém uma fonte única para que listagem, início, perfis e agendamento enxerguem as alterações.

A demonstração começa com três profissionais. As alterações ficam na sessão da aba e sobrevivem ao recarregamento. Não há gravação na API ou no banco. environment.usarMock continua controlando somente Produtos; o mock de Profissionais está explicitamente configurado no app.config.ts.

A listagem tem estados de carregando, erro com nova tentativa e vazio. O cartão continua reutilizável e emite conhecer, editar e inativar; a página pai decide as ações. Os controles de gestão aparecem somente na área da equipe, sem transformar a listagem pública em uma tela de cadastro.

A área da equipe é demonstrativa e ainda não possui autenticação e autorização reais de funcionário. A aplicação precisa dessas regras no backend na etapa de integração.

## Login e cadastro de usuário

As telas existentes foram revisadas para usar uma configuração de formulário compartilhada conforme a operação:

- Login: e-mail válido e senha fictícia com pelo menos 8 caracteres.
- Cadastro: nome, e-mail, senha, confirmação igual à senha e ciência do uso de dados fictícios.
- Recuperação: e-mail válido.
- Nova senha: senha fictícia válida e confirmação.

Os botões ficam bloqueados enquanto o formulário estiver inválido. Os erros aparecem após tocar os campos. Há indicação explícita de demonstração: nenhuma senha é armazenada e nenhum e-mail é enviado. O fluxo não substitui bcrypt, JWT ou autenticação e autorização no servidor.

## Validação executada

Em frontend:

- npm test: 34 testes aprovados.
- npm run build: compilação de produção aprovada.

Casos automatizados incluem campos vazios, espaços sem conteúdo, limites de nome e registro, e-mail e telefone inválidos, referência inexistente, estado inválido, registro e e-mail duplicados, edição sem duplicar o próprio registro, ID inexistente, inativação lógica, persistência, falha de armazenamento, senhas diferentes e datas impossíveis ou passadas.

No navegador, foram executados:

1. Formulário inicial com zero erros visíveis e botão desabilitado.
2. Nome inválido sem erro antes do blur; mensagem após sair do campo.
3. Campos inválidos e impedimento de envio.
4. Cadastro válido com aumento de três para quatro profissionais.
5. Edição do mesmo registro e mensagem de sucesso.
6. Recarregamento preservando os dados na sessão.
7. Cancelamento da confirmação de inativação, mantendo o profissional.
8. Inativação confirmada, com retorno a três profissionais ativos.
9. Registro e e-mail duplicados, com mensagem e botão bloqueado.
10. Foco no campo de registro após o erro de duplicidade.
11. Edição de ID inexistente com mensagem e formulário oculto.
12. Lista vazia e limpeza de filtros, restaurando três resultados.
13. Cartão reutilizado no início levando ao profissional e ao agendamento corretos.
14. Login inválido bloqueado; cadastro com senhas diferentes bloqueado; cadastro de demonstração válido concluído.
15. Formulário em uma coluna na viewport de 390 px, sem transbordamento horizontal.
16. Console sem erros nos fluxos testados.

As verificações de acessibilidade desta entrega cobrem rótulos, ajuda, foco, mensagens e disposição dos campos alterados. Não constituem uma avaliação completa de todas as páginas com leitor de tela e todos os níveis de zoom.

## Evidências

- [Formulário no computador](evidencias/formulario-profissional-desktop.jpg).
- [Formulário no celular, com mensagem de registro duplicado](evidencias/formulario-profissional-celular.jpg).
- [Atividade anterior de listagem](atividade-angular-listagem.md).
- O Word atividade-angular-clinora.docx registra a entrega anterior de listagem. Este texto registra a atualização dos formulários.

## Texto para explicar a entrega

Foi criado um formulário reativo de profissionais com os cinco campos definidos no manual da clínica. O mesmo componente é usado para cadastrar e editar. Foram aplicadas validações de preenchimento, tamanho, e-mail, telefone e referência de especialidade. O serviço mock normaliza o registro para maiúsculas e impede registro e e-mail duplicados. Os erros dos campos aparecem depois do toque, o envio inválido fica bloqueado e a interface apresenta retorno de sucesso ou falha. O mock foi registrado no app.config.ts e integrado à listagem, aos perfis e ao agendamento, com dados mantidos na sessão da aba. Também foram revisadas as telas de login e cadastro de demonstração e executados 34 testes automatizados, além da conferência dos fluxos no navegador e do formulário no celular.
