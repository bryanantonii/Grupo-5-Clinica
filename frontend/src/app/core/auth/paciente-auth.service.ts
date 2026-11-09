import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespostaApi } from '../models/resposta-api';

export interface ContaPaciente {
  _id: string;
  nome: string;
  email: string;
  perfil: 'paciente';
  telefone: string;
}
interface SessaoPaciente {
  accessToken: string;
  usuario: ContaPaciente;
}
const CHAVE = 'clinora.paciente.auth.v1';

export function tokenPacienteVigente(token: string): string | null {
  try {
    const partes = token.split('.');
    if (partes.length !== 3) return null;
    const base = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const p = JSON.parse(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')));
    return p.perfil === 'paciente' &&
      typeof p.sub === 'string' &&
      /^[a-f\d]{24}$/i.test(p.sub) &&
      typeof p.exp === 'number' &&
      p.exp * 1000 > Date.now()
      ? p.sub
      : null;
  } catch {
    return null;
  }
}

export function retornoPacienteSeguro(url: string | null): string {
  return url &&
    !url.includes(String.fromCharCode(92)) &&
    /^\/(?:agendar|agendamento-concluido|minha-area|meus-dados|consultas(?:\/[^/?#]+(?:\/cancelar)?)?|dados-atualizados|consulta-cancelada)(?:[?#].*)?$/.test(
      url,
    )
    ? url
    : '/minha-area';
}

@Injectable({ providedIn: 'root' })
export class PacienteAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly sessao = signal<SessaoPaciente | null>(this.restaurar());
  readonly usuario = computed(() => this.sessao()?.usuario ?? null);
  readonly aviso = signal('');

  token(): string | null {
    const s = this.sessao();
    return s && tokenPacienteVigente(s.accessToken) ? s.accessToken : null;
  }
  pertenceASessao(token: string | null): boolean {
    return this.sessao()?.accessToken === token || (!token && !this.token());
  }
  cadastrar(nome: string, email: string, senha: string) {
    return this.http
      .post<RespostaApi<SessaoPaciente>>(environment.apiUrl + '/auth/cadastro-paciente', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha,
      })
      .pipe(tap(({ dados }) => this.guardar(dados)));
  }
  entrar(email: string, senha: string) {
    return this.http
      .post<RespostaApi<SessaoPaciente>>(environment.apiUrl + '/auth/login-paciente', {
        email: email.trim().toLowerCase(),
        senha,
      })
      .pipe(tap(({ dados }) => this.guardar(dados)));
  }
  carregar() {
    const token = this.token();
    return this.http.get<RespostaApi<ContaPaciente>>(environment.apiUrl + '/conta').pipe(
      map(({ dados }) => {
        if (!token || !this.pertenceASessao(token))
          throw new Error('A sessão mudou. Entre novamente.');
        this.guardar({ accessToken: token, usuario: dados });
        return dados;
      }),
    );
  }
  atualizar(dados: Pick<ContaPaciente, 'nome' | 'email' | 'telefone'>) {
    const token = this.token();
    return this.http
      .patch<RespostaApi<ContaPaciente>>(environment.apiUrl + '/conta', {
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone.trim(),
      })
      .pipe(
        map(({ dados: usuario }) => {
          if (!token || !this.pertenceASessao(token))
            throw new Error('A sessão mudou. Entre novamente.');
          this.guardar({ accessToken: token, usuario });
          return usuario;
        }),
      );
  }
  recuperar(email: string) {
    return this.http.post<RespostaApi<{ mensagem: string }>>(
      environment.apiUrl + '/auth/recuperar-acesso',
      { email: email.trim().toLowerCase() },
    );
  }
  redefinir(token: string, senha: string) {
    return this.http.post<RespostaApi<{ mensagem: string }>>(
      environment.apiUrl + '/auth/redefinir-senha',
      { token, senha },
    );
  }
  sair(expirada = false) {
    this.sessao.set(null);
    try {
      sessionStorage.removeItem(CHAVE);
    } catch {
      /* A sessão em memória foi encerrada. */
    }
    if (expirada)
      void this.router.navigate(['/entrar'], {
        queryParams: { expirada: 1, retorno: retornoPacienteSeguro(this.router.url) },
      });
  }
  private validar(s: SessaoPaciente): boolean {
    return (
      !!s &&
      typeof s.accessToken === 'string' &&
      !!s.usuario &&
      s.usuario.perfil === 'paciente' &&
      tokenPacienteVigente(s.accessToken) === s.usuario._id &&
      typeof s.usuario.nome === 'string' &&
      typeof s.usuario.email === 'string' &&
      typeof s.usuario.telefone === 'string'
    );
  }
  private guardar(s: SessaoPaciente) {
    if (!this.validar(s)) throw new Error('A clínica retornou uma sessão inválida.');
    // Seleciona campos para nunca guardar a senha ou o hash no navegador.
    const { _id, nome, email, perfil, telefone } = s.usuario;
    const seguro = { accessToken: s.accessToken, usuario: { _id, nome, email, perfil, telefone } };
    this.sessao.set(seguro);
    this.aviso.set('');
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(seguro));
    } catch {
      this.aviso.set('A sessão será mantida somente enquanto esta página estiver aberta.');
    }
  }
  private restaurar(): SessaoPaciente | null {
    try {
      const s = JSON.parse(sessionStorage.getItem(CHAVE) ?? 'null') as SessaoPaciente | null;
      if (s && this.validar(s)) return s;
      sessionStorage.removeItem(CHAVE);
    } catch {
      /* Cache antigo ou inválido não autentica um paciente. */
    }
    return null;
  }
}
