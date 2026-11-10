import { PacientesService } from './features/pacientes/services/pacientes.service';
import { ProfissionaisService } from './features/profissionais/services/profissionais.service';
import { ConsultasService } from './features/consultas/services/consultas.service';
import { EspecialidadesService } from './features/especialidades/services/especialidades.service';
import { ConveniosService } from './features/convenios/services/convenios.service';
import { RelatoriosService } from './features/relatorios/relatorios.service';
import { ProfissionaisApiService } from './features/profissionais/services/profissionais-api.service';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth.interceptor';
import { pacienteAuthInterceptor } from './core/auth/paciente-auth.interceptor';
import { PacientesApiService } from './features/pacientes/services/pacientes-api.service';
import { ConsultasApiService } from './features/consultas/services/consultas-api.service';
import { EspecialidadesApiService } from './features/especialidades/services/especialidades-api.service';
import { ConveniosApiService } from './features/convenios/services/convenios-api.service';
import { RelatoriosApiService } from './features/relatorios/relatorios-api.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

// Formatos brasileiros para moeda, datas e números (R$ 8,90)
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: PacientesService,
      useClass: PacientesApiService,
    },
    {
      provide: ProfissionaisService,
      useClass: ProfissionaisApiService,
    },
    {
      provide: ConsultasService,
      useClass: ConsultasApiService,
    },
    {
      provide: EspecialidadesService,
      useClass: EspecialidadesApiService,
    },
    {
      provide: ConveniosService,
      useClass: ConveniosApiService,
    },
    {
      provide: RelatoriosService,
      useClass: RelatoriosApiService,
    },
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor, pacienteAuthInterceptor])),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
