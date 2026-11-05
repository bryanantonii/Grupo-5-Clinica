import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Compila os testes com a ferramenta que já acompanha o Angular.
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requireAngular = createRequire(resolve(raiz, 'node_modules/@angular/build/package.json'));
const { build } = requireAngular('esbuild');
const arquivo = resolve(raiz, '.angular/testes-formularios/formularios.test.mjs');
await build({
  entryPoints: [resolve(raiz, 'tests/formularios.spec.ts')],
  outfile: arquivo,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  tsconfig: resolve(raiz, 'tsconfig.json'),
  logLevel: 'warning',
});
const resultado = spawnSync(process.execPath, ['--test', arquivo], { stdio: 'inherit', cwd: raiz });
process.exitCode = resultado.status ?? 1;
