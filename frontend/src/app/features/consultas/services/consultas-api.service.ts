import { map } from 'rxjs';
import { Injectable } from '@angular/core';
import { GestaoApiService } from '../../gestao/services/gestao-api.service';
import { ConsultasService } from './consultas.service';
@Injectable()
export class ConsultasApiService extends GestaoApiService implements ConsultasService {
  protected readonly modulo = 'consultas' as const;
  override remover(id: string) {
    return this.mudarStatus(id, 'cancelada').pipe(map(() => undefined));
  }
}
