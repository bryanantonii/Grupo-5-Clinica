import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export function configurarJwt(config: ConfigService): JwtModuleOptions {
  const secret = config.get<string>('JWT_SECRET');
  if (!secret || secret.length < 32 || secret.startsWith('troque-por-'))
    throw new Error(
      'Configure JWT_SECRET no .env com um segredo aleatório de pelo menos 32 caracteres.',
    );
  return {
    secret,
    signOptions: { expiresIn: '1h', algorithm: 'HS256' },
    verifyOptions: { algorithms: ['HS256'] },
  };
}
