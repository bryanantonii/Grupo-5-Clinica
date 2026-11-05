import { Injectable } from '@angular/core';
import { GestaoService } from '../../gestao/services/gestao.service';
import { ModuloMockService } from '../../gestao/services/modulo-mock.service';
export abstract class ProfissionaisService extends GestaoService {}
@Injectable()
export class ProfissionaisMockService extends ModuloMockService {
  protected readonly modulo = 'profissionais' as const;
}
