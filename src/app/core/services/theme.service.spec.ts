import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeService } from './theme.service';

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(prefersLight: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: prefersLight,
            media: query,
            // Angular CDK (BreakpointObserver) todavia usa la API legacy
            // addListener/removeListener ademas de la moderna — sin esto,
            // cualquier otro test que use CDK (ej. MatDialog) revienta.
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

describe('ThemeService', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            configurable: true,
            value: originalMatchMedia,
        });
    });

    it('should be created', () => {
        mockMatchMedia(false);
        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);
        expect(service).toBeTruthy();
    });

    it('should default to the stored theme when one exists', () => {
        localStorage.setItem('theme', 'light');
        mockMatchMedia(false);

        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);

        expect(service.theme()).toBe('light');
    });

    it('should default to the system preference when nothing is stored (light)', () => {
        mockMatchMedia(true);
        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);

        expect(service.theme()).toBe('light');
    });

    it('should default to dark when the system has no light preference and nothing is stored', () => {
        mockMatchMedia(false);
        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);

        expect(service.theme()).toBe('dark');
    });

    it('should apply the resolved theme to the <html> element on construction', () => {
        mockMatchMedia(true);
        TestBed.configureTestingModule({});
        TestBed.inject(ThemeService);

        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should toggle between light and dark and persist the choice', () => {
        mockMatchMedia(false);
        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);

        expect(service.theme()).toBe('dark');

        service.toggle();

        expect(service.theme()).toBe('light');
        expect(localStorage.getItem('theme')).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');

        service.toggle();

        expect(service.theme()).toBe('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should set an explicit theme and persist it', () => {
        mockMatchMedia(false);
        TestBed.configureTestingModule({});
        const service = TestBed.inject(ThemeService);

        service.setTheme('light');

        expect(service.theme()).toBe('light');
        expect(localStorage.getItem('theme')).toBe('light');
    });
});
