import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { StatsService } from './stats.service';
import { UserStats } from '../models/stats.model';

describe('StatsService', () => {
    let service: StatsService;
    let httpClientMock: { get: ReturnType<typeof vi.fn> };

    const mockStats: UserStats = {
        totalEpisodesWatched: 120,
        totalMinutesWatched: 5400,
        totalSeriesTracked: 8,
        totalSeriesCompleted: 3,
        currentStreakDays: 5,
        badges: [{ code: 'FIRST_EPISODE', earned: true, progressCurrent: 1, progressTarget: 1 }],
        currentYear: {
            year: 2026,
            episodesWatched: 40,
            topGenres: [{ genre: 'Drama', episodeCount: 30 }],
            mostWatchedSeriesTitle: 'Breaking Bad',
            mostWatchedSeriesEpisodeCount: 20,
            longestStreakDays: 5,
        },
    };

    beforeEach(() => {
        httpClientMock = { get: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                StatsService,
                { provide: HttpClient, useValue: httpClientMock }
            ]
        });

        service = TestBed.inject(StatsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getStats', () => {
        it('should call GET /stats', () => {
            httpClientMock.get.mockReturnValue(of({ success: true, data: mockStats, message: 'OK', timestamp: '' }));

            service.getStats().subscribe(response => {
                expect(response.data.totalEpisodesWatched).toBe(120);
                expect(response.data.currentYear.mostWatchedSeriesTitle).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/stats')
            );
        });
    });
});
