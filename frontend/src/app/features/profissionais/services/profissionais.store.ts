import { computed, Injectable, signal } from '@angular/core';
import { Profissional } from '../profissional.model';
import { paraCartao, PROFISSIONAIS_INICIAIS } from '../profissionais.dados';

/** Fonte única da demonstração para cadastro, perfis, início e agendamento. */
@Injectable({ providedIn: 'root' })
export class ProfissionaisStore {
  private readonly chave = 'clinora.profissionais';
  private readonly registros = signal<Profissional[]>(this.ler());
  readonly profissionais = this.registros.asReadonly();
  readonly cartoes = computed(() => this.registros().map(paraCartao));

  gravar(registros: Profissional[]): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem(this.chave, JSON.stringify(registros));
      } catch {
        throw new Error(
          'Não foi possível salvar nesta aba. Verifique a permissão de armazenamento do navegador e tente novamente.',
        );
      }
    }
    this.registros.set(registros.map((p) => ({ ...p })));
  }

  private ler(): Profissional[] {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const salvo: unknown = JSON.parse(sessionStorage.getItem(this.chave) ?? 'null');
        if (
          Array.isArray(salvo) &&
          salvo.every(
            (p) =>
              p &&
              typeof p._id === 'string' &&
              typeof p.nome === 'string' &&
              typeof p.registro === 'string' &&
              typeof p.especialidade === 'string' &&
              typeof p.email === 'string' &&
              typeof p.telefone === 'string' &&
              typeof p.ativo === 'boolean',
          )
        )
          return salvo;
      }
    } catch {
      // Sem dados válidos de sessão, abre a demonstração inicial.
    }
    return PROFISSIONAIS_INICIAIS.map((p) => ({ ...p }));
  }
}
