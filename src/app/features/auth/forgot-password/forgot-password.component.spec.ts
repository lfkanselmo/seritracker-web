import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let authServiceMock: { forgotPassword: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        authServiceMock = { forgotPassword: vi.fn() };

        TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
            ]
        });

        const fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid when empty', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid with a malformed email', () => {
        component.form.setValue({ email: 'not-an-email' });
        expect(component.form.invalid).toBe(true);
    });

    it('should be valid with a proper email', () => {
        component.form.setValue({ email: 'user@test.com' });
        expect(component.form.valid).toBe(true);
    });

    describe('onSubmit', () => {
        it('should not call the service when the form is invalid', () => {
            component.onSubmit();
            expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
        });

        it('should mark as submitted on success', () => {
            component.form.setValue({ email: 'user@test.com' });
            authServiceMock.forgotPassword.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(component.submitted).toBe(true);
            expect(component.isLoading).toBe(false);
        });

        it('should show an error message when the request fails (e.g. rate limited)', () => {
            component.form.setValue({ email: 'user@test.com' });
            authServiceMock.forgotPassword.mockReturnValue(
                throwError(() => ({ error: { message: 'Too many attempts, please try again later' } }))
            );

            component.onSubmit();

            expect(component.errorMessage).toBe('Too many attempts, please try again later');
            expect(component.submitted).toBe(false);
            expect(component.isLoading).toBe(false);
        });

        it('should show a default error message when the server gives no message', () => {
            component.form.setValue({ email: 'user@test.com' });
            authServiceMock.forgotPassword.mockReturnValue(throwError(() => ({})));

            component.onSubmit();

            expect(component.errorMessage).toBe('Error al procesar la solicitud');
        });
    });
});
