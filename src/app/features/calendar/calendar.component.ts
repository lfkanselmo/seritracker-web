import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpcomingEpisode, formatEpisodeCode } from '../../core/models/series.model';
import { CalendarService } from '../../core/services/calendar.service';
import { LanguageService } from '../../core/services/language.service';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { extractErrorMessage } from '../../core/utils/http-error.util';
import { pageFadeIn, listStagger, fadeIn } from '../../shared/animations/app.animations';

interface CalendarDayGroup {
  date: string;
  isToday: boolean;
  isTomorrow: boolean;
  episodes: UpcomingEpisode[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    MatIconModule,
    MatProgressSpinnerModule,
    NavbarComponent,
    TranslocoModule,
  ],
  animations: [pageFadeIn, listStagger, fadeIn],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private calendarService = inject(CalendarService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private transloco = inject(TranslocoService);
  private languageService = inject(LanguageService);

  upcomingEpisodes: UpcomingEpisode[] = [];

  isLoading = false;
  hasError = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUpcoming();
  }

  get groupedByDate(): CalendarDayGroup[] {
    const groups: CalendarDayGroup[] = [];

    for (const episode of this.upcomingEpisodes) {
      const last = groups[groups.length - 1];
      if (last && last.date === episode.airDate) {
        last.episodes.push(episode);
      } else {
        groups.push({
          date: episode.airDate,
          isToday: episode.isToday,
          isTomorrow: episode.isTomorrow,
          episodes: [episode]
        });
      }
    }

    return groups;
  }

  episodeCode(seasonNumber: number, episodeNumber: number): string {
    return formatEpisodeCode(seasonNumber, episodeNumber);
  }

  formatDayHeader(dateStr: string): string {
    const locale = this.languageService.lang() === 'en' ? 'en-US' : 'es-ES';
    const formatted = new Intl.DateTimeFormat(locale, {
      weekday: 'long', day: 'numeric', month: 'long'
    }).format(new Date(dateStr + 'T00:00:00'));
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  loadUpcoming(): void {
    this.isLoading = true;
    this.hasError = false;

    this.calendarService.getUpcoming()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.upcomingEpisodes = response.data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.hasError = true;
          this.errorMessage = extractErrorMessage(err, this.transloco, 'calendar.error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onEpisodeClick(episode: UpcomingEpisode): void {
    this.router.navigate(['/series', episode.userSeriesId]);
  }
}
