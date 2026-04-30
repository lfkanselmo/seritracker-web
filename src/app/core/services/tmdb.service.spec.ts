import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { TmdbService } from './tmdb.service';
import { TmdbSeries } from '../models/series.model';

describe('TmdbService', () => {
    let service: TmdbService;
    let httpClientMock: { get: ReturnType<typeof vi.fn> };

    const mockTmdbSeries: TmdbSeries = {
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        genres: ['Drama', 'Crimen'],
        network: 'AMC',
        totalEpisodes: 62,
    };

    const mockListResponse = { success: true, data: [mockTmdbSeries], message: 'OK', timestamp: '' };
    const mockSingleResponse = { success: true, data: mockTmdbSeries, message: 'OK', timestamp: '' };

    beforeEach(() => {
        httpClientMock = { get: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                TmdbService,
                { provide: HttpClient, useValue: httpClientMock }
            ]
        });

        service = TestBed.inject(TmdbService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('search', () => {
        it('should call GET /tmdb/search with query param', () => {
            httpClientMock.get.mockReturnValue(of(mockListResponse));

            service.search('Breaking Bad').subscribe(response => {
                expect(response.data).toHaveLength(1);
                expect(response.data[0].title).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/tmdb/search'),
                expect.objectContaining({ params: expect.anything() })
            );
        });

        it('should return empty results for unknown query', () => {
            httpClientMock.get.mockReturnValue(of({ success: true, data: [], message: 'OK', timestamp: '' }));

            service.search('xyzunknown').subscribe(response => {
                expect(response.data).toHaveLength(0);
            });
        });
    });

    describe('getDetails', () => {
        it('should call GET /tmdb/series/:tmdbId', () => {
            httpClientMock.get.mockReturnValue(of(mockSingleResponse));

            service.getDetails(1396).subscribe(response => {
                expect(response.data.tmdbId).toBe(1396);
                expect(response.data.title).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/tmdb/series/1396')
            );
        });
    });
});