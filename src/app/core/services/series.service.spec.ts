import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { SeriesService } from './series.service';
import { UserSeries } from '../models/series.model';

describe('SeriesService', () => {
    let service: SeriesService;
    let httpClientMock: { get: ReturnType<typeof vi.fn>, post: ReturnType<typeof vi.fn>, patch: ReturnType<typeof vi.fn>, delete: ReturnType<typeof vi.fn> };

    const mockUserSeries: UserSeries = {
        id: 1,
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        status: 'WATCHING',
        rating: null,
        watchedEpisodes: 0,
        totalEpisodes: 62,
        network: 'AMC',
        notes: null,
        createdAt: '2026-04-29T00:00:00',
        updatedAt: '2026-04-29T00:00:00',
    };

    const mockApiResponse = { success: true, data: mockUserSeries, message: 'OK', timestamp: '' };
    const mockListResponse = { success: true, data: [mockUserSeries], message: 'OK', timestamp: '' };

    beforeEach(() => {
        httpClientMock = {
            get: vi.fn(),
            post: vi.fn(),
            patch: vi.fn(),
            delete: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                SeriesService,
                { provide: HttpClient, useValue: httpClientMock }
            ]
        });

        service = TestBed.inject(SeriesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAll', () => {
        it('should call GET /series with userId', () => {
            httpClientMock.get.mockReturnValue(of(mockListResponse));

            service.getAll(1).subscribe(response => {
                expect(response.data).toHaveLength(1);
                expect(response.data[0].title).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/series'),
                expect.objectContaining({ params: expect.anything() })
            );
        });

        it('should call GET /series with userId and status filter', () => {
            httpClientMock.get.mockReturnValue(of(mockListResponse));

            service.getAll(1, 'WATCHING').subscribe();

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/series'),
                expect.objectContaining({ params: expect.anything() })
            );
        });
    });

    describe('getById', () => {
        it('should call GET /series/:id', () => {
            httpClientMock.get.mockReturnValue(of(mockApiResponse));

            service.getById(1).subscribe(response => {
                expect(response.data.id).toBe(1);
                expect(response.data.title).toBe('Breaking Bad');
            });

            expect(httpClientMock.get).toHaveBeenCalledWith(
                expect.stringContaining('/series/1')
            );
        });
    });

    describe('create', () => {
        it('should call POST /series with userId and request body', () => {
            httpClientMock.post.mockReturnValue(of(mockApiResponse));

            service.create(1, { tmdbId: 1396, status: 'WATCHING' }).subscribe(response => {
                expect(response.data.tmdbId).toBe(1396);
            });

            expect(httpClientMock.post).toHaveBeenCalledWith(
                expect.stringContaining('/series?userId=1'),
                expect.objectContaining({ tmdbId: 1396 })
            );
        });
    });

    describe('updateStatus', () => {
        it('should call PATCH /series/:id/status', () => {
            httpClientMock.patch.mockReturnValue(of(mockApiResponse));

            service.updateStatus(1, { status: 'COMPLETED' }).subscribe();

            expect(httpClientMock.patch).toHaveBeenCalledWith(
                expect.stringContaining('/series/1/status'),
                { status: 'COMPLETED' }
            );
        });
    });

    describe('updateRating', () => {
        it('should call PATCH /series/:id/rating', () => {
            httpClientMock.patch.mockReturnValue(of(mockApiResponse));

            service.updateRating(1, { rating: 9 }).subscribe();

            expect(httpClientMock.patch).toHaveBeenCalledWith(
                expect.stringContaining('/series/1/rating'),
                { rating: 9 }
            );
        });
    });

    describe('updateEpisodes', () => {
        it('should call PATCH /series/:id/episodes', () => {
            httpClientMock.patch.mockReturnValue(of(mockApiResponse));

            service.updateEpisodes(1, { watchedEpisodes: 10 }).subscribe();

            expect(httpClientMock.patch).toHaveBeenCalledWith(
                expect.stringContaining('/series/1/episodes'),
                { watchedEpisodes: 10 }
            );
        });
    });

    describe('delete', () => {
        it('should call DELETE /series/:id', () => {
            httpClientMock.delete.mockReturnValue(of({ success: true, data: null, message: 'Deleted', timestamp: '' }));

            service.delete(1).subscribe();

            expect(httpClientMock.delete).toHaveBeenCalledWith(
                expect.stringContaining('/series/1')
            );
        });
    });
});