import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { map, Observable, timer } from 'rxjs';
import { idDe } from '../../../core/models/referencia';
import { Profissional, ProfissionalEntrada } from '../profissional.model';
import { ESPECIALIDADES_DEMO } from '../profissionais.dados';
import { criarFormularioProfissional } from '../profissional-form/profissional.validadores';
import {
  ErroProfissional,
  FiltroProfissionais,
  ProfissionaisService,
} from './profissionais.service';
import { ProfissionaisStore } from './profissionais.store';

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Simula operações assíncronas e regras do manual, sem acessar a API. */
@Injectable()
export class ProfissionaisMockService extends ProfissionaisService {
  private readonly store = inject(ProfissionaisStore);

  listar(filtro: FiltroProfissionais = {}): Observable<Profissional[]> {
    return this.responder(() =>
      this.store
        .profissionais()
        .filter(
          (p) =>
            (filtro.todos || p.ativo) &&
            (!filtro.especialidade || idDe(p.especialidade) === filtro.especialidade) &&
            normalizar(
              p.nome +
                ' ' +
                (ESPECIALIDADES_DEMO.find((e) => e._id === idDe(p.especialidade))?.nome ?? ''),
            ).includes(normalizar(filtro.busca?.trim() ?? '')),
        )
        .map((p) => ({ ...p })),
    );
  }

  buscarPorId(id: string): Observable<Profissional> {
    return this.responder(() => ({ ...this.encontrar(id) }));
  }

  especialidades() {
    return this.responder(() => ESPECIALIDADES_DEMO.map((e) => ({ _id: e._id, nome: e.nome })));
  }

  criar(dados: ProfissionalEntrada): Observable<Profissional> {
    return this.responder(() => {
      const entrada = this.validar(dados);
      const agora = new Date().toISOString();
      const novo: Profissional = {
        ...entrada,
        _id: crypto.randomUUID(),
        ativo: true,
        createdAt: agora,
        updatedAt: agora,
      };
      this.store.gravar([...this.store.profissionais(), novo]);
      return { ...novo };
    });
  }

  atualizar(id: string, dados: Partial<ProfissionalEntrada>): Observable<Profissional> {
    return this.responder(() => {
      const atual = this.encontrar(id);
      const entrada = this.validar(
        { ...atual, especialidade: idDe(atual.especialidade), ...dados },
        id,
      );
      const atualizado: Profissional = {
        ...atual,
        ...entrada,
        updatedAt: new Date().toISOString(),
      };
      this.store.gravar(this.store.profissionais().map((p) => (p._id === id ? atualizado : p)));
      return { ...atualizado };
    });
  }

  remover(id: string): Observable<void> {
    return this.responder(() => {
      const atual = this.encontrar(id);
      this.store.gravar(
        this.store
          .profissionais()
          .map((p) =>
            p._id === id ? { ...atual, ativo: false, updatedAt: new Date().toISOString() } : p,
          ),
      );
    });
  }

  private encontrar(id: string): Profissional {
    const profissional = this.store.profissionais().find((p) => p._id === id);
    if (!profissional)
      throw new Error(
        'Profissional não encontrado. Volte à listagem para escolher outro registro.',
      );
    return profissional;
  }

  private validar(dados: ProfissionalEntrada, id?: string): ProfissionalEntrada {
    const entrada: ProfissionalEntrada = {
      nome: dados.nome.trim(),
      registro: dados.registro.trim().toUpperCase(),
      especialidade: dados.especialidade,
      email: dados.email.trim().toLowerCase(),
      telefone: dados.telefone.trim(),
      ativo: dados.ativo ?? true,
    };
    const form = criarFormularioProfissional(new FormBuilder(), () => ESPECIALIDADES_DEMO);
    form.setValue({
      nome: entrada.nome,
      registro: entrada.registro,
      especialidade: entrada.especialidade,
      email: entrada.email,
      telefone: entrada.telefone,
    });
    if (form.invalid) {
      const campo = (
        Object.entries(form.controls) as [keyof typeof form.controls, AbstractControl][]
      ).find(([, control]) => control.invalid)?.[0];
      throw new ErroProfissional(
        'Confira os campos obrigatórios, o registro, a especialidade, o e-mail e o telefone.',
        campo,
      );
    }
    if (typeof entrada.ativo !== 'boolean')
      throw new ErroProfissional('O estado do profissional precisa ser válido.', 'ativo');
    const outros = this.store.profissionais().filter((p) => p._id !== id);
    if (outros.some((p) => p.registro.trim().toUpperCase() === entrada.registro))
      throw new ErroProfissional('Já existe um profissional com este registro.', 'registro');
    if (outros.some((p) => p.email.trim().toLowerCase() === entrada.email))
      throw new ErroProfissional('Já existe um profissional com este e-mail.', 'email');
    return entrada;
  }

  private responder<T>(operacao: () => T): Observable<T> {
    return timer(250).pipe(map(operacao));
  }
}
