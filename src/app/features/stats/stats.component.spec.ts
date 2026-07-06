import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { StatsComponent } from './stats.component';
import { StatsService } from '../../core/services/stats.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserStats } from '../../core/models/stats.model';
import { i18nTestingModule } from '../../core/testing/i18n-testing';

describe('StatsComponent', () => {
    let component: StatsComponent;
    let statsServiceMock: { getStats: ReturnType<typeof vi.fn> };

    const buildStats = (overrides: Partial<UserStats> = {}): UserStats => ({
        totalEpisodesWatched: 120,
        totalMinutesWatched: 5400,
        totalSeriesTracked: 8,
        totalSeriesCompleted: 3,
        currentYear: {
            year: 2026,
            episodesWatched: 40,
            topGenres: [{ genre: 'Drama', episodeCount: 30 }],
            mostWatchedSeriesTitle: 'Breaking Bad',
            mostWatchedSeriesEpisodeCount: 20,
            longestStreakDays: 5,
        },
        ...overrides,
    });

    const response = (data: UserStats) => ({ success: true, data, message: 'OK', timestamp: '' });

    beforeEach(() => {
        statsServiceMock = { getStats: vi.fn().mockReturnValue(of(response(buildStats()))) };

        TestBed.configureTestingModule({
            imports: [StatsComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: StatsService, useValue: statsServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
            ]
        });

        const fixture = TestBed.createComponent(StatsComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('loadStats', () => {
        it('should load stats on init', () => {
            component.ngOnInit();

            expect(statsServiceMock.getStats).toHaveBeenCalled();
            expect(component.stats?.totalEpisodesWatched).toBe(120);
            expect(component.isLoading).toBe(false);
        });

        it('should set an error state when the request fails', () => {
            statsServiceMock.getStats.mockReturnValue(throwError(() => ({ error: { message: 'boom' } })));

            component.loadStats();

            expect(component.hasError).toBe(true);
            expect(component.errorMessage).toBe('boom');
            expect(component.isLoading).toBe(false);
        });
    });

    describe('formatWatchTime', () => {
        it('should format minutes under a day as hours', () => {
            expect(component.formatWatchTime(125)).toBe('2h');
        });

        it('should format minutes over a day as days and hours', () => {
            expect(component.formatWatchTime(1500)).toBe('1d 1h');
        });

        it('should return 0h when there is no watch time', () => {
            expect(component.formatWatchTime(0)).toBe('0h');
        });
    });
});
