import { Injectable } from '@angular/core';
import { GestaoService } from '../../gestao/services/gestao.service';
import { ModuloMockService } from '../../gestao/services/modulo-mock.service';
export abstract class PacientesService extends GestaoService {}
@Injectable()
export class PacientesMockService extends ModuloMockService {
  protected readonly modulo = 'pacientes' as const;
}
