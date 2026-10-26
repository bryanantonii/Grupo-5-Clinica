import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Inicio } from './pages/inicio/inicio';
import { ClinoraService } from './features/clinora/clinora.service';
// Guarda de navegação para a demonstração. A autorização real deve existir na API.
const sessaoDemo: CanActivateFn = (_, state) =>
  inject(ClinoraService).perfil()
    ? true
    : inject(Router).createUrlTree(['/entrar'], { queryParams: { retorno: state.url } });
const resultado = () => import('./features/clinora/resultado').then((m) => m.Resultado);
const acesso = () => import('./features/clinora/acesso').then((m) => m.Acesso);
const area = () => import('./features/clinora/area-paciente').then((m) => m.AreaPaciente);
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', component: Inicio, title: 'Clinora · Cuidar de você é o nosso propósito' },
      {
        path: 'profissionais',
        loadComponent: () =>
          import('./features/profissionais/profissionais-lista/profissionais-lista').then(
            (m) => m.ProfissionaisLista,
          ),
        title: 'Profissionais · Clinora',
      },
      {
        path: 'profissionais/:id',
        loadComponent: () =>
          import('./features/profissionais/perfil-profissional/perfil-profissional').then(
            (m) => m.PerfilProfissional,
          ),
        title: 'Conheça o profissional · Clinora',
      },
      {
        path: 'convenios',
        loadComponent: () => import('./features/clinora/institucional').then((m) => m.Convenios),
        title: 'Convênios · Clinora',
      },
      {
        path: 'contato',
        loadComponent: () => import('./features/clinora/institucional').then((m) => m.Contato),
        title: 'Contato · Clinora',
      },
      {
        path: 'sobre',
        loadComponent: () => import('./features/clinora/institucional').then((m) => m.Sobre),
        title: 'Sobre a Clinora',
      },
      {
        path: 'entrar',
        loadComponent: acesso,
        data: { modo: 'entrar' },
        title: 'Entrar · Clinora',
      },
      { path: 'login', redirectTo: 'entrar', pathMatch: 'full' },
      {
        path: 'criar-conta',
        loadComponent: acesso,
        data: { modo: 'cadastro' },
        title: 'Criar conta · Clinora',
      },
      {
        path: 'recuperar-acesso',
        loadComponent: acesso,
        data: { modo: 'recuperar' },
        title: 'Recuperar acesso · Clinora',
      },
      {
        path: 'nova-senha',
        loadComponent: acesso,
        data: { modo: 'nova-senha' },
        title: 'Nova senha · Clinora',
      },
      {
        path: 'agendar',
        loadComponent: () => import('./features/clinora/agendamento').then((m) => m.Agendamento),
        title: 'Agendar consulta · Clinora',
      },
      {
        path: 'agendamento-concluido',
        loadComponent: () =>
          import('./features/clinora/agendamento').then((m) => m.AgendamentoConcluido),
        title: 'Agendamento concluído · Clinora',
      },
      {
        path: 'minha-area',
        loadComponent: area,
        canActivate: [sessaoDemo],
        data: { modo: 'area' },
        title: 'Minha área · Clinora',
      },
      {
        path: 'meus-dados',
        loadComponent: area,
        canActivate: [sessaoDemo],
        data: { modo: 'dados' },
        title: 'Meus dados · Clinora',
      },
      {
        path: 'consultas/:id/cancelar',
        loadComponent: area,
        canActivate: [sessaoDemo],
        data: { modo: 'cancelar' },
        title: 'Confirmar cancelamento · Clinora',
      },
      {
        path: 'consultas/:id',
        loadComponent: area,
        canActivate: [sessaoDemo],
        data: { modo: 'detalhes' },
        title: 'Detalhes da consulta · Clinora',
      },
      {
        path: 'mensagem-enviada',
        loadComponent: resultado,
        title: 'Mensagem registrada · Clinora',
        data: {
          icone: 'mail',
          titulo: 'Recebemos sua mensagem na demonstração.',
          descricao:
            'Obrigada por entrar em contato. Em um serviço real, a equipe responderia pelo e-mail informado.',
          aviso: 'Projeto acadêmico: nenhuma mensagem foi enviada para a clínica.',
          destino: '/',
          botao: 'Voltar ao início',
          secundario: '/contato',
          textoSecundario: 'Voltar para contato',
        },
      },
      {
        path: 'confirmar-email',
        loadComponent: resultado,
        title: 'Conta de demonstração criada · Clinora',
        data: {
          icone: 'mail',
          etiqueta: 'Seu cuidado começa aqui',
          titulo: 'Sua conta de demonstração está pronta.',
          descricao: 'Em um serviço real, você receberia um link para confirmar seu e-mail.',
          aviso: 'Nenhum e-mail foi enviado. Você já pode acessar a demonstração.',
          destino: '/minha-area',
          botao: 'Acessar minha área',
        },
      },
      {
        path: 'link-enviado',
        loadComponent: resultado,
        title: 'Recuperação de acesso · Clinora',
        data: {
          icone: 'mail',
          titulo: 'Confira seu e-mail, em um serviço real.',
          descricao:
            'A recuperação de acesso está representada neste protótipo. Continue para conhecer a tela de nova senha.',
          aviso: 'Demonstração: nenhum link foi enviado por e-mail.',
          destino: '/nova-senha',
          botao: 'Simular redefinição de senha',
          secundario: '/entrar',
          textoSecundario: 'Voltar para entrar',
        },
      },
      {
        path: 'senha-atualizada',
        loadComponent: resultado,
        title: 'Senha · Clinora',
        data: {
          titulo: 'Tudo pronto para continuar.',
          descricao: 'Você concluiu a demonstração de atualização de senha.',
          aviso: 'Nenhuma credencial real foi alterada ou armazenada.',
          destino: '/entrar',
          botao: 'Ir para entrar',
        },
      },
      {
        path: 'dados-atualizados',
        loadComponent: resultado,
        canActivate: [sessaoDemo],
        title: 'Dados atualizados · Clinora',
        data: {
          titulo: 'Seus dados foram atualizados.',
          descricao: 'Suas informações de contato estão atualizadas nesta demonstração.',
          destino: '/minha-area',
          botao: 'Voltar para minha área',
        },
      },
      {
        path: 'consulta-cancelada',
        loadComponent: resultado,
        canActivate: [sessaoDemo],
        title: 'Consulta cancelada · Clinora',
        data: {
          titulo: 'Consulta cancelada.',
          descricao:
            'O horário foi liberado na demonstração. Quando precisar, estaremos aqui para cuidar de você.',
          destino: '/agendar',
          botao: 'Agendar outro horário',
          secundario: '/minha-area',
          textoSecundario: 'Voltar para minha área',
        },
      },
      // Módulo de exemplo do professor, preservado para consulta pelo grupo.
      {
        path: 'produtos',
        loadChildren: () =>
          import('./features/produtos/produtos.routes').then((m) => m.PRODUTOS_ROUTES),
      },
      {
        path: '**',
        loadComponent: resultado,
        title: 'Página não encontrada · Clinora',
        data: {
          icone: 'search',
          etiqueta: 'Página não encontrada',
          titulo: 'Vamos encontrar o seu caminho?',
          descricao: 'Esta página não está disponível. Volte ao início para continuar.',
          destino: '/',
          botao: 'Voltar ao início',
        },
      },
    ],
  },
];
