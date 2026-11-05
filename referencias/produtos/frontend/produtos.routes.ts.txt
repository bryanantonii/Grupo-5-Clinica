import { Routes } from '@angular/router';
import { ProdutoForm } from './produto-form/produto-form';
import { ProdutosLista } from './produtos-lista/produtos-lista';

export const PRODUTOS_ROUTES: Routes = [
  { path: '', component: ProdutosLista, title: 'Produtos' },
  { path: 'novo', component: ProdutoForm, title: 'Novo produto' },
  { path: ':id/editar', component: ProdutoForm, title: 'Editar produto' },
];
