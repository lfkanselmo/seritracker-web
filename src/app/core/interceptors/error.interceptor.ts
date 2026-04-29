import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const message = resolveMessage(error);

            switch (error.status) {
                case 0:
                    snackBar.open('Sin conexión con el servidor', '✕', { duration: 4000 });
                    break;

                case 401:
                    authService.logout();
                    router.navigate(['/auth/login']);
                    snackBar.open('Tu sesión expiró, inicia sesión nuevamente', '✕', { duration: 4000 });
                    break;

                case 403:
                    snackBar.open('No tienes permisos para realizar esta acción', '✕', { duration: 4000 });
                    break;

                case 404:
                    snackBar.open('Recurso no encontrado', '✕', { duration: 3000 });
                    break;

                case 409:
                    // Conflicto — lo maneja cada componente (ej: serie duplicada)
                    break;

                case 500:
                    snackBar.open('Error interno del servidor. Intenta más tarde', '✕', { duration: 4000 });
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

function resolveMessage(error: HttpErrorResponse): string {
    if (error.error?.message) return error.error.message;
    if (error.message) return error.message;
    return 'Ocurrió un error inesperado';
}