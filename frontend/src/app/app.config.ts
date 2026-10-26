import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { ProdutosApiService } from './features/produtos/services/produtos-api.service';
import { ProdutosMockService } from './features/produtos/services/produtos-mock.service';
import { ProdutosService } from './features/produtos/services/produtos.service';

// Formatos brasileiros para moeda, datas e números (R$ 8,90)
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Escolhe a implementação do serviço conforme o environment.
    // Cada aluno registra aqui o serviço do seu módulo, do mesmo jeito.
    {
      provide: ProdutosService,
      useClass: environment.usarMock ? ProdutosMockService : ProdutosApiService,
    },
  ],
};
