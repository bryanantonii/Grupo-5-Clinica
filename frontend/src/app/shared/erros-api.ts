import { HttpErrorResponse } from '@angular/common/http';
export function mensagemDaApi(
  erro: unknown,
  padrao = 'Não foi possível conectar à clínica. Tente novamente.',
): string {
  if (erro instanceof HttpErrorResponse) {
    const corpo = erro.error as { message?: unknown } | null;
    if (Array.isArray(corpo?.message)) return corpo.message.join(' · ');
    if (typeof corpo?.message === 'string') return corpo.message;
    return erro.status === 403 ? 'Seu perfil não tem permissão para esta ação.' : padrao;
  }
  return erro instanceof Error ? erro.message : padrao;
}
