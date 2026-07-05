import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserSeries, SeriesStatus, SeriesSortBy, SortDirection, STATUS_CONFIG } from '../../../core/models/series.model';
import { SeriesService } from '../../../core/services/series.service';
import { confirmDeleteSeries } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SeriesCardComponent } from '../../../shared/components/series-card/series-card.component';
import { fadeIn, listStagger, tabFade } from '../../../shared/animations/app.animations';
import { extractErrorMessage } from '../../../core/utils/http-error.util';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatPaginatorModule,
    NavbarComponent,
    SeriesCardComponent,
    TranslocoModule,
  ],
  animations: [fadeIn, listStagger, tabFade],
  templateUrl: './series-list.component.html',
  styleUrl: './series-list.component.scss'
})
export class SeriesListComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private seriesService = inject(SeriesService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private transloco = inject(TranslocoService);
  private searchInput$ = new Subject<string>();

  // Estado de datos
  seriesList: UserSeries[] = [];
  totalElements = 0;

  // Estado de paginación
  pageIndex = 0;
  pageSize = 20;
  readonly pageSizeOptions = [10, 20, 50];

  // Estado de UI
  isLoading = false;
  hasError = false;
  errorMessage = '';
  activeTab: SeriesStatus | null = null;
  searchQuery = '';
  showSearch = false;
  sortBy: SeriesSortBy = 'CREATED_AT';
  sortDir: SortDirection = 'DESC';

  readonly tabs = [
    { labelKey: 'series.list.tabs.all', status: null },
    { labelKey: 'series.list.tabs.watching', status: 'WATCHING' as SeriesStatus },
    { labelKey: 'series.list.tabs.wantToWatch', status: 'WANT_TO_WATCH' as SeriesStatus },
    { labelKey: 'series.list.tabs.completed', status: 'COMPLETED' as SeriesStatus },
    { labelKey: 'series.list.tabs.abandoned', status: 'ABANDONED' as SeriesStatus },
  ];

  readonly sortOptions: { labelKey: string; value: SeriesSortBy }[] = [
    { labelKey: 'series.list.sort.createdAt', value: 'CREATED_AT' },
    { labelKey: 'series.list.sort.updatedAt', value: 'UPDATED_AT' },
    { labelKey: 'series.list.sort.title', value: 'TITLE' },
    { labelKey: 'series.list.sort.rating', value: 'RATING' },
  ];

  readonly statusConfig = STATUS_CONFIG;

  constructor() {
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery = query;
      this.pageIndex = 0;
      this.loadSeries();
    });
  }

  ngOnInit(): void {
    this.loadSeries();
  }

  loadSeries(): void {
    this.isLoading = true;
    this.hasError = false;

    this.seriesService.getAll({
      status: this.activeTab ?? undefined,
      page: this.pageIndex,
      size: this.pageSize,
      search: this.searchQuery.trim() || undefined,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seriesList = response.data.content;
          this.totalElements = response.data.totalElements;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.hasError = true;
          this.errorMessage = extractErrorMessage(err, this.transloco, 'series.list.error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onTabChange(status: SeriesStatus | null): void {
    this.activeTab = status;
    this.pageIndex = 0;
    this.loadSeries();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSeries();
  }

  onSortByChange(sortBy: SeriesSortBy): void {
    this.sortBy = sortBy;
    this.pageIndex = 0;
    this.loadSeries();
  }

  onSortDirToggle(): void {
    this.sortDir = this.sortDir === 'ASC' ? 'DESC' : 'ASC';
    this.pageIndex = 0;
    this.loadSeries();
  }

  onStatusChange(series: UserSeries, status: SeriesStatus): void {
    this.seriesService.updateStatus(series.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seriesList = this.seriesList.map(s =>
            s.id === series.id ? response.data : s
          );
          this.snackBar.open(this.transloco.translate('series.list.statusUpdated'), '✓', { duration: 2000 });
          this.cdr.detectChanges();
        },
        error: () => { } // el interceptor ya muestra el error
      });
  }

  onRatingChange(series: UserSeries, rating: number): void {
    this.seriesService.updateRating(series.id, { rating })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seriesList = this.seriesList.map(s =>
            s.id === series.id ? response.data : s
          );
          this.snackBar.open(this.transloco.translate('series.list.ratingSaved'), '✓', { duration: 2000 });
          this.cdr.detectChanges();
        },
        error: () => { }
      });
  }

  onDeleteRequest(series: UserSeries): void {
    confirmDeleteSeries(this.dialog, this.transloco, series.title)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteSeries(series);
      });
  }

  onCardClick(series: UserSeries): void {
    this.router.navigate(['/series', series.id]);
  }

  onSearchInput(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }

  onAddSeries(): void {
    this.router.navigate(['/series/search']);
  }

  private deleteSeries(series: UserSeries): void {
    this.seriesService.delete(series.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(this.transloco.translate('series.list.deleted'), '✓', { duration: 2000 });
          this.loadSeries();
        },
        error: () => { }
      });
  }
}
