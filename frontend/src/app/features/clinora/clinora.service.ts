import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PacienteAuthService } from '../../core/auth/paciente-auth.service';
import { RespostaApi } from '../../core/models/resposta-api';
import { mensagemDaApi } from '../../shared/erros-api';
import { ProfissionaisCatalogoService } from '../profissionais/services/profissionais-catalogo.service';
import { AgendamentoEntrada, Consulta } from './clinora.models';

/** Dados operacionais vêm da API; os sinais conservam somente o estado da tela. */
@Injectable({ providedIn: 'root' })
export class ClinoraService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(PacienteAuthService);
  private readonly catalogo = inject(ProfissionaisCatalogoService);
  private readonly url = environment.apiUrl + '/conta/consultas';
  readonly perfil = this.auth.usuario;
  readonly carregandoEquipe = this.catalogo.carregando;
  readonly erroEquipe = this.catalogo.erro;
  readonly carregandoConsultas = signal(false);
  readonly erroConsultas = signal('');
  private readonly registros = signal<Consulta[]>([]);
  private readonly dono = signal('');
  private leitura = 0;
  readonly consultas = computed(() =>
    this.dono() === this.auth.usuario()?._id ? this.registros() : [],
  );
  readonly ultimaConsulta = signal<Consulta | null>(null);
  readonly aviso = signal('');
  get especialidades() {
    return this.catalogo.especialidades();
  }
  get profissionais() {
    return this.catalogo.profissionais();
  }
  get convenios() {
    return this.catalogo.convenios();
  }
  carregarEquipe() {
    return this.catalogo.carregarEquipe();
  }
  especialidade(id: string) {
    return this.especialidades.find((e) => e._id === id)?.nome ?? 'Especialidade indisponível';
  }
  profissional(id: string) {
    return this.profissionais.find((p) => p._id === id);
  }
  nomeConvenio(id: string | null) {
    return this.convenios.find((c) => c._id === id)?.nome ?? 'Particular';
  }
  consulta(id: string) {
    return this.consultas().find((c) => c._id === id);
  }
  sair() {
    this.auth.sair();
    this.registros.set([]);
    this.dono.set('');
    this.ultimaConsulta.set(null);
  }
  horarios(profissional: string, data: string) {
    return this.http
      .get<RespostaApi<{ horarios: string[] }>>(environment.apiUrl + '/catalogo/horarios', {
        params: new HttpParams().set('profissional', profissional).set('data', data),
      })
      .pipe(map((r) => r.dados.horarios));
  }
  carregarCadastro() {
    return this.http
      .get<RespostaApi<{ dataNascimento: string; convenio: string | null; telefone: string }>>(
        this.url + '/cadastro',
      )
      .pipe(map((r) => r.dados));
  }
  carregarConsultas() {
    const id = this.auth.usuario()?._id ?? '';
    const leitura = ++this.leitura;
    this.carregandoConsultas.set(true);
    this.erroConsultas.set('');
    return this.http.get<RespostaApi<Consulta[]>>(this.url).pipe(
      tap((r) => {
        if (leitura === this.leitura && id === this.auth.usuario()?._id) {
          this.dono.set(id);
          this.registros.set(r.dados);
        }
      }),
      map(() => undefined),
      catchError((e: unknown) => {
        if (leitura === this.leitura) this.erroConsultas.set(mensagemDaApi(e));
        return of(undefined);
      }),
      finalize(() => {
        if (leitura === this.leitura) this.carregandoConsultas.set(false);
      }),
    );
  }
  carregarConsulta(id: string) {
    const usuario = this.auth.usuario()?._id;
    const leitura = ++this.leitura;
    this.carregandoConsultas.set(true);
    this.erroConsultas.set('');
    return this.http.get<RespostaApi<Consulta>>(this.url + '/' + encodeURIComponent(id)).pipe(
      tap((r) => {
        if (leitura === this.leitura && usuario === this.auth.usuario()?._id) this.guardar(r.dados);
      }),
      map((r) => r.dados),
      catchError((e: unknown) => {
        if (leitura === this.leitura) this.erroConsultas.set(mensagemDaApi(e));
        return of(null);
      }),
      finalize(() => {
        if (leitura === this.leitura) this.carregandoConsultas.set(false);
      }),
    );
  }
  agendar(dados: AgendamentoEntrada) {
    const usuario = this.auth.usuario()?._id;
    return this.http
      .post<RespostaApi<Consulta>>(this.url, {
        profissional: dados.profissional,
        especialidade: dados.especialidade,
        dataHora: dados.data + 'T' + dados.horario + ':00-03:00',
        dataNascimento: dados.dataNascimento,
        telefone: dados.telefone.trim(),
        convenio: dados.convenio || null,
        ciente: dados.ciente,
      })
      .pipe(
        map((r) => r.dados),
        tap((c) => {
          if (usuario === this.auth.usuario()?._id) {
            this.guardar(c);
            this.ultimaConsulta.set(c);
          }
        }),
      );
  }
  cancelar(id: string) {
    const usuario = this.auth.usuario()?._id;
    return this.http
      .patch<RespostaApi<Consulta>>(this.url + '/' + encodeURIComponent(id) + '/cancelar', {})
      .pipe(
        map((r) => r.dados),
        tap((c) => {
          if (usuario === this.auth.usuario()?._id) this.guardar(c);
        }),
      );
  }
  enviarContato(dados: { nome: string; email: string; assunto: string; mensagem: string }) {
    return this.http.post<RespostaApi<{ _id: string }>>(environment.apiUrl + '/contatos', dados);
  }
  private guardar(c: Consulta) {
    const dono = this.auth.usuario()?._id ?? '';
    const lista = this.dono() === dono ? this.registros() : [];
    this.dono.set(dono);
    this.registros.set(
      [...lista.filter((item) => item._id !== c._id), c].sort((a, b) =>
        b.dataHora.localeCompare(a.dataHora),
      ),
    );
  }
}
