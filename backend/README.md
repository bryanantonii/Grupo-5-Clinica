# Back-end — API NestJS

Instruções completas no [README principal](../README.md).

A aplicação registra apenas módulos da clínica. O exemplo Produtos continua no
código para consulta, mas não expõe rotas nem participa do seed. A análise dos
cadastros, do que já está no MongoDB e das próximas integrações está em
[Banco da Clinora](../docs/banco-clinica-2026-11-05.md).

| Comando | O que faz |
| --- | --- |
| `npm run start:dev` | Sobe a API com recarga automática (porta 3000) |
| `npm run seed` | Insere exemplos ausentes de Convênios, Especialidades e Profissionais, preservando os cadastros existentes |
| `npm run seed:profissionais` | Confere os exemplos de Profissionais e suas Especialidades |
| `npm run verificar:seed:clinica` | Confere o seed duas vezes em um banco temporário, sem alterar o banco da clínica |
| `npm test` | Roda os testes unitários (Jest) |
| `npm run test:cov` | Testes com relatório de cobertura |
| `npm run lint` | Verifica e corrige o padrão do código |

## Convênios com Mongoose

O módulo E está em src/convenios. O schema registra os campos do guia, o enum modalidade (individual ou coletivo), valores padrão, índices e timestamps. A inclusão de modalidade foi confirmada na atividade e está documentada para revisão do grupo.

Com MONGODB_URI configurada no .env local, execute npm run seed e npm run verificar:convenios. O seed insere exemplos ausentes sem apagar ou sobrescrever os existentes. O verificador obtém o model pelo Nest, confere os cinco exemplos e os timestamps e tenta uma duplicidade que deve ser rejeitada com E11000.

A documentação, o dicionário e o roteiro de apresentação estão em ../docs/aula-07-mongoose. Esta etapa não implementa controller HTTP, autenticação ou integração das telas Angular com o banco.
