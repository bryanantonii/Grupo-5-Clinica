import { Injectable, inject } from '@angular/core';
import { defer, delay, Observable, of } from 'rxjs';
import { DadosClinica, ROTULOS_STATUS, STATUS_CONSULTA } from '../gestao/gestao.models';
import { ClinicaMockStore } from '../gestao/services/clinica-mock.store';
export interface Relatorio {
  resumo: { pacientes: number; consultasMarcadas: number; faltas: number };
  porStatus: { nome: string; quantidade: number }[];
  porEspecialidade: { nome: string; quantidade: number }[];
}
/** Função pura para os agrupamentos do painel; não depende de HTTP ou do navegador. */
export function calcularRelatorio(dados: DadosClinica): Relatorio {
  const contagem = new Map<string, number>();
  for (const consulta of dados.consultas.filter((c) => c.status === 'realizada')) {
    const profissional = dados.profissionais.find((p) => p._id === consulta.profissional);
    const nome =
      dados.especialidades.find((e) => e._id === profissional?.especialidade)?.nome ??
      'Especialidade indisponível';
    contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
  }
  return {
    resumo: {
      pacientes: dados.pacientes.filter((p) => p.ativo).length,
      consultasMarcadas: dados.consultas.filter((c) => c.status === 'marcada').length,
      faltas: dados.consultas.filter((c) => c.status === 'falta').length,
    },
    porStatus: STATUS_CONSULTA.map((status) => ({
      nome: ROTULOS_STATUS[status],
      quantidade: dados.consultas.filter((c) => c.status === status).length,
    })),
    porEspecialidade: [...contagem]
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade),
  };
}
export abstract class RelatoriosService {
  abstract carregar(vazio?: boolean): Observable<Relatorio>;
  abstract simularFalha(): void;
}
@Injectable()
export class RelatoriosMockService extends RelatoriosService {
  private readonly store = inject(ClinicaMockStore);
  carregar(vazio = false) {
    return defer(() => {
      this.store.verificarFalha('relatorios');
      return of(
        calcularRelatorio(
          vazio
            ? { pacientes: [], profissionais: [], consultas: [], especialidades: [], convenios: [] }
            : this.store.snapshot(),
        ),
      );
    }).pipe(delay(650));
  }
  simularFalha() {
    this.store.simularFalha('relatorios');
  }
}
