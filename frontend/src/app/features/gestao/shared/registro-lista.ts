import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { Coluna, ModuloConfig } from '../modulo-config';
import { Registro, ROTULOS_STATUS, StatusConsulta, TRANSICOES } from '../gestao.models';
import { ClinicaMockStore } from '../services/clinica-mock.store';

@Component({
  selector: 'app-registro-lista',
  imports: [RouterLink],
  templateUrl: './registro-lista.html',
})
export class RegistroLista implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  readonly config = this.route.snapshot.data['config'] as ModuloConfig;
  private readonly servico = inject(this.config.servico);
  readonly store = inject(ClinicaMockStore);
  readonly itens = signal<Registro[]>([]);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly sucesso = signal(String(window.history.state?.['sucesso'] ?? ''));
  readonly busca = signal('');
  readonly statusFiltro = signal('');
  readonly inativos = signal(false);
  readonly selecionado = signal<Registro | null>(null);
  readonly processando = signal(false);
  readonly erroExclusao = signal('');
  readonly rotulosStatus = ROTULOS_STATUS;
  @ViewChild('confirmacao', { static: true }) private dialogo!: ElementRef<HTMLDialogElement>;
  private leitura?: Subscription;
  private operacao?: Subscription;
  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('simularErro') === '1') this.servico.simularFalha();
    this.carregar();
  }
  carregar() {
    this.leitura?.unsubscribe();
    this.carregando.set(true);
    this.erro.set('');
    this.leitura = this.servico
      .listar({
        busca: this.busca(),
        status: this.statusFiltro(),
        mostrarInativos: this.inativos(),
      })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (lista) => this.itens.set(lista),
        error: (e: Error) => this.erro.set(e.message),
      });
  }
  buscar(texto: string) {
    this.busca.set(texto);
    this.carregar();
  }
  limpar() {
    this.busca.set('');
    this.statusFiltro.set('');
    this.inativos.set(false);
    this.carregar();
  }
  formatar(item: Registro, coluna: Coluna): string {
    const valor = item[coluna.campo];
    if (coluna.referencia) return this.store.nomeReferencia(coluna.referencia, String(valor ?? ''));
    if (coluna.formato === 'data') {
      const d = new Date(`${valor}T12:00:00`);
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
    }
    if (coluna.formato === 'dataHora')
      return new Date(String(valor)).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    if (coluna.formato === 'moeda')
      return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (coluna.formato === 'percentual') return `${valor}%`;
    if (coluna.formato === 'situacao') return valor === false ? 'Inativo' : 'Ativo';
    if (coluna.formato === 'status') return ROTULOS_STATUS[valor as StatusConsulta];
    return String(valor ?? '—') || '—';
  }
  transicoes(item: Registro) {
    return this.config.modulo === 'consultas'
      ? TRANSICOES[item['status'] as StatusConsulta].filter((s) => s !== 'cancelada')
      : [];
  }
  editavel(item: Registro) {
    return (
      this.config.modulo !== 'consultas' ||
      ['marcada', 'confirmada'].includes(String(item['status']))
    );
  }
  excluivel(item: Registro) {
    return this.config.modulo === 'consultas' ? this.editavel(item) : item['ativo'] !== false;
  }
  nome(item: Registro) {
    return String(
      item['nome'] ??
        `${this.store.nomeReferencia('pacientes', String(item['paciente']))} em ${new Date(String(item['dataHora'])).toLocaleString('pt-BR')}`,
    );
  }
  pedirExclusao(item: Registro) {
    this.selecionado.set(item);
    this.erroExclusao.set('');
    this.dialogo.nativeElement.showModal();
  }
  fechar() {
    if (this.processando()) return;
    this.dialogo.nativeElement.close();
    this.selecionado.set(null);
  }
  confirmarExclusao() {
    const item = this.selecionado();
    if (!item || this.processando()) return;
    this.processando.set(true);
    this.erroExclusao.set('');
    this.operacao = this.servico
      .remover(item._id)
      .pipe(finalize(() => this.processando.set(false)))
      .subscribe({
        next: () => {
          this.dialogo.nativeElement.close();
          this.selecionado.set(null);
          this.sucesso.set(
            this.config.modulo === 'consultas'
              ? 'Consulta cancelada. O horário foi liberado.'
              : 'Cadastro inativado com sucesso.',
          );
          this.carregar();
        },
        error: (e: Error) => this.erroExclusao.set(e.message),
      });
  }
  mudarStatus(item: Registro, status: StatusConsulta) {
    if (this.processando()) return;
    this.processando.set(true);
    this.erro.set('');
    this.operacao = this.servico
      .mudarStatus(item._id, status)
      .pipe(finalize(() => this.processando.set(false)))
      .subscribe({
        next: () => {
          this.sucesso.set(`Status alterado para ${ROTULOS_STATUS[status].toLowerCase()}.`);
          this.carregar();
        },
        error: (e: Error) => this.erro.set(e.message),
      });
  }
  ngOnDestroy() {
    this.leitura?.unsubscribe();
    this.operacao?.unsubscribe();
  }
}
