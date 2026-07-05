import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: { post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        httpMock = { post: vi.fn(), patch: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                {
                    provide: HttpClient,
                    useValue: httpMock
                }
            ]
        });
        service = TestBed.inject(AuthService);
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return null access token when not logged in', () => {
        expect(service.getAccessToken()).toBeNull();
    });

    it('should return null refresh token when not logged in', () => {
        expect(service.getRefreshToken()).toBeNull();
    });

    it('should return false when not logged in', () => {
        expect(service.isLoggedIn()).toBe(false);
    });

    it('should return null userName when not logged in', () => {
        expect(service.getUserName()).toBeNull();
    });

    it('should save the access token, refresh token and userName on login', () => {
        httpMock.post.mockReturnValue(of({
            success: true,
            data: { accessToken: 'access123', refreshToken: 'refresh123', email: 'user@test.com', name: 'Test', userId: 1 },
            message: 'OK',
            timestamp: ''
        }));

        service.login({ email: 'user@test.com', password: 'password123' }).subscribe();

        expect(service.getAccessToken()).toBe('access123');
        expect(service.getRefreshToken()).toBe('refresh123');
        expect(service.getUserName()).toBe('Test');
        expect(service.isLoggedIn()).toBe(true);
    });

    it('should clear the session on logout', () => {
        localStorage.setItem('accessToken', 'access123');
        localStorage.setItem('refreshToken', 'refresh123');
        localStorage.setItem('userName', 'Test');
        httpMock.post.mockReturnValue(of({}));

        service.logout();

        expect(service.getAccessToken()).toBeNull();
        expect(service.getRefreshToken()).toBeNull();
        expect(service.getUserName()).toBeNull();
    });

    it('should revoke the refresh token on the server on logout, best-effort', () => {
        localStorage.setItem('refreshToken', 'refresh123');
        httpMock.post.mockReturnValue(of({}));

        service.logout();

        expect(httpMock.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/logout'),
            { refreshToken: 'refresh123' }
        );
    });

    it('should not call the server on logout when there is no refresh token', () => {
        service.logout();
        expect(httpMock.post).not.toHaveBeenCalled();
    });

    it('should POST to /auth/refresh with the stored refresh token and save the new session', () => {
        localStorage.setItem('refreshToken', 'old-refresh');
        httpMock.post.mockReturnValue(of({
            success: true,
            data: { accessToken: 'new-access', refreshToken: 'new-refresh', email: 'user@test.com', name: 'Test', userId: 1 },
            message: 'OK',
            timestamp: ''
        }));

        service.refresh().subscribe();

        expect(httpMock.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/refresh'),
            { refreshToken: 'old-refresh' }
        );
        expect(service.getAccessToken()).toBe('new-access');
        expect(service.getRefreshToken()).toBe('new-refresh');
    });

    it('should PATCH to /auth/password with the given credentials', () => {
        httpMock.patch.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

        service.changePassword({ currentPassword: 'old123', newPassword: 'new12345' }).subscribe();

        expect(httpMock.patch).toHaveBeenCalledWith(
            expect.stringContaining('/auth/password'),
            { currentPassword: 'old123', newPassword: 'new12345' }
        );
    });

    it('should POST to /auth/forgot-password with the given email', () => {
        httpMock.post.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

        service.forgotPassword({ email: 'user@test.com' }).subscribe();

        expect(httpMock.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/forgot-password'),
            { email: 'user@test.com' }
        );
    });

    it('should POST to /auth/reset-password with the token and new password', () => {
        httpMock.post.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

        service.resetPassword({ token: 'abc123', newPassword: 'new12345' }).subscribe();

        expect(httpMock.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/reset-password'),
            { token: 'abc123', newPassword: 'new12345' }
        );
    });
});
