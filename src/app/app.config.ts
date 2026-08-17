import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';
import { TranslocoHttpLoader } from './core/transloco-loader';
import { AVAILABLE_LANGS, resolveInitialLang } from './core/services/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Orden importa: refreshInterceptor va último para que sea el primero
    // en ver un 401 (más cerca del backend) e intente renovar el token
    // antes de que errorInterceptor asuma que la sesión expiró.
    provideHttpClient(
      withXhr(),
      withInterceptors([authInterceptor, errorInterceptor, refreshInterceptor]),
    ),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        availableLangs: AVAILABLE_LANGS,
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: TranslocoHttpLoader,
    }),
    // Carga el idioma resuelto (guardado o del navegador) antes de renderizar,
    // para que no haya un flash con el idioma por defecto.
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      const lang = resolveInitialLang();
      transloco.setActiveLang(lang);
      return firstValueFrom(transloco.load(lang));
    }),
  ],
};
