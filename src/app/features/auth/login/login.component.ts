import { Component, DestroyRef, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
  ],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss'
})
export class LoginComponent {

private fb = inject(FormBuilder);
private authService = inject(AuthService);
private router = inject(Router);
private destroyRef = inject(DestroyRef);

form = this.fb.group({
  email:    ['', [Validators.required, Validators.email]],
  password: ['', Validators.required]
});

isLoading    = false;
hidePassword = true;
errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading    = true;
    this.errorMessage = '';

    this.authService.login(this.form.value as any)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  () => this.router.navigate(['/series']),
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'Error al iniciar sesión';
          this.isLoading = false;
        }
      });
  }
}