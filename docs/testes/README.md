# Testes e Qualidade da Clinora

Branch: `clinica/testes`. A branch já contém o front demonstrativo para a pessoa responsável executar e documentar os cenários. Este roteiro inicial organiza o material recebido; o Plano de Testes formal continua sendo consolidado pelo grupo.

## Verificações que já foram executadas

Na revisão do front em 26 de outubro de 2026, registrada no [PR #2](https://github.com/bryanantonii/Grupo-5-Clinica/pull/2) e no [documento Word](../atividade-angular-clinora.docx), foram aprovados:

- Build de produção do front.
- Busca por RAFAEL com um resultado, busca sem correspondência com lista vazia e limpeza dos filtros com três resultados.
- Evento conhecer do cartão tratado na página pai, abrindo o perfil correto.
- Reutilização do cartão na página inicial.
- Listagem em 390 px sem transbordamento horizontal e console sem erros nos fluxos exercitados.
- ESLint do backend sem correção automática, oito testes unitários e build do backend.

Esses oito testes pertencem ao módulo didático existente. Eles não comprovam cobertura dos módulos da clínica, autenticação real ou execução dos testes obrigatórios de Segurança. O front atual não possui um script `npm test`; os testes de tela listados acima foram manuais.

## Casos iniciais para repetir e registrar

| ID | Passos | Resultado esperado | Situação nesta preparação |
| --- | --- | --- | --- |
| FT-01 | Abrir /profissionais sem filtros | Mostrar os três profissionais demonstrativos | Evidência anterior disponível; repetir |
| FT-02 | Buscar RAFAEL | Mostrar Rafael Mendes | Evidência anterior disponível; repetir |
| FT-03 | Buscar sem-correspondencia | Mostrar Nenhum profissional encontrado e Limpar filtros | Evidência anterior disponível; repetir |
| FT-04 | Acionar Limpar filtros | Restaurar três resultados | Verificado anteriormente; repetir |
| FT-05 | Selecionar uma especialidade e buscar | Exibir apenas profissionais da especialidade | Registrar nova execução |
| FT-06 | Acionar Conhecer profissional na listagem e no início | Abrir o perfil correspondente ao cartão | Verificado anteriormente; repetir |
| FT-07 | Abrir listagem em 390 px | Controles legíveis e sem rolagem horizontal da página | Evidência anterior disponível; repetir |
| FT-08 | Usar os destaques no celular | Deslizar e pausar; indicadores acompanham o item | Repetir e registrar dispositivo |
| FT-09 | Preencher formulário de agendamento incompleto | Impedir avanço e mostrar orientação de preenchimento | Executar e registrar |
| FT-10 | Agendar e consultar com e-mail fictício na mesma sessão | Exibir a consulta demonstrativa correspondente | Executar e registrar |
| FT-11 | Tentar repetir profissional, data e horário já confirmado | Bloquear a duplicidade na demonstração | Executar e registrar |
| FT-12 | Cancelar uma consulta da demonstração | Exibir o estado cancelado | Executar e registrar |

Use somente dados fictícios na demonstração. Os serviços Clinora usam dados no navegador e sessionStorage; os cenários não equivalem a testes de integração com a API.

## Comandos disponíveis

No front, execute `npm ci` quando necessário, `npm start` para testar as telas e `npm run build` para compilar.

No backend, execute a partir de `backend`:

```bash
npx eslint "src/**/*.ts"
npm test -- --ci --runInBand
npm run build
npm run test:cov
```

A medição de cobertura é uma próxima ação; não foi gerado um relatório novo para esta preparação de branches. A integração com a API e o conjunto em `backend/testes-obrigatorios/` devem ser validados na etapa de Segurança, com os módulos implementados.

## Próximas entregas do responsável

1. Relacionar os casos aos requisitos e critérios de aceitação reais do grupo.
2. Preparar `docs/plano-de-testes.docx` a partir do [template do professor](../../guia/templates/Plano%20de%20Testes.docx).
3. Registrar data, executor, esperado, obtido e evidência a cada execução.
4. Abrir e acompanhar bugs com passos de reprodução.
5. Conferir os testes de cada módulo com seus responsáveis e registrar cobertura.
6. Conferir build e testes antes dos PRs para develop.

## Modelo de registro de bug

- Identificador e título:
- Rota, versão/commit e ambiente:
- Passos para reproduzir:
- Resultado esperado:
- Resultado obtido:
- Evidência:
- Responsável pela correção e situação:

Consulte a [organização das branches](../organizacao-das-branches.md) e as [evidências existentes](../evidencias/).
