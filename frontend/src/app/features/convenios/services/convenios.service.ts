import { Injectable } from '@angular/core';
import { GestaoService } from '../../gestao/services/gestao.service';
import { ModuloMockService } from '../../gestao/services/modulo-mock.service';
export abstract class ConveniosService extends GestaoService {}
@Injectable()
export class ConveniosMockService extends ModuloMockService {
  protected readonly modulo = 'convenios' as const;
}
