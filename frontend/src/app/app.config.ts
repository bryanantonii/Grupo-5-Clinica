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
import { environment } from '../environments/environment';
import { routes } from './app.routes';

// Formatos brasileiros para moeda, datas e números (R$ 8,90)
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: PacientesService,
      useClass: environment.usarMock ? PacientesMockService : PacientesApiService,
    },
    {
      provide: ProfissionaisService,
      useClass: environment.usarMock ? ProfissionaisMockService : ProfissionaisApiService,
    },
    {
      provide: ConsultasService,
      useClass: environment.usarMock ? ConsultasMockService : ConsultasApiService,
    },
    {
      provide: EspecialidadesService,
      useClass: environment.usarMock ? EspecialidadesMockService : EspecialidadesApiService,
    },
    {
      provide: ConveniosService,
      useClass: environment.usarMock ? ConveniosMockService : ConveniosApiService,
    },
    {
      provide: RelatoriosService,
      useClass: environment.usarMock ? RelatoriosMockService : RelatoriosApiService,
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
