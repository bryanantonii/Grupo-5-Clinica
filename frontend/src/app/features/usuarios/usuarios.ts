import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespostaApi } from '../../core/models/resposta-api';
import { mensagemDaApi } from '../../shared/erros-api';
import { senhasIguais, textoAparado } from '../../shared/form-validadores';
interface Conta {
  _id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
}
interface Cadastro {
  _id: string;
  nome: string;
  email: string;
  usuario?: string;
}
@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/usuarios';
  protected readonly contas = signal<Conta[]>([]);
  protected readonly pacientes = signal<Cadastro[]>([]);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly sucesso = signal('');
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group(
    {
      nome: ['', [Validators.required, textoAparado(3, 80)]],
      email: ['', [Validators.required, Validators.email]],
      senha: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          (c: { value: string }) =>
            new TextEncoder().encode(c.value).length > 72 ? { limite: true } : null,
        ],
      ],
      confirmar: ['', Validators.required],
    },
    { validators: senhasIguais },
  );
  protected readonly vinculo = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    paciente: ['', Validators.required],
  });
  constructor() {
    this.carregar();
  }
  protected carregar() {
    this.carregando.set(true);
    this.erro.set('');
    forkJoin({
      contas: this.http.get<RespostaApi<Conta[]>>(this.url),
      pacientes: this.http.get<RespostaApi<Cadastro[]>>(environment.apiUrl + '/pacientes'),
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (r) => {
          this.contas.set(r.contas.dados);
          this.pacientes.set(r.pacientes.dados);
        },
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
  }
  protected contasPacientes() {
    return this.contas().filter((c) => c.perfil === 'paciente' && c.ativo);
  }
  protected opcoesPaciente() {
    const conta = this.contas().find((c) => c._id === this.vinculo.controls.usuario.value);
    return this.pacientes().filter(
      (p) => p.email === conta?.email && (!p.usuario || p.usuario === conta._id),
    );
  }
  protected invalido(campo: 'nome' | 'email' | 'senha' | 'confirmar') {
    const c = this.form.controls[campo];
    return c.touched && c.invalid;
  }
  protected criar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set('');
    const { nome, email, senha } = this.form.getRawValue();
    this.http
      .post<RespostaApi<Conta>>(this.url, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.sucesso.set('Atendente cadastrado. Ele já pode entrar com a senha informada.');
          this.carregar();
        },
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
  }
  protected vincular() {
    if (this.vinculo.invalid || this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set('');
    const v = this.vinculo.getRawValue();
    this.http
      .patch(this.url + '/' + v.usuario + '/paciente', { paciente: v.paciente })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => {
          this.sucesso.set('Cadastro vinculado à conta do paciente.');
          this.vinculo.reset();
          this.carregar();
        },
        error: (e: unknown) => this.erro.set(mensagemDaApi(e)),
      });
  }
}
