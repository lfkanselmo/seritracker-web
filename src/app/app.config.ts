import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { refreshInterceptor } from './core/interceptors/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Orden importa: refreshInterceptor va último para que sea el primero
    // en ver un 401 (más cerca del backend) e intente renovar el token
    // antes de que errorInterceptor asuma que la sesión expiró.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, refreshInterceptor])),
    provideAnimationsAsync(),
  ]
};