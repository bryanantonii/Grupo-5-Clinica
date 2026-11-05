import { Routes } from '@angular/router';
import { CONVENIOS_CONFIG } from './convenios.config';
import { RegistroLista } from '../gestao/shared/registro-lista';
import { alteracoesPendentes, RegistroForm } from '../gestao/shared/registro-form';
export const CONVENIOS_ROUTES: Routes = [
  {
    path: '',
    component: RegistroLista,
    data: { config: CONVENIOS_CONFIG },
    title: 'Convênios | Gestão Clinora',
  },
  {
    path: 'cadastrar',
    component: RegistroForm,
    data: { config: CONVENIOS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Cadastrar convênio | Clinora',
  },
  {
    path: 'editar/:id',
    component: RegistroForm,
    data: { config: CONVENIOS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Editar convênio | Clinora',
  },
];
