import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, forkJoin, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RespostaApi } from '../../../core/models/resposta-api';
import { Especialidade } from '../../clinora/clinora.models';
import { Modulo, normalizar, Registro } from '../../gestao/gestao.models';
import { ReferenciasCadastro } from '../../gestao/services/referencias-cadastro';
import { ProfissionalCardDados } from '../profissional.model';
import { ProfissionaisService } from './profissionais.service';

interface Opcao {
  _id: string;
  nome: string;
}

/** Catálogo da API separado dos outros módulos, que continuam em demonstração. */
@Injectable({ providedIn: 'root' })
export class ProfissionaisCatalogoService extends ReferenciasCadastro {
  private readonly http = inject(HttpClient);
  private readonly service = inject(ProfissionaisService);
  private readonly registros = signal<Registro[]>([]);
  readonly especialidades = signal<Especialidade[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly profissionais = computed<ProfissionalCardDados[]>(() =>
    this.registros()
      .filter((p) => p['ativo'] !== false)
      .map((p) => {
        const nome = String(p['nome']);
        return {
          _id: p._id,
          nome,
          registro: String(p['registro']),
          especialidade: String(p['especialidade']),
          email: String(p['email']),
          telefone: String(p['telefone']),
          ativo: p['ativo'] === true,
          iniciais: nome
            .replace(/^(Dr\.?|Dra\.?)\s+/i, '')
            .split(/\s+/)
            .slice(0, 2)
            .map((s) => s[0])
            .join(''),
          descricao: 'Atendimento com escuta, cuidado e atenção.',
          titulo: 'Cuidado próximo para a sua saúde.',
        };
      }),
  );

  carregar(): Observable<void> {
    return this.http
      .get<RespostaApi<Opcao[]>>(environment.apiUrl + '/profissionais/opcoes/especialidades')
      .pipe(
        tap((r) =>
          this.especialidades.set(
            r.dados.map((e) => ({
              ...e,
              descricao: 'Cuidado e orientação para a sua saúde.',
              icone: normalizar(e.nome).includes('cardio')
                ? 'heart'
                : normalizar(e.nome).includes('dermato')
                  ? 'sparkles'
                  : 'stethoscope',
            })),
          ),
        ),
        map(() => undefined),
        catchError(() =>
          throwError(
            () => new Error('Não foi possível carregar as especialidades da API. Tente novamente.'),
          ),
        ),
      );
  }
  carregarEquipe(): Observable<void> {
    this.carregando.set(true);
    this.erro.set('');
    return forkJoin({ lista: this.service.listar(), opcoes: this.carregar() }).pipe(
      tap(({ lista }) => this.registros.set(lista)),
      map(() => undefined),
      catchError((e: Error) => {
        this.erro.set(e.message);
        return of(undefined);
      }),
      finalize(() => this.carregando.set(false)),
    );
  }
  override registrarAtual(item: Registro): void {
    const id = String(item['especialidade'] ?? '');
    if (id && !this.especialidades().some((e) => e._id === id)) {
      this.especialidades.update((lista) => [
        ...lista,
        {
          _id: id,
          nome: String(item['nomeEspecialidade'] ?? 'Especialidade atual') + ' (inativa)',
          descricao: '',
          icone: 'stethoscope',
        },
      ]);
    }
  }
  opcoes(modulo: Modulo): { id: string; nome: string }[] {
    return modulo === 'especialidades'
      ? this.especialidades().map((e) => ({ id: e._id, nome: e.nome }))
      : [];
  }
  nome(modulo: Modulo, id: string): string {
    return this.opcoes(modulo).find((e) => e.id === id)?.nome ?? 'Cadastro indisponível';
  }
}
