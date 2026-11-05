import { inject } from '@angular/core';
import { defer, delay, Observable, of } from 'rxjs';
import { Filtro, Modulo, Registro, StatusConsulta, ValorCampo } from '../gestao.models';
import { ClinicaMockStore } from './clinica-mock.store';
import { GestaoService } from './gestao.service';

/** Implementação comum dos mocks: mesma API, atraso e erros observáveis. */
export abstract class ModuloMockService extends GestaoService {
  protected readonly store = inject(ClinicaMockStore);
  protected abstract readonly modulo: Modulo;
  private resposta<T>(operacao: () => T): Observable<T> {
    return defer(() => of(operacao())).pipe(delay(650));
  }
  listar(filtro?: Filtro) {
    return this.resposta(() => this.store.listar(this.modulo, filtro));
  }
  buscarPorId(id: string) {
    return this.resposta(() => this.store.buscar(this.modulo, id));
  }
  criar(dados: Record<string, ValorCampo>) {
    return this.resposta(() => this.store.salvar(this.modulo, dados));
  }
  atualizar(id: string, dados: Record<string, ValorCampo>) {
    return this.resposta(() => this.store.salvar(this.modulo, dados, id));
  }
  remover(id: string) {
    return this.resposta(() => this.store.remover(this.modulo, id));
  }
  mudarStatus(id: string, status: StatusConsulta): Observable<Registro> {
    return this.resposta(() => this.store.mudarStatus(id, status));
  }
  simularFalha() {
    this.store.simularFalha(this.modulo);
  }
}
