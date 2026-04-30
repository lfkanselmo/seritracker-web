import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
    let authServiceMock: { isLoggedIn: ReturnType<typeof vi.fn> };
    let routerMock: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authServiceMock = { isLoggedIn: vi.fn() };
        routerMock = { navigate: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock },
            ]
        });
    });

    it('should allow access when user is logged in', () => {
        authServiceMock.isLoggedIn.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() =>
            authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(true);
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not logged in', () => {
        authServiceMock.isLoggedIn.mockReturnValue(false);

        const result = TestBed.runInInjectionContext(() =>
            authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
        );

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
});