import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);
  const transloco = inject(TranslocoService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = resolveMessage(error, transloco);

      switch (error.status) {
        case 0:
          snackBar.open(transloco.translate('errors.noConnection'), '✕', { duration: 4000 });
          break;

        case 401:
          authService.logout();
          router.navigate(['/auth/login']);
          snackBar.open(transloco.translate('errors.sessionExpired'), '✕', { duration: 4000 });
          break;

        case 403:
          snackBar.open(transloco.translate('errors.forbidden'), '✕', { duration: 4000 });
          break;

        case 404:
          snackBar.open(transloco.translate('errors.notFound'), '✕', { duration: 3000 });
          break;

        case 409:
          // Conflicto — lo maneja cada componente (ej: serie duplicada)
          break;

        case 500:
          snackBar.open(transloco.translate('errors.serverError'), '✕', { duration: 4000 });
          break;

        default:
          if (error.status >= 400) {
            snackBar.open(message, '✕', { duration: 3000 });
          }
      }

      return throwError(() => error);
    })
  );
};

function resolveMessage(error: HttpErrorResponse, transloco: TranslocoService): string {
  if (error.error?.message) return error.error.message;
  if (error.message) return error.message;
  return transloco.translate('errors.unexpected');
}
