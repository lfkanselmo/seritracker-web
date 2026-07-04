import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SeriesDetailComponent } from './series-detail.component';
import { SeriesService } from '../../../core/services/series.service';
import { UserSeries } from '../../../core/models/series.model';

describe('SeriesDetailComponent', () => {
    let component: SeriesDetailComponent;
    let seriesServiceMock: {
        getById: ReturnType<typeof vi.fn>;
        updateStatus: ReturnType<typeof vi.fn>;
        updateRating: ReturnType<typeof vi.fn>;
        updateEpisodes: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    let snackBarMock: { open: ReturnType<typeof vi.fn> };
    let dialogMock: { open: ReturnType<typeof vi.fn> };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const mockSeries: UserSeries = {
        id: 1,
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        status: 'WATCHING',
        rating: null,
        watchedEpisodes: 10,
        totalEpisodes: 62,
        network: 'AMC',
        notes: null,
        createdAt: '2026-04-29T00:00:00',
        updatedAt: '2026-04-29T00:00:00',
    };

    function setup(): void {
        const fixture = TestBed.createComponent(SeriesDetailComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    }

    beforeEach(() => {
        seriesServiceMock = {
            getById: vi.fn().mockReturnValue(of({ success: true, data: mockSeries, message: 'OK', timestamp: '' })),
            updateStatus: vi.fn(),
            updateRating: vi.fn(),
            updateEpisodes: vi.fn(),
            delete: vi.fn(),
        };
        snackBarMock = { open: vi.fn() };
        dialogMock = { open: vi.fn() };

        TestBed.configureTestingModule({
            imports: [SeriesDetailComponent],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: SeriesService, useValue: seriesServiceMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: MatDialog, useValue: dialogMock },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => '1' } } }
                },
            ]
        });
    });

    it('should be created', () => {
        setup();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit / loadSeries', () => {
        it('should load the series using the id from the route', () => {
            setup();
            component.ngOnInit();

            expect(seriesServiceMock.getById).toHaveBeenCalledWith(1);
            expect(component.series).toEqual(mockSeries);
            expect(component.isLoading).toBe(false);
        });

        it('should set an error state when loading fails', () => {
            seriesServiceMock.getById.mockReturnValue(throwError(() => ({ error: { message: 'Series not found with id: 1' } })));
            setup();

            component.ngOnInit();

            expect(component.hasError).toBe(true);
            expect(component.errorMessage).toBe('Series not found with id: 1');
        });
    });

    describe('progressPercent', () => {
        it('should return 0 before the series loads', () => {
            setup();
            expect(component.progressPercent).toBe(0);
        });

        it('should compute the watched percentage', () => {
            setup();
            component.ngOnInit();
            expect(component.progressPercent).toBe(16);
        });
    });

    describe('onStatusChange', () => {
        it('should do nothing when there is no series loaded', () => {
            setup();
            component.onStatusChange('COMPLETED');
            expect(seriesServiceMock.updateStatus).not.toHaveBeenCalled();
        });

        it('should update the status and show a confirmation', () => {
            setup();
            component.ngOnInit();
            const updated = { ...mockSeries, status: 'COMPLETED' as const };
            seriesServiceMock.updateStatus.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));

            component.onStatusChange('COMPLETED');

            expect(seriesServiceMock.updateStatus).toHaveBeenCalledWith(1, { status: 'COMPLETED' });
            expect(component.series).toEqual(updated);
            expect(snackBarMock.open).toHaveBeenCalledWith('Estado actualizado', '✓', { duration: 2000 });
        });
    });

    describe('onEpisodesChange', () => {
        it('should clamp the new value between 0 and totalEpisodes', () => {
            setup();
            component.ngOnInit();
            seriesServiceMock.updateEpisodes.mockReturnValue(of({ success: true, data: mockSeries, message: 'OK', timestamp: '' }));

            component.onEpisodesChange(100);

            expect(seriesServiceMock.updateEpisodes).toHaveBeenCalledWith(1, { watchedEpisodes: 62 });
        });

        it('should not go below 0', () => {
            setup();
            component.ngOnInit();
            seriesServiceMock.updateEpisodes.mockReturnValue(of({ success: true, data: mockSeries, message: 'OK', timestamp: '' }));

            component.onEpisodesChange(-100);

            expect(seriesServiceMock.updateEpisodes).toHaveBeenCalledWith(1, { watchedEpisodes: 0 });
        });
    });

    describe('onMarkAllWatched', () => {
        it('should set watchedEpisodes to totalEpisodes', () => {
            setup();
            component.ngOnInit();
            seriesServiceMock.updateEpisodes.mockReturnValue(of({ success: true, data: mockSeries, message: 'OK', timestamp: '' }));

            component.onMarkAllWatched();

            expect(seriesServiceMock.updateEpisodes).toHaveBeenCalledWith(1, { watchedEpisodes: 62 });
        });
    });

    describe('onDeleteRequest', () => {
        it('should delete the series and navigate away when confirmed', () => {
            setup();
            component.ngOnInit();
            dialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
            seriesServiceMock.delete.mockReturnValue(of({ success: true, data: null, message: 'Deleted', timestamp: '' }));

            component.onDeleteRequest();

            expect(seriesServiceMock.delete).toHaveBeenCalledWith(1);
            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });

        it('should not delete the series when the dialog is cancelled', () => {
            setup();
            component.ngOnInit();
            dialogMock.open.mockReturnValue({ afterClosed: () => of(false) });

            component.onDeleteRequest();

            expect(seriesServiceMock.delete).not.toHaveBeenCalled();
        });
    });

    describe('onBack', () => {
        it('should navigate to the series list', () => {
            setup();
            component.onBack();
            expect(navigateSpy).toHaveBeenCalledWith(['/series']);
        });
    });
});
