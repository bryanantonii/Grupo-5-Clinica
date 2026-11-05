import { Routes } from '@angular/router';
import { PROFISSIONAIS_CONFIG } from './profissionais.config';
import { RegistroLista } from '../gestao/shared/registro-lista';
import { alteracoesPendentes, RegistroForm } from '../gestao/shared/registro-form';
export const PROFISSIONAIS_ROUTES: Routes = [
  {
    path: '',
    component: RegistroLista,
    data: { config: PROFISSIONAIS_CONFIG },
    title: 'Profissionais | Gestão Clinora',
  },
  {
    path: 'cadastrar',
    component: RegistroForm,
    data: { config: PROFISSIONAIS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Cadastrar profissional | Clinora',
  },
  {
    path: 'editar/:id',
    component: RegistroForm,
    data: { config: PROFISSIONAIS_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Editar profissional | Clinora',
  },
];
