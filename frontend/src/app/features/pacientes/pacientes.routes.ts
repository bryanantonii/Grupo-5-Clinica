import { Routes } from '@angular/router';
import { PACIENTES_CONFIG } from './pacientes.config';
import { RegistroLista } from '../gestao/shared/registro-lista';
import { alteracoesPendentes, RegistroForm } from '../gestao/shared/registro-form';
export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    component: RegistroLista,
    data: { config: PACIENTES_CONFIG },
    title: 'Pacientes | Gestão Clinora',
  },
  {
    path: 'cadastrar',
    component: RegistroForm,
    data: { config: PACIENTES_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Cadastrar paciente | Clinora',
  },
  {
    path: 'editar/:id',
    component: RegistroForm,
    data: { config: PACIENTES_CONFIG },
    canDeactivate: [alteracoesPendentes],
    title: 'Editar paciente | Clinora',
  },
];
