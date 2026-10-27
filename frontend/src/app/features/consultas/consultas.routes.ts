import { Routes } from '@angular/router';
import { CONSULTAS_CONFIG } from './consultas.config';
import { RegistroLista } from '../gestao/shared/registro-lista';
import { alteracoesPendentes, RegistroForm } from '../gestao/shared/registro-form';
export const CONSULTAS_ROUTES: Routes = [
  {
    path: '',
    component: RegistroLista,
    data: { config: CONSULTAS_CONFIG },
    title: 'Consultas | Gestão Clinora',
  },
  {
    path: 'cadastrar',
    component: RegistroForm,
    data: { config: CONSULTAS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Cadastrar consulta | Clinora',
  },
  {
    path: 'editar/:id',
    component: RegistroForm,
    data: { config: CONSULTAS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Editar consulta | Clinora',
  },
];
