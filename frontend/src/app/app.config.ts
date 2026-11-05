import {
  PacientesService,
  PacientesMockService,
} from './features/pacientes/services/pacientes.service';
import {
  ProfissionaisService,
  ProfissionaisMockService,
} from './features/profissionais/services/profissionais.service';
import {
  ConsultasService,
  ConsultasMockService,
} from './features/consultas/services/consultas.service';
import {
  EspecialidadesService,
  EspecialidadesMockService,
} from './features/especialidades/services/especialidades.service';
import {
  ConveniosService,
  ConveniosMockService,
} from './features/convenios/services/convenios.service';
import { RelatoriosService, RelatoriosMockService } from './features/relatorios/relatorios.service';
import { ProfissionaisApiService } from './features/profissionais/services/profissionais-api.service';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

// Formatos brasileiros para moeda, datas e números (R$ 8,90)
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: PacientesService, useClass: PacientesMockService },
    {
      provide: ProfissionaisService,
      useClass: environment.usarMockProfissionais
        ? ProfissionaisMockService
        : ProfissionaisApiService,
    },
    { provide: ConsultasService, useClass: ConsultasMockService },
    { provide: EspecialidadesService, useClass: EspecialidadesMockService },
    { provide: ConveniosService, useClass: ConveniosMockService },
    { provide: RelatoriosService, useClass: RelatoriosMockService },
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
