import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserSeries, SeriesStatus, STATUS_CONFIG, SeasonProgress, NextEpisode, EpisodeInfo } from '../../../core/models/series.model';
import { SeriesService } from '../../../core/services/series.service';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { SeriesStatusPipe } from '../../../shared/pipes/series-status.pipe';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { pageFadeIn, fadeIn } from '../../../shared/animations/app.animations';

@Component({
  selector: 'app-series-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatCheckboxModule,
    NavbarComponent,
    StarRatingComponent,
    SeriesStatusPipe,
    TranslocoModule,
  ],
  animations: [pageFadeIn, fadeIn],
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
  private transloco = inject(TranslocoService);

  // Estado de datos
  series: UserSeries | null = null;
  seasons: SeasonProgress[] = [];
  nextEpisode: NextEpisode | null = null;
  seasonEpisodes: Record<number, EpisodeInfo[]> = {};

  // Estado de UI
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isLoadingSeasons = false;
  loadingSeasonNumber: number | null = null;

  notesDraft = '';
  isSavingNotes = false;

  readonly statusConfig = STATUS_CONFIG;
  readonly statuses = Object.keys(STATUS_CONFIG) as SeriesStatus[];

  get progressPercent(): number {
    if (!this.series?.totalEpisodes) return 0;
    return Math.round((this.series.watchedEpisodes / this.series.totalEpisodes) * 100);
  }

  get notesDirty(): boolean {
    return this.notesDraft !== (this.series?.notes ?? '');
  }

  get statusClass(): string {
    const map: Record<SeriesStatus, string> = {
      WATCHING: 'watching',
      WANT_TO_WATCH: 'want-to',
      COMPLETED: 'completed',
      ABANDONED: 'abandoned',
    };
    return this.series ? map[this.series.status] : '';
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
          this.notesDraft = response.data.notes ?? '';
          this.isLoading = false;
          this.cdr.detectChanges();
          this.loadSeasonsSummary();
        },
        error: (err) => {
          this.hasError = true;
          this.errorMessage = err.error?.message ?? this.transloco.translate('series.detail.error');
          this.isLoading = false;
        }
      });
  }

  loadSeasonsSummary(): void {
    if (!this.series) return;

    this.isLoadingSeasons = true;
    this.cdr.detectChanges();
    this.seriesService.getSeasonsSummary(this.series.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seasons = response.data.seasons;
          this.nextEpisode = response.data.nextEpisode;
          this.isLoadingSeasons = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingSeasons = false;
          this.cdr.detectChanges();
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
          this.snackBar.open(this.transloco.translate('series.detail.statusUpdated'), '✓', { duration: 2000 });
        },
        error: () => { }
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
          this.snackBar.open(this.transloco.translate('series.detail.ratingSaved'), '✓', { duration: 2000 });
        },
        error: () => { }
      });
  }

  episodeCode(seasonNumber: number, episodeNumber: number): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `S${pad(seasonNumber)}E${pad(episodeNumber)}`;
  }

  isFutureAirDate(airDate: string | null): boolean {
    if (!airDate) return false;
    return new Date(airDate) > new Date();
  }

  onSeasonExpand(seasonNumber: number): void {
    if (!this.series || this.seasonEpisodes[seasonNumber]) return;

    this.loadingSeasonNumber = seasonNumber;
    this.cdr.detectChanges();
    this.seriesService.getSeasonEpisodes(this.series.id, seasonNumber)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.seasonEpisodes = { ...this.seasonEpisodes, [seasonNumber]: response.data.episodes };
          this.loadingSeasonNumber = null;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingSeasonNumber = null;
          this.cdr.detectChanges();
        }
      });
  }

  onToggleEpisode(seasonNumber: number, episode: EpisodeInfo): void {
    if (!this.series) return;
    const watched = !episode.watched;

    this.seriesService.markEpisode(this.series.id, seasonNumber, episode.episodeNumber, watched)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.applyEpisodeWatched(seasonNumber, episode.episodeNumber, watched);
          this.cdr.detectChanges();
          this.loadSeasonsSummary();
        },
        error: () => { }
      });
  }

  onMarkSeasonWatched(season: SeasonProgress): void {
    if (!this.series) return;
    const episodeNumbers = Array.from({ length: season.episodeCount }, (_, i) => i + 1);

    this.seriesService.markSeasonWatched(this.series.id, season.seasonNumber, episodeNumbers)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          const episodes = this.seasonEpisodes[season.seasonNumber];
          if (episodes) {
            this.seasonEpisodes = {
              ...this.seasonEpisodes,
              [season.seasonNumber]: episodes.map(e => ({ ...e, watched: true }))
            };
          }
          this.cdr.detectChanges();
          this.loadSeasonsSummary();
        },
        error: () => { }
      });
  }

  onMarkNextEpisodeWatched(): void {
    if (!this.series || !this.nextEpisode) return;
    const { seasonNumber, episodeNumber } = this.nextEpisode;

    this.seriesService.markEpisode(this.series.id, seasonNumber, episodeNumber, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.applyEpisodeWatched(seasonNumber, episodeNumber, true);
          this.cdr.detectChanges();
          this.loadSeasonsSummary();
        },
        error: () => { }
      });
  }

  onNotesInput(event: Event): void {
    this.notesDraft = (event.target as HTMLTextAreaElement).value;
  }

  onSaveNotes(): void {
    if (!this.series) return;

    this.isSavingNotes = true;
    this.seriesService.updateNotes(this.series.id, { notes: this.notesDraft })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.series = response.data;
          this.notesDraft = response.data.notes ?? '';
          this.isSavingNotes = false;
          this.cdr.detectChanges();
          this.snackBar.open(this.transloco.translate('series.detail.notesSaved'), '✓', { duration: 2000 });
        },
        error: () => {
          this.isSavingNotes = false;
          this.cdr.detectChanges();
        }
      });
  }

  onDeleteRequest(): void {
    if (!this.series) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: this.transloco.translate('dialog.deleteSeriesTitle'),
        message: this.transloco.translate('dialog.deleteSeriesMessage', { title: this.series.title }),
        confirm: this.transloco.translate('dialog.delete'),
        cancel: this.transloco.translate('dialog.cancel')
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

  private applyEpisodeWatched(seasonNumber: number, episodeNumber: number, watched: boolean): void {
    const episodes = this.seasonEpisodes[seasonNumber];
    if (!episodes) return;

    this.seasonEpisodes = {
      ...this.seasonEpisodes,
      [seasonNumber]: episodes.map(e => e.episodeNumber === episodeNumber ? { ...e, watched } : e)
    };
  }

  private deleteSeries(): void {
    if (!this.series) return;

    this.seriesService.delete(this.series.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open(this.transloco.translate('series.detail.deleted'), '✓', { duration: 2000 });
          this.router.navigate(['/series']);
        },
        error: () => { }
      });
  }
}