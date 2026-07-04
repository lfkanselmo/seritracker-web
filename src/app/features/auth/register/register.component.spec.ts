import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let authServiceMock: { register: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        authServiceMock = { register: vi.fn() };

        TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
            ]
        });

        const fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid when empty', () => {
        expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when the password is shorter than 8 characters', () => {
        component.form.setValue({ name: 'Test', email: 'user@test.com', password: '123' });
        expect(component.form.invalid).toBe(true);
    });

    it('should be valid with all fields filled correctly', () => {
        component.form.setValue({ name: 'Test', email: 'user@test.com', password: 'password123' });
        expect(component.form.valid).toBe(true);
    });

    describe('onSubmit', () => {
        it('should not call the service when the form is invalid', () => {
            component.onSubmit();
            expect(authServiceMock.register).not.toHaveBeenCalled();
        });

        it('should navigate to /series on successful registration', () => {
            component.form.setValue({ name: 'Test', email: 'user@test.com', password: 'password123' });
            authServiceMock.register.mockReturnValue(of({ success: true, data: {}, message: 'OK', timestamp: '' }));

            component.onSubmit();

            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });

        it('should show an error message when registration fails', () => {
            component.form.setValue({ name: 'Test', email: 'user@test.com', password: 'password123' });
            authServiceMock.register.mockReturnValue(
                throwError(() => ({ error: { message: 'Email already registered' } }))
            );

            component.onSubmit();

            expect(component.errorMessage).toBe('Email already registered');
            expect(component.isLoading).toBe(false);
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
