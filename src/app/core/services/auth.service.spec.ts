import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                {
                    provide: HttpClient,
                    useValue: { post: vi.fn() }
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

    it('should return null userId when not logged in', () => {
        localStorage.clear();
        expect(service.getUserId()).toBeNull();
    });

    it('should return null userName when not logged in', () => {
        localStorage.clear();
        expect(service.getUserName()).toBeNull();
    });

    it('should clear session on logout', () => {
        localStorage.setItem('token', 'test_token');
        localStorage.setItem('userId', '1');
        localStorage.setItem('userName', 'Test');

        service.logout();

        expect(service.getToken()).toBeNull();
        expect(service.getUserId()).toBeNull();
        expect(service.getUserName()).toBeNull();
    });
});