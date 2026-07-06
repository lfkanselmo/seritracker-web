import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { CalendarService } from './calendar.service';
import { UpcomingEpisode } from '../models/series.model';

describe('CalendarService', () => {
    let service: CalendarService;
    let httpClientMock: { get: ReturnType<typeof vi.fn> };

    const mockUpcomingEpisode: UpcomingEpisode = {
        userSeriesId: 1,
        tmdbId: 1396,
        seriesTitle: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        seasonNumber: 6,
        episodeNumber: 1,
        episodeTitle: 'Felina',
        airDate: '2026-08-01',
        isToday: false,
        isTomorrow: true,
    };

    beforeEach(() => {
        httpClientMock = { get: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                CalendarService,
                { provide: HttpClient, useValue: httpClientMock }
            ]
        });

        service = TestBed.inject(CalendarService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getUpcoming', () => {
        it('should call GET /calendar/upcoming', () => {
            httpClientMock.get.mockReturnValue(of({
                success: true, data: [mockUpcomingEpisode], message: 'OK', timestamp: ''
            }));

            service.getUpcoming().subscribe(response => {
                expect(response.data).toHaveLength(1);
                expect(response.data[0].seriesTitle).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/calendar/upcoming')
            );
        });

        it('should return an empty list when there is nothing upcoming', () => {
            httpClientMock.get.mockReturnValue(of({ success: true, data: [], message: 'OK', timestamp: '' }));

            service.getUpcoming().subscribe(response => {
                expect(response.data).toHaveLength(0);
            });
        });
    });
});
