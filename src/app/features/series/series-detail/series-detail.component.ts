import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserSeries, SeriesStatus, STATUS_CONFIG } from '../../../core/models/series.model';
import { SeriesService } from '../../../core/services/series.service';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { SeriesStatusPipe } from '../../../shared/pipes/series-status.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarComponent,
    StarRatingComponent,
    SeriesStatusPipe,
  ],
  templateUrl: './series-detail.component.html',
  styleUrl: './series-detail.component.scss'
})
export class SeriesDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seriesService = inject(SeriesService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  // Estado de datos
  series: UserSeries | null = null;

  // Estado de UI
  isLoading = false;
  hasError = false;
  errorMessage = '';

  readonly statusConfig = STATUS_CONFIG;
  readonly statuses = Object.keys(STATUS_CONFIG) as SeriesStatus[];

  get progressPercent(): number {
    if (!this.series?.totalEpisodes) return 0;
    return Math.round((this.series.watchedEpisodes / this.series.totalEpisodes) * 100);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSeries(id);
  }

  loadSeries(id: number): void {
    this.isLoading = true;
    this.hasError = false;

    this.seriesService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage = err.error?.message ?? 'Error al cargar la serie';
          this.isLoading = false;
        }
      });
  }

  onStatusChange(status: SeriesStatus): void {
    if (!this.series) return;

    this.seriesService.updateStatus(this.series.id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.cdr.detectChanges();
          this.snackBar.open('Estado actualizado', '✓', { duration: 2000 });
        },
        error: () => this.snackBar.open('Error al actualizar estado', '✕', { duration: 3000 })
      });
  }

  onRatingChange(rating: number): void {
    if (!this.series) return;

    this.seriesService.updateRating(this.series.id, { rating })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.cdr.detectChanges();
          this.snackBar.open('Calificación guardada', '✓', { duration: 2000 });
        },
        error: () => this.snackBar.open('Error al calificar', '✕', { duration: 3000 })
      });
  }

  onEpisodesChange(delta: number): void {
    if (!this.series) return;

    const newValue = Math.min(
      this.series.totalEpisodes,
      Math.max(0, this.series.watchedEpisodes + delta)
    );

    this.updateEpisodes(newValue);
  }

  onEpisodesInput(event: Event): void {
    if (!this.series) return;

    const value = Number((event.target as HTMLInputElement).value);
    const newValue = Math.min(this.series.totalEpisodes, Math.max(0, value));
    this.updateEpisodes(newValue);
  }

  onMarkAllWatched(): void {
    if (!this.series) return;
    this.updateEpisodes(this.series.totalEpisodes);
  }

  onDeleteRequest(): void {
    if (!this.series) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: '¿Eliminar serie?',
        message: `¿Estás seguro de que quieres eliminar "${this.series.title}" de tu lista?`,
        confirm: 'Eliminar',
        cancel: 'Cancelar'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) this.deleteSeries();
      });
  }

  onBack(): void {
    this.router.navigate(['/series']);
  }

  private updateEpisodes(watchedEpisodes: number): void {
    if (!this.series) return;

    this.seriesService.updateEpisodes(this.series.id, { watchedEpisodes })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.cdr.detectChanges();
        },
        error: () => this.snackBar.open('Error al actualizar episodios', '✕', { duration: 3000 })
      });
  }

  private deleteSeries(): void {
    if (!this.series) return;

    this.seriesService.delete(this.series.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Serie eliminada', '✓', { duration: 2000 });
          this.router.navigate(['/series']);
        },
        error: () => this.snackBar.open('Error al eliminar', '✕', { duration: 3000 })
      });
  }
}