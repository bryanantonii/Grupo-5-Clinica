import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CATEGORIAS, Categoria, ProdutoEntrada } from '../produto.model';
import { ProdutosService } from '../services/produtos.service';

/**
 * Formulário reativo de cadastro e edição (PDF 02, cap. 7).
 * As mesmas regras do DTO do back-end são validadas aqui para dar
 * feedback rápido ao usuário — mas quem garante é a API.
 */
@Component({
  selector: 'app-produto-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './produto-form.html',
})
export class ProdutoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly produtosService = inject(ProdutosService);

  /** Vem da rota :id/editar (withComponentInputBinding). Vazio = cadastro. */
  readonly id = input<string>();

  protected readonly categorias = CATEGORIAS;
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    descricao: ['', [Validators.maxLength(300)]],
    preco: [0, [Validators.required, Validators.min(0)]],
    estoque: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    categoria: ['' as Categoria | '', [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.produtosService.buscarPorId(id).subscribe({
        next: (p) => this.form.patchValue(p),
        error: (e: Error) => this.erro.set(e.message),
      });
    }
  }

  /** Mostra o erro só depois que o usuário mexeu no campo (touched). */
  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    this.erro.set(null);

    const dados = this.form.getRawValue() as ProdutoEntrada;
    const id = this.id();
    const operacao = id ? this.produtosService.atualizar(id, dados) : this.produtosService.criar(dados);

    operacao.subscribe({
      next: () => this.router.navigate(['/produtos']),
      error: (e: Error) => {
        this.erro.set(e.message);
        this.salvando.set(false);
      },
    });
  }
}
