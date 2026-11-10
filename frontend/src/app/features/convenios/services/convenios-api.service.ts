import { Injectable } from '@angular/core';
import { GestaoApiService } from '../../gestao/services/gestao-api.service';
import { ConveniosService } from './convenios.service';
@Injectable()
export class ConveniosApiService extends GestaoApiService implements ConveniosService {
  protected readonly modulo = 'convenios' as const;
}
