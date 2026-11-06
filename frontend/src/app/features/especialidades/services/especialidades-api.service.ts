import { Injectable } from '@angular/core';
import { GestaoApiService } from '../../gestao/services/gestao-api.service';
import { EspecialidadesService } from './especialidades.service';
@Injectable()
export class EspecialidadesApiService extends GestaoApiService implements EspecialidadesService {
  protected readonly modulo = 'especialidades' as const;
}
