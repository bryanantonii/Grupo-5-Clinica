const path = require('node:path');
const raiz = path.resolve(__dirname, '..');
process.chdir(raiz);
const resolver = require('./resolver-node.cjs');
const Resolver = require('jest-resolve').default;
// O bootstrap e os imports dos testes usam o resolvedor CJS do Node.
// O comando npm test e o CI continuam usando a configuração padrão do Jest.
Resolver.findNodeModule = (pedido, opcoes) => {
  try {
    return resolver(pedido, opcoes);
  } catch (erro) {
    if (opcoes.throwIfNotFound) throw erro;
    return null;
  }
};
require('jest').run(['--runInBand', '--resolver', path.join(__dirname, 'resolver-node.cjs'), ...process.argv.slice(2)]);
