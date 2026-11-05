import { Observable } from 'rxjs';
import { Categoria, Produto, ProdutoEntrada } from '../produto.model';

/**
 * CONTRATO do serviço de produtos.
 * Os componentes dependem só desta classe abstrata.
 * Quem decide se os dados vêm do mock ou da API é o app.config.ts.
 * Assim, trocar o mock pela API (aula 13) não exige mexer nos componentes.
 */
export abstract class ProdutosService {
  abstract listar(categoria?: Categoria): Observable<Produto[]>;
  abstract buscarPorId(id: string): Observable<Produto>;
  abstract criar(dados: ProdutoEntrada): Observable<Produto>;
  abstract atualizar(id: string, dados: Partial<ProdutoEntrada>): Observable<Produto>;
  abstract remover(id: string): Observable<void>;
}
