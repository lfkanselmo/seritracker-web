import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CalendarComponent } from './calendar.component';
import { CalendarService } from '../../core/services/calendar.service';
import { ThemeService } from '../../core/services/theme.service';
import { UpcomingEpisode } from '../../core/models/series.model';
import { i18nTestingModule } from '../../core/testing/i18n-testing';

describe('CalendarComponent', () => {
    let component: CalendarComponent;
    let calendarServiceMock: { getUpcoming: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const buildEpisode = (overrides: Partial<UpcomingEpisode> = {}): UpcomingEpisode => ({
        userSeriesId: 1,
        tmdbId: 1396,
        seriesTitle: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        seasonNumber: 6,
        episodeNumber: 1,
        episodeTitle: 'Felina',
        airDate: '2026-08-01',
        isToday: false,
        isTomorrow: false,
        ...overrides,
    });

    const response = (data: UpcomingEpisode[]) => ({ success: true, data, message: 'OK', timestamp: '' });

    beforeEach(() => {
        calendarServiceMock = { getUpcoming: vi.fn().mockReturnValue(of(response([buildEpisode()]))) };

        TestBed.configureTestingModule({
            imports: [CalendarComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: CalendarService, useValue: calendarServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
            ]
        });

        const fixture = TestBed.createComponent(CalendarComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('loadUpcoming', () => {
        it('should load upcoming episodes on init', () => {
            component.ngOnInit();

            expect(calendarServiceMock.getUpcoming).toHaveBeenCalled();
            expect(component.upcomingEpisodes).toHaveLength(1);
            expect(component.isLoading).toBe(false);
        });

        it('should set an error state when the request fails', () => {
            calendarServiceMock.getUpcoming.mockReturnValue(throwError(() => ({ error: { message: 'boom' } })));

            component.loadUpcoming();

            expect(component.hasError).toBe(true);
            expect(component.errorMessage).toBe('boom');
            expect(component.isLoading).toBe(false);
        });
    });

    describe('groupedByDate', () => {
        it('should group consecutive episodes with the same air date', () => {
            calendarServiceMock.getUpcoming.mockReturnValue(of(response([
                buildEpisode({ userSeriesId: 1, airDate: '2026-08-01' }),
                buildEpisode({ userSeriesId: 2, airDate: '2026-08-01' }),
                buildEpisode({ userSeriesId: 3, airDate: '2026-08-03' }),
            ])));

            component.loadUpcoming();

            expect(component.groupedByDate).toHaveLength(2);
            expect(component.groupedByDate[0].episodes).toHaveLength(2);
            expect(component.groupedByDate[1].episodes).toHaveLength(1);
        });
    });

    describe('episodeCode', () => {
        it('should format season and episode as SxxExx', () => {
            expect(component.episodeCode(6, 1)).toBe('S06E01');
        });
    });

    describe('onEpisodeClick', () => {
        it('should navigate to the series detail page', () => {
            component.onEpisodeClick(buildEpisode({ userSeriesId: 42 }));

            expect(navigateSpy).toHaveBeenCalledWith(['/series', 42]);
        });
    });
});
