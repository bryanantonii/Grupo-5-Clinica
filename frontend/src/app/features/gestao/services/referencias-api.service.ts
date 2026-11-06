import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaApi } from '../../../core/models/resposta-api';
import { Modulo, Registro } from '../gestao.models';
import { ReferenciasCadastro } from './referencias-cadastro';
const RECURSOS = ['pacientes', 'profissionais', 'especialidades', 'convenios'] as const;
@Injectable({ providedIn: 'root' })
export class ReferenciasApiService extends ReferenciasCadastro {
  private readonly http = inject(HttpClient);
  private readonly dados = signal<Partial<Record<Modulo, Registro[]>>>({});
  carregar() {
    return forkJoin(
      RECURSOS.map((modulo) =>
        this.http
          .get<RespostaApi<Registro[]>>(environment.apiUrl + '/' + modulo, {
            params: { todos: 'true' },
          })
          .pipe(map((r) => [modulo, r.dados] as const)),
      ),
    ).pipe(
      map((listas) => {
        this.dados.set(Object.fromEntries(listas));
      }),
      catchError(() =>
        throwError(
          () => new Error('Não foi possível carregar as referências da clínica. Tente novamente.'),
        ),
      ),
    );
  }
  opcoes(modulo: Modulo, atual?: string) {
    return (this.dados()[modulo] ?? [])
      .filter((item) => item['ativo'] !== false || item._id === atual)
      .map((item) => ({
        id: item._id,
        nome: String(item['nome']) + (item['ativo'] === false ? ' (inativo)' : ''),
      }));
  }
  nome(modulo: Modulo, id: string) {
    return id
      ? String(
          this.dados()[modulo]?.find((item) => item._id === id)?.['nome'] ??
            'Cadastro indisponível',
        )
      : 'Particular';
  }
}
