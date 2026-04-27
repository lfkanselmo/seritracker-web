import { Component, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { TmdbSeries, SeriesStatus, STATUS_CONFIG } from '../../../core/models/series.model';
import { TmdbService } from '../../../core/services/tmdb.service';
import { SeriesService } from '../../../core/services/series.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';

@Component({
  selector: 'app-series-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    NavbarComponent,
  ],
  templateUrl: './series-search.component.html',
  styleUrl:    './series-search.component.scss'
})
export class SeriesSearchComponent {

  private destroyRef    = inject(DestroyRef);
  private tmdbService   = inject(TmdbService);
  private seriesService = inject(SeriesService);
  private authService   = inject(AuthService);
  private router        = inject(Router);
  private snackBar      = inject(MatSnackBar);
  private cdr           = inject(ChangeDetectorRef);

  searchControl = new FormControl('');

  results:     TmdbSeries[] = [];
  isSearching  = false;
  isAdding:    number | null = null;
  hasSearched  = false;

  readonly statuses: SeriesStatus[] = [
    'WATCHING', 'WANT_TO_WATCH', 'COMPLETED', 'ABANDONED'
  ];

  readonly statusConfig = STATUS_CONFIG;

  readonly statusLabels: Record<SeriesStatus, string> = {
    WATCHING:      'Viendo',
    WANT_TO_WATCH: 'Por ver',
    COMPLETED:     'Completada',
    ABANDONED:     'Abandonada'
  };

  get userId(): number {
    return this.authService.getUserId()!;
  }

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(query => !!query && query.length >= 2),
      switchMap(query => {
        this.isSearching = true;
        this.hasSearched = true;
        return this.tmdbService.search(query!);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.results     = response.data;
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
        this.snackBar.open('Error al buscar series', '✕', { duration: 3000 });
      }
    });
  }

  onAddSeries(series: TmdbSeries, status: SeriesStatus): void {
  this.isAdding = series.tmdbId;
  this.cdr.detectChanges();

  this.seriesService.create(this.userId, {
    tmdbId: series.tmdbId,
    status
  }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.snackBar.open(`"${series.title}" agregada a tu lista`, '✓', { duration: 3000 });
        this.isAdding = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const message = err.error?.message ?? 'Error al agregar serie';
        this.snackBar.open(message, '✕', { duration: 3000 });
        this.isAdding = null;
        this.cdr.detectChanges();
      }
    });
}

  onBack(): void {
    this.router.navigate(['/series']);
  }
}