import { Routes } from '@angular/router';
import { ESPECIALIDADES_CONFIG } from './especialidades.config';
import { RegistroLista } from '../gestao/shared/registro-lista';
import { alteracoesPendentes, RegistroForm } from '../gestao/shared/registro-form';
export const ESPECIALIDADES_ROUTES: Routes = [
  {
    path: '',
    component: RegistroLista,
    data: { config: ESPECIALIDADES_CONFIG },
    title: 'Especialidades | Gestão Clinora',
  },
  {
    path: 'cadastrar',
    component: RegistroForm,
    data: { config: ESPECIALIDADES_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Cadastrar especialidade | Clinora',
  },
  {
    path: 'editar/:id',
    component: RegistroForm,
    data: { config: ESPECIALIDADES_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Editar especialidade | Clinora',
  },
];
