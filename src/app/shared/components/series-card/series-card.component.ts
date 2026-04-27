import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserSeries, SeriesStatus, STATUS_CONFIG } from '../../../core/models/series.model';
import { SeriesStatusPipe } from '../../pipes/series-status.pipe';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-series-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    SeriesStatusPipe,
    StarRatingComponent,
  ],
  templateUrl: './series-card.component.html',
  styleUrl:    './series-card.component.scss'
})
export class SeriesCardComponent {

  @Input({ required: true }) series!: UserSeries;

  @Output() statusChange   = new EventEmitter<SeriesStatus>();
  @Output() ratingChange   = new EventEmitter<number>();
  @Output() deleteRequest  = new EventEmitter<void>();
  @Output() cardClick      = new EventEmitter<void>();

  readonly statusConfig = STATUS_CONFIG;
  readonly statuses = Object.keys(STATUS_CONFIG) as SeriesStatus[];

  get progressPercent(): number {
    if (!this.series.totalEpisodes) return 0;
    return Math.round((this.series.watchedEpisodes / this.series.totalEpisodes) * 100);
  }

  get statusEntries() {
    return this.statuses.filter(s => s !== this.series.status);
  }

  onCardClick(): void {
    this.cardClick.emit();
  }

  onStatusChange(status: SeriesStatus): void {
    this.statusChange.emit(status);
  }

  onRatingChange(rating: number): void {
    this.ratingChange.emit(rating);
  }

  onDeleteRequest(): void {
    this.deleteRequest.emit();
  }
}