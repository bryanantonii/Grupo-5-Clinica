// Alternativa CJS para laboratórios que bloqueiam a extensão nativa do Jest.
module.exports = (pedido, opcoes) => {
  const caminhos = [opcoes.basedir, ...(opcoes.paths || [])];
  try {
    return require.resolve(pedido, { paths: caminhos });
  } catch (original) {
    for (const extensao of opcoes.extensions || ['.js', '.json', '.ts']) {
      for (const candidato of [pedido + extensao, pedido + '/index' + extensao]) {
        try {
          return require.resolve(candidato, { paths: caminhos });
        } catch {
          // Tenta a próxima extensão da configuração do Jest.
        }
      }
    }
    throw original;
  }
};
