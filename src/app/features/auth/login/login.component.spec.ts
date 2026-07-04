import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let authServiceMock: { login: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        authServiceMock = { login: vi.fn() };

        TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
            ]
        });

        const fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid when empty', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid with a malformed email', () => {
        component.form.setValue({ email: 'not-an-email', password: 'password123' });
        expect(component.form.invalid).toBe(true);
    });

    it('should be valid with a proper email and password', () => {
        component.form.setValue({ email: 'user@test.com', password: 'password123' });
        expect(component.form.valid).toBe(true);
    });

    describe('onSubmit', () => {
        it('should not call the service when the form is invalid', () => {
            component.onSubmit();
            expect(authServiceMock.login).not.toHaveBeenCalled();
        });

        it('should navigate to /series on successful login', () => {
            component.form.setValue({ email: 'user@test.com', password: 'password123' });
            authServiceMock.login.mockReturnValue(of({ success: true, data: {}, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });

        it('should show an error message when login fails', () => {
            component.form.setValue({ email: 'user@test.com', password: 'wrong' });
            authServiceMock.login.mockReturnValue(
                throwError(() => ({ error: { message: 'Invalid credentials' } }))
            );

            component.onSubmit();

            expect(component.errorMessage).toBe('Invalid credentials');
            expect(component.isLoading).toBe(false);
            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('should show a default error message when the server gives no message', () => {
            component.form.setValue({ email: 'user@test.com', password: 'wrong' });
            authServiceMock.login.mockReturnValue(throwError(() => ({})));

            component.onSubmit();

            expect(component.errorMessage).toBe('Error al iniciar sesión');
        });
    });
});
