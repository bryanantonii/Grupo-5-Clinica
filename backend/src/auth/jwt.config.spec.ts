import { ConfigService } from '@nestjs/config';
import { configurarJwt } from './jwt.config';

describe('Configuração do JWT', () => {
  it.each([
    undefined,
    '',
    'curto',
    'troque-por-um-texto-longo-e-aleatorio-com-pelo-menos-32-caracteres',
  ])('não inicia com segredo ausente ou de exemplo', (JWT_SECRET) => {
    expect(() => configurarJwt(new ConfigService({ JWT_SECRET }))).toThrow(
      'Configure JWT_SECRET',
    );
  });
  it('usa uma hora e restringe a assinatura a HS256', () => {
    const secret = 'teste-de-configuracao-sem-segredo-real'.repeat(2);
    expect(configurarJwt(new ConfigService({ JWT_SECRET: secret }))).toEqual({
      secret,
      signOptions: { expiresIn: '1h', algorithm: 'HS256' },
      verifyOptions: { algorithms: ['HS256'] },
    });
  });
});
