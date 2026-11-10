type AmbienteWeb = { NODE_ENV?: string; FRONTEND_URL?: string };

/** Libera as portas locais de desenvolvimento sem aceitar sites de terceiros. */
export function origemWebPermitida(
  origem: string | undefined,
  ambiente: AmbienteWeb = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
  },
): boolean {
  if (origem === undefined) return true;
  let url: URL;
  try {
    url = new URL(origem);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origem)
      return false;
  } catch {
    return false;
  }
  try {
    const frontend = new URL(
      ambiente.FRONTEND_URL?.trim() || 'http://localhost:4200',
    );
    if (
      ['http:', 'https:'].includes(frontend.protocol) &&
      url.origin === frontend.origin
    )
      return true;
  } catch {
    // Configuração inválida não concede acesso a origens externas.
  }
  if (ambiente.NODE_ENV === 'production') return false;
  return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}
