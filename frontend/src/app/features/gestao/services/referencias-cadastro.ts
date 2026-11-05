import { Observable } from 'rxjs';
import { Modulo, Registro } from '../gestao.models';

/** Permite que um cadastro obtenha referências de outra fonte sem mudar o mock dos demais. */
export abstract class ReferenciasCadastro {
  registrarAtual(_item: Registro): void {}
  abstract carregar(): Observable<void>;
  abstract opcoes(modulo: Modulo, atual?: string): { id: string; nome: string }[];
  abstract nome(modulo: Modulo, id: string): string;
}
