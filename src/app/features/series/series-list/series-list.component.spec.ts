import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SeriesListComponent } from './series-list.component';
import { SeriesService } from '../../../core/services/series.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UserSeries } from '../../../core/models/series.model';
import { i18nTestingModule } from '../../../core/testing/i18n-testing';

describe('SeriesListComponent', () => {
    let component: SeriesListComponent;
    let seriesServiceMock: {
        getAll: ReturnType<typeof vi.fn>;
        updateStatus: ReturnType<typeof vi.fn>;
        updateRating: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    let dialogMock: { open: ReturnType<typeof vi.fn> };
    let snackBarMock: { open: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const buildSeries = (id: number, title: string): UserSeries => ({
        id,
        tmdbId: 1000 + id,
        title,
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        status: 'WATCHING',
        rating: null,
        watchedEpisodes: 0,
        totalEpisodes: 10,
        network: 'AMC',
        notes: null,
        createdAt: '2026-04-29T00:00:00',
        updatedAt: '2026-04-29T00:00:00',
    });

    const pageResponse = (content: UserSeries[], totalElements = content.length) => ({
        success: true,
        data: { content, page: 0, size: 20, totalElements, totalPages: 1 },
        message: 'OK',
        timestamp: ''
    });

    beforeEach(() => {
        seriesServiceMock = {
            getAll: vi.fn().mockReturnValue(of(pageResponse([buildSeries(1, 'Breaking Bad'), buildSeries(2, 'Better Call Saul')]))),
            updateStatus: vi.fn(),
            updateRating: vi.fn(),
            delete: vi.fn(),
        };
        dialogMock = { open: vi.fn() };
        snackBarMock = { open: vi.fn() };

        TestBed.configureTestingModule({
            imports: [SeriesListComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: SeriesService, useValue: seriesServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
                { provide: MatDialog, useValue: dialogMock },
                { provide: MatSnackBar, useValue: snackBarMock },
            ]
        });

        const fixture = TestBed.createComponent(SeriesListComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('loadSeries', () => {
        it('should populate the list and total on success', () => {
            component.loadSeries();

            expect(seriesServiceMock.getAll).toHaveBeenCalledWith(undefined, 0, 20);
            expect(component.seriesList).toHaveLength(2);
            expect(component.totalElements).toBe(2);
            expect(component.isLoading).toBe(false);
        });

        it('should set an error state on failure', () => {
            seriesServiceMock.getAll.mockReturnValue(throwError(() => ({ error: { message: 'boom' } })));

            component.loadSeries();

            expect(component.hasError).toBe(true);
            expect(component.errorMessage).toBe('boom');
            expect(component.isLoading).toBe(false);
        });
    });

    describe('filteredSeries', () => {
        beforeEach(() => component.loadSeries());

        it('should return the full list when there is no search query', () => {
            expect(component.filteredSeries).toHaveLength(2);
        });

        it('should filter by title (case-insensitive)', () => {
            component.searchQuery = 'breaking';
            expect(component.filteredSeries).toHaveLength(1);
            expect(component.filteredSeries[0].title).toBe('Breaking Bad');
        });
    });

    describe('onTabChange', () => {
        it('should reset the page index and reload with the new status filter', () => {
            component.pageIndex = 3;

            component.onTabChange('WATCHING');

            expect(component.activeTab).toBe('WATCHING');
            expect(component.pageIndex).toBe(0);
            expect(seriesServiceMock.getAll).toHaveBeenCalledWith('WATCHING', 0, 20);
        });
    });

    describe('onPageChange', () => {
        it('should update page index/size and reload', () => {
            const event: PageEvent = { pageIndex: 2, pageSize: 50, length: 100 };

            component.onPageChange(event);

            expect(component.pageIndex).toBe(2);
            expect(component.pageSize).toBe(50);
            expect(seriesServiceMock.getAll).toHaveBeenCalledWith(undefined, 2, 50);
        });
    });

    describe('onStatusChange', () => {
        it('should update the matching series in place', () => {
            component.loadSeries();
            const updated = { ...buildSeries(1, 'Breaking Bad'), status: 'COMPLETED' as const };
            seriesServiceMock.updateStatus.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));

            component.onStatusChange(component.seriesList[0], 'COMPLETED');

            expect(component.seriesList[0].status).toBe('COMPLETED');
            expect(snackBarMock.open).toHaveBeenCalledWith('Estado actualizado', '✓', { duration: 2000 });
        });
    });

    describe('onRatingChange', () => {
        it('should update the matching series rating in place', () => {
            component.loadSeries();
            const updated = { ...buildSeries(1, 'Breaking Bad'), rating: 9 };
            seriesServiceMock.updateRating.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));

            component.onRatingChange(component.seriesList[0], 9);

            expect(component.seriesList[0].rating).toBe(9);
        });
    });

    describe('onDeleteRequest', () => {
        it('should delete and reload the list when confirmed', () => {
            component.loadSeries();
            dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
            seriesServiceMock.delete.mockReturnValue(of({ success: true, data: null, message: 'Deleted', timestamp: '' }));

            component.onDeleteRequest(component.seriesList[0]);

            expect(seriesServiceMock.delete).toHaveBeenCalledWith(1);
            expect(snackBarMock.open).toHaveBeenCalledWith('Serie eliminada', '✓', { duration: 2000 });
            // loadSeries se llama de nuevo tras borrar: una vez en ngOnInit/loadSeries inicial + una tras el delete
            expect(seriesServiceMock.getAll).toHaveBeenCalledTimes(2);
        });

        it('should not delete when the dialog is cancelled', () => {
            component.loadSeries();
            dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

            component.onDeleteRequest(component.seriesList[0]);

            expect(seriesServiceMock.delete).not.toHaveBeenCalled();
        });
    });

    describe('onCardClick', () => {
        it('should navigate to the series detail page', () => {
            component.onCardClick(buildSeries(1, 'Breaking Bad'));
            expect(navigateSpy).toHaveBeenCalledWith(['/series', 1]);
        });
    });

    describe('onAddSeries', () => {
        it('should navigate to the search page', () => {
            component.onAddSeries();
            expect(navigateSpy).toHaveBeenCalledWith(['/series/search']);
        });
    });
});
