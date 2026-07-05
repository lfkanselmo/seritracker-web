import { Component, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoModule,
  ],
  templateUrl: './register.component.html',
  styleUrl:    './register.component.scss'
})
export class RegisterComponent {

private fb          = inject(FormBuilder);
private authService = inject(AuthService);
private router      = inject(Router);
private destroyRef  = inject(DestroyRef);
private cdr         = inject(ChangeDetectorRef);
private transloco   = inject(TranslocoService);

form = this.fb.group({
  name:     ['', Validators.required],
  email:    ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});

isLoading    = false;
hidePassword = true;
errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading    = true;
    this.errorMessage = '';

    const { name, email, password } = this.form.getRawValue();
    this.authService.register({ name: name!, email: email!, password: password! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  () => this.router.navigate(['/series']),
        error: (err: HttpErrorResponse) => {
          this.errorMessage = extractErrorMessage(err, this.transloco, 'auth.register.error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}