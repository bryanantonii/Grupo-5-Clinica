import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespostaApi } from '../../core/models/resposta-api';
import { mensagemDaApi } from '../../shared/erros-api';
interface Mensagem {
  _id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  situacao: 'nova' | 'lida';
  createdAt: string;
}
@Component({
  selector: 'app-mensagens',
  imports: [DatePipe],
  template:
    '<header class="c1-form-heading"><p class="eyebrow">Atendimento</p><h1>Mensagens recebidas</h1><p>Contatos enviados pelo site da clínica.</p></header>' +
    '<button type="button" class="btn btn-outline" [disabled]="carregando()" (click)="carregar()">Atualizar mensagens</button>' +
    '@if (erro()) { <p class="c1-feedback c1-error" role="alert">{{ erro() }}</p> }' +
    '@if (carregando()) { <p class="notice" role="status">Carregando mensagens...</p> } @else {' +
    '@for (m of mensagens(); track m._id) { <article class="panel"><div class="section-heading"><h2>{{ m.assunto }}</h2><span class="status">{{ m.situacao === "nova" ? "Nova" : "Lida" }}</span></div>' +
    '<p><strong>{{ m.nome }}</strong> · {{ m.email }}</p><p>{{ m.createdAt | date: "dd/MM/yyyy HH:mm" }}</p><p style="white-space: pre-wrap; overflow-wrap: anywhere">{{ m.mensagem }}</p>' +
    '@if (m.situacao === "nova") { <button type="button" class="btn btn-outline" [disabled]="ocupada() === m._id" (click)="ler(m._id)">Marcar como lida</button> }</article>' +
    '} @empty { @if (!erro()) { <div class="empty-state"><h2>Nenhuma mensagem recebida.</h2></div> } } }',
})
export class Mensagens {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/contatos';
  protected readonly mensagens = signal<Mensagem[]>([]);
  protected readonly carregando = signal(false);
  protected readonly ocupada = signal('');
  protected readonly erro = signal('');
  constructor() {
    this.carregar();
  }
  protected carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.http
      .get<RespostaApi<Mensagem[]>>(this.url)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (r) => this.mensagens.set(r.dados),
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
  }
  protected ler(id: string) {
    this.ocupada.set(id);
    this.erro.set('');
    this.http
      .patch<RespostaApi<Mensagem>>(this.url + '/' + id + '/leitura', { lida: true })
      .pipe(finalize(() => this.ocupada.set('')))
      .subscribe({
        next: (r) =>
          this.mensagens.update((lista) => lista.map((m) => (m._id === id ? r.dados : m))),
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
  }
}
