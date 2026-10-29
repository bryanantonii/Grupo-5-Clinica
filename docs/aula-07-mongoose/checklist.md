# Checklist da atividade de Convênios

- [x] Branch convenios/schema-seed criada a partir da develop atualizada.
- [x] Módulo NestJS gerado pelo CLI e registrado no AppModule.
- [x] Schema Convenio com coleção explícita, tipos e validações.
- [x] Enum modalidade com individual e coletivo; padrão individual.
- [x] Padrão ativo true e timestamps habilitados.
- [x] Índices únicos para nome e ANS; índice composto por ativo e nome.
- [x] Registro do model por MongooseModule.forFeature.
- [x] Cinco exemplos no seed, incluindo quatro ativos e um inativo.
- [x] npm run seed executado no Atlas, banco clinora.
- [x] Repetição do seed sem duplicar ou modificar os registros existentes.
- [x] Verificação do model pelo Nest e de duplicidade E11000 no banco.
- [x] Atlas conferido com cinco documentos e quatro índices prontos.
- [x] 17 testes do schema e 8 de Produtos aprovados com resolvedor JS local.
- [x] Lint e build do backend e build do frontend aprovados.
- [x] Documentação de apoio, dicionário, evidências e roteiro preparados.
- [x] PR 5 aberto para develop pelo fork da conta ValentinadelosAngeles.
- [x] Compass 1.53.2 conferido com cinco documentos, filtros e quatro índices READY.
- [x] Execução padrão do backend e build do frontend aprovados na CI do PR.
- [ ] Revisão do campo modalidade pelo grupo e aceite do PO.
- [ ] Revisão do PR por outro integrante e merge na develop.

O .env local e a alteração anterior em frontend/angular.json foram mantidos fora dos commits. Não houve alteração nos módulos ou arquivos protegidos do professor. O seed do projeto passou a preservar os registros de exemplo existentes.
