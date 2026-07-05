import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SeriesSearchComponent } from './series-search.component';
import { TmdbService } from '../../../core/services/tmdb.service';
import { SeriesService } from '../../../core/services/series.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TmdbSeries } from '../../../core/models/series.model';

describe('SeriesSearchComponent', () => {
    let component: SeriesSearchComponent;
    let tmdbServiceMock: { search: ReturnType<typeof vi.fn> };
    let seriesServiceMock: { create: ReturnType<typeof vi.fn> };
    let snackBarMock: { open: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const mockResult: TmdbSeries = {
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        genres: ['Drama'],
        network: 'AMC',
        totalEpisodes: 62,
    };

    beforeEach(() => {
        vi.useFakeTimers();

        tmdbServiceMock = { search: vi.fn().mockReturnValue(of({ success: true, data: [mockResult], message: 'OK', timestamp: '' })) };
        seriesServiceMock = { create: vi.fn() };
        snackBarMock = { open: vi.fn() };

        TestBed.configureTestingModule({
            imports: [SeriesSearchComponent],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: TmdbService, useValue: tmdbServiceMock },
                { provide: SeriesService, useValue: seriesServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
                { provide: MatSnackBar, useValue: snackBarMock },
            ]
        });

        const fixture = TestBed.createComponent(SeriesSearchComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('search pipeline', () => {
        it('should search after debounce when the query has at least 2 characters', () => {
            component.searchControl.setValue('breaking');
            vi.advanceTimersByTime(400);

            expect(tmdbServiceMock.search).toHaveBeenCalledWith('breaking');
            expect(component.results).toEqual([mockResult]);
            expect(component.isSearching).toBe(false);
            expect(component.hasSearched).toBe(true);
        });

        it('should not search when the query is shorter than 2 characters', () => {
            component.searchControl.setValue('b');
            vi.advanceTimersByTime(400);

            expect(tmdbServiceMock.search).not.toHaveBeenCalled();
        });

        it('should show an error snack when the search fails', () => {
            tmdbServiceMock.search.mockReturnValue(throwError(() => new Error('network error')));

            component.searchControl.setValue('breaking');
            vi.advanceTimersByTime(400);

            expect(snackBarMock.open).toHaveBeenCalledWith('Error al buscar series', '✕', { duration: 3000 });
            expect(component.isSearching).toBe(false);
        });
    });

    describe('onAddSeries', () => {
        it('should show a success message and clear isAdding on success', () => {
            seriesServiceMock.create.mockReturnValue(of({ success: true, data: {}, message: 'Created', timestamp: '' }));

            component.onAddSeries(mockResult, 'WATCHING');

            expect(seriesServiceMock.create).toHaveBeenCalledWith({ tmdbId: 1396, status: 'WATCHING' });
            expect(snackBarMock.open).toHaveBeenCalledWith('"Breaking Bad" agregada a tu lista', '✓', { duration: 3000 });
            expect(component.isAdding).toBeNull();
        });

        it('should show an error message and clear isAdding on failure', () => {
            seriesServiceMock.create.mockReturnValue(throwError(() => ({ error: { message: 'Series with tmdbId 1396 already exists in user list' } })));

            component.onAddSeries(mockResult, 'WATCHING');

            expect(snackBarMock.open).toHaveBeenCalledWith(
                'Series with tmdbId 1396 already exists in user list', '✕', { duration: 3000 }
            );
            expect(component.isAdding).toBeNull();
        });
    });

    describe('onBack', () => {
        it('should navigate back to the series list', () => {
            component.onBack();
            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });
    });
});
