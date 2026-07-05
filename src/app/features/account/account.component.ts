import { Component, DestroyRef, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroupDirective, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { pageFadeIn } from '../../shared/animations/app.animations';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarComponent,
  ],
  animations: [pageFadeIn],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordsMatchValidator });

  @ViewChild('formDirective') formDirective!: FormGroupDirective;

  isLoading = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  errorMessage = '';

  get userName(): string | null {
    return this.authService.getUserName();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.authService.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.formDirective.resetForm();
          this.snackBar.open('Contraseña actualizada', '✓', { duration: 2500 });
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'Error al cambiar la contraseña';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/series']);
  }
}
