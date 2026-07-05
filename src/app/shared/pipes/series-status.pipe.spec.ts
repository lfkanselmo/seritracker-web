import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { SeriesStatusPipe } from './series-status.pipe';
import { i18nTestingModule } from '../../core/testing/i18n-testing';

describe('SeriesStatusPipe', () => {
    let pipe: SeriesStatusPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [i18nTestingModule()],
        });
        pipe = TestBed.runInInjectionContext(() => new SeriesStatusPipe());
    });

    it('should be created', () => {
        expect(pipe).toBeTruthy();
    });

    it('should transform WATCHING to "Viendo"', () => {
        expect(pipe.transform('WATCHING')).toBe('Viendo');
    });

    it('should transform WANT_TO_WATCH to "Por ver"', () => {
        expect(pipe.transform('WANT_TO_WATCH')).toBe('Por ver');
    });

    it('should transform COMPLETED to "Completada"', () => {
        expect(pipe.transform('COMPLETED')).toBe('Completada');
    });

    it('should transform ABANDONED to "Abandonada"', () => {
        expect(pipe.transform('ABANDONED')).toBe('Abandonada');
    });
});
