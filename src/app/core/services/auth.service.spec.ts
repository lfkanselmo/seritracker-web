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
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return null token when not logged in', () => {
        localStorage.clear();
        expect(service.getToken()).toBeNull();
    });

    it('should return false when not logged in', () => {
        localStorage.clear();
        expect(service.isLoggedIn()).toBe(false);
    });

    it('should return null userName when not logged in', () => {
        localStorage.clear();
        expect(service.getUserName()).toBeNull();
    });

    it('should clear session on logout', () => {
        localStorage.setItem('token', 'test_token');
        localStorage.setItem('userName', 'Test');

        service.logout();

        expect(service.getToken()).toBeNull();
        expect(service.getUserName()).toBeNull();
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