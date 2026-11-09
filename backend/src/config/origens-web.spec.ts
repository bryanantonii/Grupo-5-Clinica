import { origemWebPermitida } from './origens-web';

describe('Origem do frontend no navegador', () => {
  const desenvolvimento = { NODE_ENV: 'development' };
  it.each([
    'http://localhost:4200',
    'http://localhost:57246',
    'http://127.0.0.1:57246',
    'http://[::1]:4200',
    'https://localhost:4200',
    'http://localhost:4201',
  ])('permite o endereço local de desenvolvimento %s', (origem) => {
    expect(origemWebPermitida(origem, desenvolvimento)).toBe(true);
  });
  it.each([
    'https://site.example',
    'http://localhost.site.example:4200',
    'http://127.0.0.1.site.example',
    'null',
    'file:///C:/projeto/index.html',
    'http://localhost:57246/caminho',
    'http://usuario:senha@localhost:4200',
  ])('recusa uma origem externa ou malformada %s', (origem) => {
    expect(origemWebPermitida(origem, desenvolvimento)).toBe(false);
  });
  it('mantém a origem padrão exata em produção', () => {
    expect(
      origemWebPermitida('http://localhost:4200', { NODE_ENV: 'production' }),
    ).toBe(true);
    expect(
      origemWebPermitida('http://localhost:57246', { NODE_ENV: 'production' }),
    ).toBe(false);
  });
  it('em produção só permite a origem configurada, sem liberar outras portas locais', () => {
    const producao = {
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://clinora.example/portal',
    };
    expect(origemWebPermitida('https://clinora.example', producao)).toBe(true);
    expect(origemWebPermitida('https://clinora.example:444', producao)).toBe(
      false,
    );
    expect(origemWebPermitida('http://localhost:4200', producao)).toBe(false);
  });
  it('uma configuração inválida em produção não libera sites externos', () => {
    expect(
      origemWebPermitida('https://site.example', {
        NODE_ENV: 'production',
        FRONTEND_URL: 'invalida',
      }),
    ).toBe(false);
  });
  it('requisições sem Origin continuam funcionando para terminal e verificadores', () => {
    expect(origemWebPermitida(undefined, { NODE_ENV: 'production' })).toBe(
      true,
    );
  });
});
