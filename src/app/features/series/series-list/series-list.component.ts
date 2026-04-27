import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserSeries, SeriesStatus, STATUS_CONFIG } from '../../../core/models/series.model';
import { SeriesService } from '../../../core/services/series.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { SeriesCardComponent } from '../../../shared/components/series-card/series-card.component';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    NavbarComponent,
    SeriesCardComponent,
  ],
  templateUrl: './series-list.component.html',
  styleUrl: './series-list.component.scss'
})
export class SeriesListComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private seriesService = inject(SeriesService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Estado de datos
  seriesList: UserSeries[] = [];

  // Estado de UI
  isLoading = false;
  hasError = false;
  errorMessage = '';
  activeTab: SeriesStatus | null = null;
  searchQuery = '';
  showSearch = false;

  stats = {
    total: 0,
    watching: 0,
    wantTo: 0,
    completed: 0,
    abandoned: 0,
  };

  readonly tabs = [
    { label: 'Todas', status: null },
    { label: 'Viendo', status: 'WATCHING' as SeriesStatus },
    { label: 'Por ver', status: 'WANT_TO_WATCH' as SeriesStatus },
    { label: 'Completadas', status: 'COMPLETED' as SeriesStatus },
    { label: 'Abandonadas', status: 'ABANDONED' as SeriesStatus },
  ];

  readonly statusConfig = STATUS_CONFIG;

  get userId(): number {
    return this.authService.getUserId()!;
  }

  get filteredSeries(): UserSeries[] {
    if (!this.searchQuery.trim()) return this.seriesList;
    return this.seriesList.filter(s =>
      s.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  ngOnInit(): void {
    this.loadSeries();
  }

  loadSeries(): void {
    this.isLoading = true;
    this.hasError = false;

    this.seriesService.getAll(this.userId, this.activeTab ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seriesList = response.data;
          this.isLoading = false;
          this.recalculateStats();
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage = err.error?.message ?? 'Error al cargar las series';
          this.isLoading = false;
        }
      });
  }

  onTabChange(status: SeriesStatus | null): void {
    this.activeTab = status;
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
          this.recalculateStats();
          this.snackBar.open('Estado actualizado', '✓', { duration: 2000 });
        },
        error: () => this.snackBar.open('Error al actualizar estado', '✕', { duration: 3000 })
      });
  }

  private recalculateStats(): void {
    this.stats = {
      total: this.seriesList.length,
      watching: this.seriesList.filter(s => s.status === 'WATCHING').length,
      wantTo: this.seriesList.filter(s => s.status === 'WANT_TO_WATCH').length,
      completed: this.seriesList.filter(s => s.status === 'COMPLETED').length,
      abandoned: this.seriesList.filter(s => s.status === 'ABANDONED').length,
    };
    this.cdr.detectChanges();
  }

  onRatingChange(series: UserSeries, rating: number): void {
    this.seriesService.updateRating(series.id, { rating })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seriesList = this.seriesList.map(s =>
            s.id === series.id ? response.data : s
          );
          this.snackBar.open('Calificación guardada', '✓', { duration: 2000 });
        },
        error: () => this.snackBar.open('Error al calificar', '✕', { duration: 3000 })
      });
  }

  onDeleteRequest(series: UserSeries): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: '¿Eliminar serie?',
        message: `¿Estás seguro de que quieres eliminar "${series.title}" de tu lista?`,
        confirm: 'Eliminar',
        cancel: 'Cancelar'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteSeries(series);
      });
  }

  onCardClick(series: UserSeries): void {
    this.router.navigate(['/series', series.id]);
  }

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
  }

  onAddSeries(): void {
    this.router.navigate(['/series/search']);
  }

  private deleteSeries(series: UserSeries): void {
    this.seriesService.delete(series.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.seriesList = this.seriesList.filter(s => s.id !== series.id);
          this.recalculateStats();
          this.snackBar.open('Serie eliminada', '✓', { duration: 2000 });
        },
        error: () => this.snackBar.open('Error al eliminar', '✕', { duration: 3000 })
      });
  }
}