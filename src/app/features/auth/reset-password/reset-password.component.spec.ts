import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/services/auth.service';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let authServiceMock: { resetPassword: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const validForm = { newPassword: 'newPassword456', confirmPassword: 'newPassword456' };

    function setup(token: string | null) {
        TestBed.resetTestingModule();
        authServiceMock = { resetPassword: vi.fn() };

        TestBed.configureTestingModule({
            imports: [ResetPasswordComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } }
                },
            ]
        });

        const fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        fixture.detectChanges();
    }

    beforeEach(() => setup('valid-token'));

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should read the token from the query params', () => {
        expect(component.tokenMissing).toBe(false);
    });

    it('should flag tokenMissing when there is no token in the URL', () => {
        setup(null);
        expect(component.tokenMissing).toBe(true);
    });

    it('should be invalid when empty', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when the password is too short', () => {
        component.form.setValue({ newPassword: '123', confirmPassword: '123' });
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when the passwords do not match', () => {
        component.form.setValue({ ...validForm, confirmPassword: 'somethingElse123' });
        expect(component.form.hasError('passwordsMismatch')).toBe(true);
    });

    describe('onSubmit', () => {
        it('should not call the service when the form is invalid', () => {
            component.onSubmit();
            expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
        });

        it('should not call the service when the token is missing', () => {
            setup(null);
            component.form.setValue(validForm);

            component.onSubmit();

            expect(authServiceMock.resetPassword).not.toHaveBeenCalled();
        });

        it('should call the service with the token and new password', () => {
            component.form.setValue(validForm);
            authServiceMock.resetPassword.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(authServiceMock.resetPassword).toHaveBeenCalledWith({
                token: 'valid-token',
                newPassword: 'newPassword456'
            });
            expect(component.submitted).toBe(true);
        });

        it('should show an error message when the token is invalid or expired', () => {
            component.form.setValue(validForm);
            authServiceMock.resetPassword.mockReturnValue(
                throwError(() => ({ error: { message: 'Invalid or expired reset token' } }))
            );

            component.onSubmit();

            expect(component.errorMessage).toBe('Invalid or expired reset token');
            expect(component.submitted).toBe(false);
        });
    });

    describe('onGoToLogin', () => {
        it('should navigate to /auth/login', () => {
            component.onGoToLogin();
            expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
        });
    });
});
