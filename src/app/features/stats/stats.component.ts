import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserStats, Badge, BadgeCode, BADGE_ICONS } from '../../core/models/stats.model';
import { StatsService } from '../../core/services/stats.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { extractErrorMessage } from '../../core/utils/http-error.util';
import { pageFadeIn, listStagger, fadeIn } from '../../shared/animations/app.animations';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarComponent,
    TranslocoModule,
  ],
  animations: [pageFadeIn, listStagger, fadeIn],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private statsService = inject(StatsService);
  private cdr = inject(ChangeDetectorRef);
  private transloco = inject(TranslocoService);

  stats: UserStats | null = null;

  isLoading = false;
  hasError = false;
  errorMessage = '';

  readonly badgeIcons = BADGE_ICONS;

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.hasError = false;

    this.statsService.getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.stats = response.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.hasError = true;
          this.errorMessage = extractErrorMessage(err, this.transloco, 'stats.error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  formatWatchTime(totalMinutes: number): string {
    if (!totalMinutes) return '0h';

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }

  badgeIcon(code: BadgeCode): string {
    return this.badgeIcons[code];
  }

  trackBadge(_index: number, badge: Badge): BadgeCode {
    return badge.code;
  }
}
