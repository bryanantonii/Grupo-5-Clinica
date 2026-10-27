import { Injectable } from '@angular/core';
import { GestaoService } from '../../gestao/services/gestao.service';
import { ModuloMockService } from '../../gestao/services/modulo-mock.service';
export abstract class EspecialidadesService extends GestaoService {}
@Injectable()
export class EspecialidadesMockService extends ModuloMockService {
  protected readonly modulo = 'especialidades' as const;
}
