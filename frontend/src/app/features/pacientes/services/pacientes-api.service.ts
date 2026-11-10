import { Injectable } from '@angular/core';
import { GestaoApiService } from '../../gestao/services/gestao-api.service';
import { PacientesService } from './pacientes.service';
@Injectable()
export class PacientesApiService extends GestaoApiService implements PacientesService {
  protected readonly modulo = 'pacientes' as const;
}
