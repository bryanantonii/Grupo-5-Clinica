import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinoraService } from '../../clinora/clinora.service';
import { Icon } from '../../clinora/shared/icon';
import { ProfissionalCard } from '../profissional-card/profissional-card';
import { ProfissionalCardDados } from '../profissional.model';

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Página smart: consulta dados, controla os filtros e trata o evento do filho. */
@Component({
  selector: 'app-profissionais-lista',
  imports: [ReactiveFormsModule, ProfissionalCard, Icon],
  templateUrl: './profissionais-lista.html',
})
export class ProfissionaisLista {
  private readonly router = inject(Router);
  protected readonly dados = inject(ClinoraService);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    busca: [''],
    especialidade: [''],
  });
  private readonly filtro = signal({ busca: '', especialidade: '' });
  protected readonly profissionais = computed(() => {
    const f = this.filtro();
    return this.dados.profissionais.filter(
      (p) =>
        p.ativo &&
        (!f.especialidade || p.especialidade === f.especialidade) &&
        normalizar(p.nome + ' ' + this.dados.especialidade(p.especialidade)).includes(
          normalizar(f.busca.trim()),
        ),
    );
  });
  protected abrirPerfil(profissional: ProfissionalCardDados): void {
    void this.router.navigate(['/profissionais', profissional._id]);
  }
  protected buscar() {
    this.filtro.set(this.form.getRawValue());
  }
  protected limpar() {
    this.form.reset();
    this.buscar();
  }
}
