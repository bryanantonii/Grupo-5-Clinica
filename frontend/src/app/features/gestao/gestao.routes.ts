import { perfilGuard } from '../../core/auth/auth.guard';
import { Routes } from '@angular/router';
import { GestaoLayout } from './gestao-layout';
export const GESTAO_ROUTES: Routes = [
  {
    path: '',
    component: GestaoLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('./gestao-inicio').then((m) => m.GestaoInicio),
        data: { inicio: true },
        title: 'Visão geral | Gestão Clinora',
      },
      {
        path: 'pacientes',
        loadChildren: () => import('../pacientes/pacientes.routes').then((m) => m.PACIENTES_ROUTES),
      },
      {
        path: 'profissionais',
        loadChildren: () =>
          import('../profissionais/profissionais.routes').then((m) => m.PROFISSIONAIS_ROUTES),
      },
      {
        path: 'consultas',
        loadChildren: () => import('../consultas/consultas.routes').then((m) => m.CONSULTAS_ROUTES),
      },
      {
        path: 'especialidades',
        loadChildren: () =>
          import('../especialidades/especialidades.routes').then((m) => m.ESPECIALIDADES_ROUTES),
      },
      {
        path: 'convenios',
        loadChildren: () => import('../convenios/convenios.routes').then((m) => m.CONVENIOS_ROUTES),
      },
      {
        path: 'mensagens',
        loadComponent: () => import('../contatos/mensagens').then((m) => m.Mensagens),
        title: 'Mensagens | Gestão Clinora',
      },
      {
        path: 'usuarios',
        canActivate: [perfilGuard],
        data: { perfis: ['admin'] },
        loadComponent: () => import('../usuarios/usuarios').then((m) => m.Usuarios),
        title: 'Usuários | Gestão Clinora',
      },
      {
        path: 'relatorios',
        canActivate: [perfilGuard],
        data: { perfis: ['admin'] },
        loadComponent: () =>
          import('../relatorios/relatorios-painel').then((m) => m.RelatoriosPainel),
        title: 'Relatórios | Clinora',
      },
    ],
  },
];
