import { BadRequestException, ConflictException } from '@nestjs/common';
export const TELEFONE = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
export function validarId(id: string): void {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new BadRequestException('ID inválido.');
}
export function escaparBusca(texto: string): string {
  return texto.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function traduzirDuplicidade(erro: unknown, mensagem: string): never {
  if (
    typeof erro === 'object' &&
    erro !== null &&
    'code' in erro &&
    erro.code === 11000
  )
    throw new ConflictException(mensagem);
  throw erro;
}
export const aparar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
export const emailNormalizado = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;
