import { Injectable } from '@angular/core';
import { GestaoService } from '../../gestao/services/gestao.service';
import { ModuloMockService } from '../../gestao/services/modulo-mock.service';
export abstract class ConsultasService extends GestaoService {}
@Injectable()
export class ConsultasMockService extends ModuloMockService {
  protected readonly modulo = 'consultas' as const;
}
