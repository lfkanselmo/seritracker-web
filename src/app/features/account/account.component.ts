import {
  Component,
  DestroyRef,
  inject,
  ChangeDetectorRef,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { pageFadeIn } from '../../shared/animations/app.animations';
import { extractErrorMessage } from '../../core/utils/http-error.util';

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
    TranslocoModule,
  ],
  animations: [pageFadeIn],
  templateUrl: './account.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private transloco = inject(TranslocoService);

  form = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatchValidator },
  );

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

    this.authService
      .changePassword({ currentPassword: currentPassword!, newPassword: newPassword! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.formDirective.resetForm();
          this.snackBar.open(this.transloco.translate('account.success'), '✓', { duration: 2500 });
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = extractErrorMessage(err, this.transloco, 'account.error');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onBack(): void {
    this.router.navigate(['/series']);
  }
}
