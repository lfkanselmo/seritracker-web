import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import {
  UserSeries,
  SeriesStatus,
  STATUS_CONFIG,
  STATUS_CLASS,
  calculateProgressPercent,
} from '../../../core/models/series.model';
import { SeriesStatusPipe } from '../../pipes/series-status.pipe';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-series-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    SeriesStatusPipe,
    StarRatingComponent,
    TranslocoModule,
  ],
  templateUrl: './series-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './series-card.component.scss',
})
export class SeriesCardComponent {
  @Input({ required: true }) series!: UserSeries;

  @Output() statusChange = new EventEmitter<SeriesStatus>();
  @Output() ratingChange = new EventEmitter<number>();
  @Output() deleteRequest = new EventEmitter<void>();
  @Output() cardClick = new EventEmitter<void>();

  readonly statusConfig = STATUS_CONFIG;
  readonly statuses = Object.keys(STATUS_CONFIG) as SeriesStatus[];

  get progressPercent(): number {
    return calculateProgressPercent(this.series.watchedEpisodes, this.series.totalEpisodes);
  }

  get statusEntries() {
    return this.statuses.filter((s) => s !== this.series.status);
  }

  get statusClass(): string {
    return STATUS_CLASS[this.series.status];
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
