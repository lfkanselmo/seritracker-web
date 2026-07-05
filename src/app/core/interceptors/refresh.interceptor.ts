import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Rutas de auth que nunca deben disparar un intento de renovación —
// evita loops (renovar el propio /refresh) y falsos positivos en
// endpoints públicos que devuelven 401/400 por otras razones.
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Módulo-level en vez de closure por request: todas las requests que
// fallan al mismo tiempo deben compartir la MISMA renovación en curso,
// no disparar una por cada una.
let refreshInProgress$: Observable<string> | null = null;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExemptPath = NO_REFRESH_PATHS.some(path => req.url.includes(path));

      if (error.status !== 401 || isExemptPath || !authService.getRefreshToken()) {
        return throwError(() => error);
      }

      return getOrCreateRefresh(authService).pipe(
        switchMap(newAccessToken => next(attachToken(req, newAccessToken)))
      );
    })
  );
};

function getOrCreateRefresh(authService: AuthService): Observable<string> {
  if (!refreshInProgress$) {
    refreshInProgress$ = authService.refresh().pipe(
      map(response => response.data.accessToken),
      shareReplay(1),
      finalize(() => { refreshInProgress$ = null; })
    );
  }
  return refreshInProgress$;
}

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
}
