export const environment = {
  // Endereço da API NestJS
  apiUrl: 'http://localhost:3000/api/v1',

  // true  = usa os serviços MOCK (dados em memória, aulas 02 a 12)
  // false = usa os serviços que chamam a API de verdade (a partir da aula 13)
  usarMock: true,

  // Integra somente Profissionais; os demais módulos mantêm seus mocks.
  usarMockProfissionais: false,
};
