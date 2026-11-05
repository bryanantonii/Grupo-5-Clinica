import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';

/** Prepara somente o .env local. Não mostra senhas nem segredos no terminal. */
function configurar() {
  const arquivo = resolve('.env');
  let conteudo = readFileSync(arquivo, 'utf8');
  const atual = parse(conteudo);
  const valores = {
    JWT_SECRET: randomBytes(48).toString('base64url'),
    SEED_ADMIN_NOME: 'Administrador Clinora',
    SEED_ADMIN_EMAIL: 'admin@clinora.example',
    SEED_ADMIN_SENHA: randomBytes(24).toString('base64url'),
  };
  let adicionados = 0;
  for (const [nome, valor] of Object.entries(valores)) {
    const existente = atual[nome]?.trim();
    if (
      existente &&
      (nome !== 'JWT_SECRET' ||
        (existente.length >= 32 && !existente.startsWith('troque-por-')))
    )
      continue;
    const linha = `${nome}=${valor}`;
    const padrao = new RegExp(`^${nome}=.*$`, 'm');
    conteudo = padrao.test(conteudo)
      ? conteudo.replace(padrao, linha)
      : conteudo.trimEnd() + '\n' + linha + '\n';
    adicionados++;
  }
  writeFileSync(arquivo, conteudo, 'utf8');
  console.log(
    `Ambiente de autenticação preparado; ${adicionados} variável(is) adicionada(s). Consulte o .env local para usar as credenciais do administrador.`,
  );
}

try {
  configurar();
} catch {
  console.error(
    'Não foi possível configurar. Prepare primeiro o .env do backend com a conexão do MongoDB.',
  );
  process.exitCode = 1;
}
