import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
    let component: StarRatingComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StarRatingComponent]
        });

        const fixture = TestBed.createComponent(StarRatingComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should have 10 stars', () => {
        expect(component.stars).toHaveLength(10);
    });

    describe('displayValue', () => {
        it('should return 0 when no value and no hover', () => {
            expect(component.displayValue).toBe(0);
        });

        it('should return the value when there is no hover', () => {
            component.value = 7;
            expect(component.displayValue).toBe(7);
        });

        it('should prefer the hovered star over the value', () => {
            component.value = 7;
            component.hoveredStar = 3;
            expect(component.displayValue).toBe(3);
        });
    });

    describe('onHover', () => {
        it('should set hoveredStar when not readonly', () => {
            component.onHover(5);
            expect(component.hoveredStar).toBe(5);
        });

        it('should not set hoveredStar when readonly', () => {
            component.readonly = true;
            component.onHover(5);
            expect(component.hoveredStar).toBeNull();
        });
    });

    describe('onLeave', () => {
        it('should clear hoveredStar', () => {
            component.hoveredStar = 5;
            component.onLeave();
            expect(component.hoveredStar).toBeNull();
        });
    });

    describe('onSelect', () => {
        it('should emit ratingChange when not readonly', () => {
            let emitted: number | undefined;
            component.ratingChange.subscribe(v => emitted = v);

            component.onSelect(8);

            expect(emitted).toBe(8);
        });

        it('should not emit ratingChange when readonly', () => {
            component.readonly = true;
            let emitted: number | undefined;
            component.ratingChange.subscribe(v => emitted = v);

            component.onSelect(8);

            expect(emitted).toBeUndefined();
        });
    });
});
