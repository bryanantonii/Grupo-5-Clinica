import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespostaApi } from '../../core/models/resposta-api';
import { ROTULOS_STATUS, STATUS_CONSULTA } from '../gestao/gestao.models';
import { Relatorio, RelatoriosService } from './relatorios.service';
@Injectable()
export class RelatoriosApiService extends RelatoriosService {
  private readonly http = inject(HttpClient);
  private falhar = false;
  carregar() {
    if (this.falhar) {
      this.falhar = false;
      return throwError(() => new Error('Falha simulada. Tente novamente.'));
    }
    return forkJoin({
      resumo: this.http.get<RespostaApi<Relatorio['resumo']>>(
        environment.apiUrl + '/relatorios/resumo',
      ),
      status: this.http.get<RespostaApi<{ _id: string; quantidade: number }[]>>(
        environment.apiUrl + '/relatorios/consultas-por-status',
      ),
      especialidade: this.http.get<RespostaApi<{ especialidade: string; quantidade: number }[]>>(
        environment.apiUrl + '/relatorios/consultas-por-especialidade',
      ),
    }).pipe(
      map(({ resumo, status, especialidade }) => ({
        resumo: resumo.dados,
        porStatus: STATUS_CONSULTA.map((s) => ({
          nome: ROTULOS_STATUS[s],
          quantidade: status.dados.find((item) => item._id === s)?.quantidade ?? 0,
        })),
        porEspecialidade: especialidade.dados.map((item) => ({
          nome: item.especialidade,
          quantidade: item.quantidade,
        })),
      })),
      catchError(() =>
        throwError(
          () => new Error('Não foi possível consultar os relatórios da clínica. Tente novamente.'),
        ),
      ),
    );
  }
  simularFalha() {
    this.falhar = true;
  }
}
