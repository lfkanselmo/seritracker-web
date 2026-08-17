import {
  Component,
  DestroyRef,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { TmdbSeries, SeriesStatus, STATUS_CONFIG } from '../../../core/models/series.model';
import { TmdbService } from '../../../core/services/tmdb.service';
import { SeriesService } from '../../../core/services/series.service';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SeriesStatusPipe } from '../../../shared/pipes/series-status.pipe';
import { pageFadeIn, listStagger, fadeIn } from '../../../shared/animations/app.animations';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-series-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    NavbarComponent,
    SeriesStatusPipe,
    TranslocoModule,
  ],
  animations: [pageFadeIn, listStagger, fadeIn],
  templateUrl: './series-search.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './series-search.component.scss',
})
export class SeriesSearchComponent {
  private destroyRef = inject(DestroyRef);
  private tmdbService = inject(TmdbService);
  private seriesService = inject(SeriesService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private transloco = inject(TranslocoService);

  searchControl = new FormControl('');

  results: TmdbSeries[] = [];
  isSearching = false;
  isAdding: number | null = null;
  hasSearched = false;

  readonly statuses: SeriesStatus[] = ['WATCHING', 'WANT_TO_WATCH', 'COMPLETED', 'ABANDONED'];

  readonly statusConfig = STATUS_CONFIG;

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((query) => !!query && query.length >= 2),
        switchMap((query) => {
          this.isSearching = true;
          this.hasSearched = true;
          return this.tmdbService.search(query!);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.results = response.data;
          this.isSearching = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isSearching = false;
          this.snackBar.open(this.transloco.translate('series.search.error'), '✕', {
            duration: 3000,
          });
          this.cdr.detectChanges();
        },
      });
  }

  onAddSeries(series: TmdbSeries, status: SeriesStatus): void {
    this.isAdding = series.tmdbId;
    this.cdr.detectChanges();

    this.seriesService
      .create({
        tmdbId: series.tmdbId,
        status,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.transloco.translate('series.search.added', { title: series.title }),
            '✓',
            { duration: 3000 },
          );
          this.isAdding = null;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          const message = extractErrorMessage(err, this.transloco, 'series.search.addError');
          this.snackBar.open(message, '✕', { duration: 3000 });
          this.isAdding = null;
          this.cdr.detectChanges();
        },
      });
  }

  onBack(): void {
    this.router.navigate(['/series']);
  }
}
