import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SeriesCardComponent } from './series-card.component';
import { UserSeries } from '../../../core/models/series.model';

describe('SeriesCardComponent', () => {
    let component: SeriesCardComponent;

    const mockSeries: UserSeries = {
        id: 1,
        tmdbId: 1396,
        title: 'Breaking Bad',
        posterUrl: 'https://image.tmdb.org/t/p/w300/poster.jpg',
        status: 'WATCHING',
        rating: null,
        watchedEpisodes: 31,
        totalEpisodes: 62,
        network: 'AMC',
        notes: null,
        createdAt: '2026-04-29T00:00:00',
        updatedAt: '2026-04-29T00:00:00',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SeriesCardComponent]
        });

        const fixture = TestBed.createComponent(SeriesCardComponent);
        component = fixture.componentInstance;
        component.series = { ...mockSeries };
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('progressPercent', () => {
        it('should compute the percentage of watched episodes', () => {
            expect(component.progressPercent).toBe(50);
        });

        it('should return 0 when totalEpisodes is 0', () => {
            component.series = { ...mockSeries, totalEpisodes: 0 };
            expect(component.progressPercent).toBe(0);
        });
    });

    describe('statusEntries', () => {
        it('should exclude the current status from the list', () => {
            expect(component.statusEntries).not.toContain('WATCHING');
            expect(component.statusEntries).toHaveLength(3);
        });
    });

    describe('event emitters', () => {
        it('should emit cardClick', () => {
            let emitted = false;
            component.cardClick.subscribe(() => emitted = true);

            component.onCardClick();

            expect(emitted).toBe(true);
        });

        it('should emit statusChange with the new status', () => {
            let emitted: string | undefined;
            component.statusChange.subscribe(s => emitted = s);

            component.onStatusChange('COMPLETED');

            expect(emitted).toBe('COMPLETED');
        });

        it('should emit ratingChange with the new rating', () => {
            let emitted: number | undefined;
            component.ratingChange.subscribe(r => emitted = r);

            component.onRatingChange(9);

            expect(emitted).toBe(9);
        });

        it('should emit deleteRequest', () => {
            let emitted = false;
            component.deleteRequest.subscribe(() => emitted = true);

            component.onDeleteRequest();

            expect(emitted).toBe(true);
        });
    });
});
