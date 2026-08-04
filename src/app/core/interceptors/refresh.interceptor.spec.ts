import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject, of, throwError } from 'rxjs';
import { refreshInterceptor } from './refresh.interceptor';
import { AuthService } from '../services/auth.service';

describe('refreshInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let authServiceMock: { getRefreshToken: ReturnType<typeof vi.fn>; refresh: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authServiceMock = {
            getRefreshToken: vi.fn().mockReturnValue('stored-refresh-token'),
            refresh: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([refreshInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceMock },
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should pass through successful requests unchanged', () => {
        let result: unknown;
        httpClient.get('/api/v1/series').subscribe(res => (result = res));

        httpMock.expectOne('/api/v1/series').flush({ success: true });

        expect(result).toEqual({ success: true });
        expect(authServiceMock.refresh).not.toHaveBeenCalled();
    });

    it('should not attempt a refresh for a 401 on an exempt auth path', () => {
        let error: unknown;
        httpClient.post('/api/v1/auth/login', {}).subscribe({ error: (e) => (error = e) });

        httpMock.expectOne('/api/v1/auth/login').flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refresh).not.toHaveBeenCalled();
        expect((error as { status: number }).status).toBe(401);
    });

    it('should not attempt a refresh when there is no stored refresh token', () => {
        authServiceMock.getRefreshToken.mockReturnValue(null);

        let error: unknown;
        httpClient.get('/api/v1/series').subscribe({ error: (e) => (error = e) });

        httpMock.expectOne('/api/v1/series').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refresh).not.toHaveBeenCalled();
        expect(error).toBeTruthy();
    });

    it('should refresh the token and retry the original request on 401', () => {
        authServiceMock.refresh.mockReturnValue(of({
            success: true,
            data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token', email: '', name: '', userId: 1 },
            message: 'OK',
            timestamp: ''
        }));

        let result: unknown;
        httpClient.get('/api/v1/series').subscribe(res => (result = res));

        httpMock.expectOne('/api/v1/series').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refresh).toHaveBeenCalledTimes(1);

        const retried = httpMock.expectOne('/api/v1/series');
        expect(retried.request.headers.get('Authorization')).toBe('Bearer new-access-token');
        retried.flush({ success: true });

        expect(result).toEqual({ success: true });
    });

    it('should only trigger one refresh call for multiple requests failing concurrently', () => {
        // Subject controlado a mano — a diferencia de of(...), no emite
        // sincrónicamente, así que deja una ventana real "en curso" donde
        // la segunda request fallida debe encontrar la primera renovación
        // ya en marcha en vez de disparar una nueva.
        const refreshSubject = new Subject<{ success: boolean; data: { accessToken: string; refreshToken: string; email: string; name: string; userId: number }; message: string; timestamp: string }>();
        authServiceMock.refresh.mockReturnValue(refreshSubject.asObservable());

        const results: unknown[] = [];
        httpClient.get('/api/v1/series').subscribe(res => results.push(res));
        httpClient.get('/api/v1/notifications').subscribe(res => results.push(res));

        httpMock.expectOne('/api/v1/series').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
        httpMock.expectOne('/api/v1/notifications').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.refresh).toHaveBeenCalledTimes(1);

        refreshSubject.next({
            success: true,
            data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token', email: '', name: '', userId: 1 },
            message: 'OK',
            timestamp: ''
        });
        refreshSubject.complete();

        httpMock.expectOne('/api/v1/series').flush({ success: true, data: 'series' });
        httpMock.expectOne('/api/v1/notifications').flush({ success: true, data: 'notifications' });

        expect(results).toHaveLength(2);
    });

    it('should propagate the error when the refresh itself fails', () => {
        authServiceMock.refresh.mockReturnValue(throwError(() => ({ status: 401, error: { message: 'Invalid or expired refresh token' } })));

        let error: { status: number } | undefined;
        httpClient.get('/api/v1/series').subscribe({ error: (e) => (error = e) });

        httpMock.expectOne('/api/v1/series').flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(error?.status).toBe(401);
    });
});
