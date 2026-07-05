import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { SeriesDetailComponent } from './series-detail.component';
import { SeriesService } from '../../../core/services/series.service';
import { ThemeService } from '../../../core/services/theme.service';
import { EpisodeInfo, SeasonProgress, UserSeries } from '../../../core/models/series.model';
import { i18nTestingModule } from '../../../core/testing/i18n-testing';

describe('SeriesDetailComponent', () => {
    let component: SeriesDetailComponent;
    let seriesServiceMock: {
        getById: ReturnType<typeof vi.fn>;
        updateStatus: ReturnType<typeof vi.fn>;
        updateRating: ReturnType<typeof vi.fn>;
        updateNotes: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        getSeasonsSummary: ReturnType<typeof vi.fn>;
        getSeasonEpisodes: ReturnType<typeof vi.fn>;
        markEpisode: ReturnType<typeof vi.fn>;
        markSeasonWatched: ReturnType<typeof vi.fn>;
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
            updateNotes: vi.fn(),
            delete: vi.fn(),
            getSeasonsSummary: vi.fn().mockReturnValue(of({
                success: true, data: { seasons: [], nextEpisode: null }, message: 'OK', timestamp: ''
            })),
            getSeasonEpisodes: vi.fn(),
            markEpisode: vi.fn(),
            markSeasonWatched: vi.fn(),
        };
        snackBarMock = { open: vi.fn() };
        dialogMock = { open: vi.fn() };

        TestBed.configureTestingModule({
            imports: [SeriesDetailComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                provideNoopAnimations(),
                { provide: SeriesService, useValue: seriesServiceMock },
                { provide: ThemeService, useValue: { theme: () => 'dark', toggle: vi.fn() } },
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

    describe('loadSeasonsSummary', () => {
        it('should populate seasons and next episode', () => {
            const summary = {
                seasons: [{ seasonNumber: 1, name: 'Season 1', episodeCount: 7, watchedCount: 3 }],
                nextEpisode: { seasonNumber: 1, episodeNumber: 4, title: 'Cancer Man', airDate: null }
            };
            seriesServiceMock.getSeasonsSummary.mockReturnValue(of({ success: true, data: summary, message: 'OK', timestamp: '' }));

            setup();
            component.ngOnInit();

            expect(seriesServiceMock.getSeasonsSummary).toHaveBeenCalledWith(1);
            expect(component.seasons).toEqual(summary.seasons);
            expect(component.nextEpisode).toEqual(summary.nextEpisode);
        });
    });

    describe('onSeasonExpand', () => {
        it('should fetch and cache the season episodes on first expand', () => {
            const episodes: EpisodeInfo[] = [
                { seasonNumber: 1, episodeNumber: 1, title: 'Pilot', airDate: null, watched: true }
            ];
            seriesServiceMock.getSeasonEpisodes.mockReturnValue(of({ success: true, data: { episodes }, message: 'OK', timestamp: '' }));
            setup();
            component.ngOnInit();

            component.onSeasonExpand(1);

            expect(seriesServiceMock.getSeasonEpisodes).toHaveBeenCalledWith(1, 1);
            expect(component.seasonEpisodes[1]).toEqual(episodes);
        });

        it('should not refetch when the season is already cached', () => {
            setup();
            component.ngOnInit();
            component.seasonEpisodes = { 1: [] };

            component.onSeasonExpand(1);

            expect(seriesServiceMock.getSeasonEpisodes).not.toHaveBeenCalled();
        });
    });

    describe('onToggleEpisode', () => {
        it('should mark the episode watched and refresh the summary', () => {
            const episode: EpisodeInfo = { seasonNumber: 1, episodeNumber: 1, title: 'Pilot', airDate: null, watched: false };
            const updated = { ...mockSeries, watchedEpisodes: 11 };
            seriesServiceMock.markEpisode.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));
            setup();
            component.ngOnInit();
            component.seasonEpisodes = { 1: [episode] };

            component.onToggleEpisode(1, episode);

            expect(seriesServiceMock.markEpisode).toHaveBeenCalledWith(1, 1, 1, true);
            expect(component.series).toEqual(updated);
            expect(component.seasonEpisodes[1][0].watched).toBe(true);
        });
    });

    describe('onMarkSeasonWatched', () => {
        it('should mark every episode of the season as watched', () => {
            const season: SeasonProgress = { seasonNumber: 1, name: 'Season 1', episodeCount: 3, watchedCount: 1 };
            const updated = { ...mockSeries, watchedEpisodes: 3 };
            seriesServiceMock.markSeasonWatched.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));
            setup();
            component.ngOnInit();

            component.onMarkSeasonWatched(season);

            expect(seriesServiceMock.markSeasonWatched).toHaveBeenCalledWith(1, 1, [1, 2, 3]);
            expect(component.series).toEqual(updated);
        });
    });

    describe('isFutureAirDate', () => {
        it('should return false when airDate is null', () => {
            setup();
            expect(component.isFutureAirDate(null)).toBe(false);
        });

        it('should return true for a date in the future', () => {
            setup();
            const future = new Date(Date.now() + 86400000).toISOString();
            expect(component.isFutureAirDate(future)).toBe(true);
        });

        it('should return false for a date in the past', () => {
            setup();
            expect(component.isFutureAirDate('2020-01-01')).toBe(false);
        });
    });

    describe('episodeCode', () => {
        it('should format the season/episode as SxxExx', () => {
            setup();
            expect(component.episodeCode(2, 3)).toBe('S02E03');
        });
    });

    describe('notesDirty', () => {
        it('should be false right after loading the series', () => {
            setup();
            component.ngOnInit();
            expect(component.notesDirty).toBe(false);
        });

        it('should be true after editing the notes draft', () => {
            setup();
            component.ngOnInit();
            component.notesDraft = 'new notes';
            expect(component.notesDirty).toBe(true);
        });
    });

    describe('onSaveNotes', () => {
        it('should do nothing when there is no series loaded', () => {
            setup();
            component.onSaveNotes();
            expect(seriesServiceMock.updateNotes).not.toHaveBeenCalled();
        });

        it('should save the notes and show a confirmation', () => {
            setup();
            component.ngOnInit();
            const updated = { ...mockSeries, notes: 'Great show' };
            seriesServiceMock.updateNotes.mockReturnValue(of({ success: true, data: updated, message: 'OK', timestamp: '' }));
            component.notesDraft = 'Great show';

            component.onSaveNotes();

            expect(seriesServiceMock.updateNotes).toHaveBeenCalledWith(1, { notes: 'Great show' });
            expect(component.series).toEqual(updated);
            expect(component.isSavingNotes).toBe(false);
            expect(snackBarMock.open).toHaveBeenCalledWith('Notas guardadas', '✓', { duration: 2000 });
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
