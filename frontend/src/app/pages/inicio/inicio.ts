import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClinoraService } from '../../features/clinora/clinora.service';
import { Icon } from '../../features/clinora/shared/icon';
import { ProfissionalCardDados } from '../../features/profissionais/profissional.model';
import { ProfissionalCard } from '../../features/profissionais/profissional-card/profissional-card';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, Icon, ProfissionalCard],
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly router = inject(Router);
  protected abrirPerfil(profissional: ProfissionalCardDados): void {
    void this.router.navigate(['/profissionais', profissional._id]);
  }
  protected readonly dados = inject(ClinoraService);
  protected readonly destaques = [
    {
      icone: 'calendar',
      titulo: 'Agendamento fácil',
      descricao: 'Escolha o melhor horário para você.',
    },
    {
      icone: 'stethoscope',
      titulo: 'Profissionais qualificados',
      descricao: 'Equipe experiente e especializada.',
    },
    {
      icone: 'shield',
      titulo: 'Convênios aceitos',
      descricao: 'Diversas opções para atender você.',
    },
    {
      icone: 'smartphone',
      titulo: 'Acesso em qualquer lugar',
      descricao: 'No computador e no celular.',
    },
  ];
  protected readonly destaqueAtivo = signal(0);
  protected readonly pausado = signal(false);
  protected readonly noCelular = signal(false);
  protected readonly reduzirMovimento = signal(false);
  private readonly faixa = viewChild<ElementRef<HTMLElement>>('faixaDestaques');
  private readonly destruir = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const elemento = this.faixa()?.nativeElement;
      if (!elemento) return;
      const celular = window.matchMedia('(max-width: 600px)');
      const movimento = window.matchMedia('(prefers-reduced-motion: reduce)');
      const atualizarTela = () => {
        this.noCelular.set(celular.matches);
        if (!celular.matches) elemento.scrollLeft = 0;
      };
      const atualizarMovimento = () => {
        this.reduzirMovimento.set(movimento.matches);
        if (movimento.matches) this.pausado.set(true);
      };
      atualizarTela();
      atualizarMovimento();
      celular.addEventListener('change', atualizarTela);
      movimento.addEventListener('change', atualizarMovimento);

      // A faixa só avança quando está visível e a pessoa não pausou a leitura.
      let visivel = false;
      const observador = new IntersectionObserver(
        ([entrada]) => {
          visivel = entrada.isIntersecting;
        },
        { threshold: 0.6 },
      );
      observador.observe(elemento);
      const intervalo = window.setInterval(() => {
        if (
          celular.matches &&
          !movimento.matches &&
          !this.pausado() &&
          visivel &&
          document.visibilityState === 'visible'
        ) {
          this.mostrarDestaque((this.destaqueAtivo() + 1) % this.destaques.length, false);
        }
      }, 4500);
      this.destruir.onDestroy(() => {
        window.clearInterval(intervalo);
        observador.disconnect();
        celular.removeEventListener('change', atualizarTela);
        movimento.removeEventListener('change', atualizarMovimento);
      });
    });
  }

  protected mostrarDestaque(indice: number, manual = true) {
    const faixa = this.faixa()?.nativeElement;
    const item = faixa?.children.item(indice) as HTMLElement | null;
    if (!faixa || !item) return;
    if (manual) this.pausado.set(true);
    const margem = parseFloat(getComputedStyle(faixa).paddingLeft);
    faixa.scrollTo({
      left:
        faixa.scrollLeft +
        item.getBoundingClientRect().left -
        faixa.getBoundingClientRect().left -
        margem,
      behavior: this.reduzirMovimento() ? 'instant' : 'smooth',
    });
  }

  protected atualizarDestaque() {
    const faixa = this.faixa()?.nativeElement;
    if (!faixa || !this.noCelular()) return;
    const inicio =
      faixa.getBoundingClientRect().left + parseFloat(getComputedStyle(faixa).paddingLeft);
    let maisProximo = 0;
    let menorDistancia = Infinity;
    Array.from(faixa.children).forEach((item, indice) => {
      const distancia = Math.abs(item.getBoundingClientRect().left - inicio);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        maisProximo = indice;
      }
    });
    this.destaqueAtivo.set(maisProximo);
  }

  protected navegarDestaque(direcao: number, evento: Event) {
    if (!this.noCelular()) return;
    evento.preventDefault();
    this.mostrarDestaque(
      (this.destaqueAtivo() + direcao + this.destaques.length) % this.destaques.length,
    );
  }
}
