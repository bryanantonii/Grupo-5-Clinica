import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requireAngular = createRequire(resolve(raiz, 'node_modules/@angular/build/package.json'));
const { build } = requireAngular('esbuild');
const arquivo = resolve(raiz, '.angular/testes-rotas/rotas.test.mjs');
await build({
  entryPoints: [resolve(raiz, 'tests/rotas.spec.ts')],
  outfile: arquivo,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  tsconfig: resolve(raiz, 'tsconfig.json'),
  logLevel: 'warning',
  plugins: [
    {
      name: 'recursos-dos-componentes',
      setup(builder) {
        // O Router carrega os componentes reais sem iniciar um navegador.
        builder.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
          if (!path.startsWith(resolve(raiz, 'src'))) return;
          let codigo = await readFile(path, 'utf8');
          for (const [opcao, propriedade] of [
            ['templateUrl', 'template'],
            ['styleUrl', 'styles'],
          ]) {
            const regex = new RegExp(`${opcao}:\\s*(['"])([^'"]+)\\1`, 'g');
            const recursos = [...codigo.matchAll(regex)];
            for (const recurso of recursos) {
              const conteudo = JSON.stringify(
                await readFile(resolve(dirname(path), recurso[2]), 'utf8'),
              );
              codigo = codigo.replace(
                recurso[0],
                `${propriedade}: ${opcao === 'styleUrl' ? '[' + conteudo + ']' : conteudo}`,
              );
            }
          }
          return { contents: codigo, loader: 'ts', resolveDir: dirname(path) };
        });
      },
    },
  ],
});
const resultado = spawnSync(process.execPath, ['--test', arquivo], { stdio: 'inherit', cwd: raiz });
process.exitCode = resultado.status ?? 1;
