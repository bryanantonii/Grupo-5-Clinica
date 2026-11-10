# ADR 001 Referências entre os módulos da Clinora

Data do registro: 09/11/2026. Situação: decisão utilizada na implementação atual, registrada para a apresentação.

## Contexto

Especialidades é um cadastro compartilhado: uma mesma especialidade pode estar relacionada a vários profissionais. Pacientes, Profissionais e Consultas possuem ciclos próprios de cadastro e atualização.

## Decisão

Manter referências ObjectId entre os documentos dos módulos. Em Profissionais, o campo especialidade contém o ID do documento da coleção especialidades. O service busca a referência e confere a existência antes de gravar. Neste módulo, a busca é explícita no service de referências, sem depender de populate automático. MongoDB não impõe uma chave estrangeira relacional para esse campo.

## Justificativa

A referência mantém os dados comuns no cadastro responsável, evitando copiar nome, duração e valor de Especialidades em cada profissional. A alteração do cadastro central pode ser lida pelas telas que utilizam a referência. O identificador também permite consultas e agrupamentos entre módulos.

## Consequências

É necessário resolver o ID para apresentar o nome e validar vínculos na API. A exclusão lógica preserva os documentos de referência. Referenciar um documento não congela seus valores: quando for necessário preservar o valor histórico de um atendimento, deve-se definir quais campos serão registrados como uma cópia naquele evento.

## Alternativa considerada

Embutir os dados da especialidade em cada profissional facilitaria uma leitura isolada, mas duplicaria informações compartilhadas e exigiria cuidar de atualizações em várias cópias. Dados embutidos continuam sendo uma opção válida para dados próprios de um único documento ou para cópias históricas deliberadas. A decisão depende do uso de cada relação.

## Evidências no projeto

- [Schema de Profissionais](../../backend/src/profissionais/schemas/profissional.schema.ts).
- [Service de Profissionais](../../backend/src/profissionais/profissionais.service.ts).
- [Busca da referência de Especialidades](../../backend/src/profissionais/profissionais-especialidades.service.ts).
- [Contrato e dicionário](../aula-13/contrato-e-dicionario.md).
