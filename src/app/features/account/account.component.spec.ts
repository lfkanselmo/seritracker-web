import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AccountComponent } from './account.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { i18nTestingModule } from '../../core/testing/i18n-testing';

describe('AccountComponent', () => {
    let component: AccountComponent;
    let authServiceMock: {
        changePassword: ReturnType<typeof vi.fn>;
        getUserName: ReturnType<typeof vi.fn>;
        isLoggedIn: ReturnType<typeof vi.fn>;
    };
    let notificationServiceMock: { getUnread: ReturnType<typeof vi.fn> };
    let snackBarMock: { open: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const validForm = {
        currentPassword: 'current123',
        newPassword: 'newPassword456',
        confirmPassword: 'newPassword456'
    };

    beforeEach(() => {
        authServiceMock = {
            changePassword: vi.fn(),
            getUserName: vi.fn().mockReturnValue('Test User'),
            isLoggedIn: vi.fn().mockReturnValue(true),
        };
        notificationServiceMock = {
            getUnread: vi.fn().mockReturnValue(of({
                success: true,
                data: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0 },
                message: 'OK',
                timestamp: ''
            })),
        };
        snackBarMock = { open: vi.fn() };

        TestBed.configureTestingModule({
            imports: [AccountComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: AuthService, useValue: authServiceMock },
                { provide: NotificationService, useValue: notificationServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
                { provide: MatSnackBar, useValue: snackBarMock },
            ]
        });

        const fixture = TestBed.createComponent(AccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should expose the username from AuthService', () => {
        expect(component.userName).toBe('Test User');
    });

    it('should be invalid when empty', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when the new password is too short', () => {
        component.form.setValue({ ...validForm, newPassword: '123', confirmPassword: '123' });
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when the passwords do not match', () => {
        component.form.setValue({ ...validForm, confirmPassword: 'somethingElse123' });
        expect(component.form.hasError('passwordsMismatch')).toBe(true);
    });

    it('should be valid when the new password and confirmation match', () => {
        component.form.setValue(validForm);
        expect(component.form.valid).toBe(true);
    });

    describe('onSubmit', () => {
        it('should not call the service when the form is invalid', () => {
            component.onSubmit();
            expect(authServiceMock.changePassword).not.toHaveBeenCalled();
        });

        it('should call the service with the current and new password', () => {
            component.form.setValue(validForm);
            authServiceMock.changePassword.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(authServiceMock.changePassword).toHaveBeenCalledWith({
                currentPassword: 'current123',
                newPassword: 'newPassword456'
            });
        });

        it('should reset the form and show a confirmation on success', () => {
            component.form.setValue(validForm);
            authServiceMock.changePassword.mockReturnValue(of({ success: true, data: undefined, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(component.form.get('currentPassword')?.value).toBeNull();
            expect(snackBarMock.open).toHaveBeenCalled();
            expect(component.isLoading).toBe(false);
            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it('should show an error message when the current password is wrong', () => {
            component.form.setValue(validForm);
            authServiceMock.changePassword.mockReturnValue(
                throwError(() => ({ error: { message: 'Current password is incorrect' } }))
            );

            component.onSubmit();

            expect(component.errorMessage).toBe('Current password is incorrect');
            expect(component.isLoading).toBe(false);
        });

        it('should show a default error message when the server gives no message', () => {
            component.form.setValue(validForm);
            authServiceMock.changePassword.mockReturnValue(throwError(() => ({})));

            component.onSubmit();

            expect(component.errorMessage).toBe('Error al cambiar la contraseña');
        });
    });

    describe('onBack', () => {
        it('should navigate to /series', () => {
            component.onBack();
            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });
    });
});
