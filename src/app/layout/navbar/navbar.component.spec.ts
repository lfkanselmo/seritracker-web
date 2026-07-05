import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { Notification } from '../../core/models/series.model';
import { i18nTestingModule } from '../../core/testing/i18n-testing';

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let authServiceMock: {
        getUserName: ReturnType<typeof vi.fn>;
        isLoggedIn: ReturnType<typeof vi.fn>;
        logout: ReturnType<typeof vi.fn>;
    };
    let notificationServiceMock: {
        getUnread: ReturnType<typeof vi.fn>;
        markAsRead: ReturnType<typeof vi.fn>;
    };
    let themeServiceMock: {
        theme: ReturnType<typeof vi.fn>;
        toggle: ReturnType<typeof vi.fn>;
    };
    let languageServiceMock: {
        lang: ReturnType<typeof vi.fn>;
        toggle: ReturnType<typeof vi.fn>;
    };
    let navigateSpy: ReturnType<typeof vi.spyOn>;

    const buildNotification = (id: number, read: boolean): Notification => ({
        id,
        tmdbId: 1396,
        seriesTitle: 'Breaking Bad',
        episodeCode: 'S01E01',
        airDate: '2026-01-01',
        sentAt: '2026-01-01T00:00:00',
        read,
        isToday: false,
        isTomorrow: false,
    });

    beforeEach(() => {
        authServiceMock = {
            getUserName: vi.fn().mockReturnValue('Test User'),
            isLoggedIn: vi.fn().mockReturnValue(true),
            logout: vi.fn(),
        };
        notificationServiceMock = {
            getUnread: vi.fn().mockReturnValue(of({
                success: true,
                data: { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0 },
                message: 'OK',
                timestamp: ''
            })),
            markAsRead: vi.fn().mockReturnValue(of({ success: true, data: null, message: 'OK', timestamp: '' })),
        };
        themeServiceMock = {
            theme: vi.fn().mockReturnValue('dark'),
            toggle: vi.fn(),
        };
        languageServiceMock = {
            lang: vi.fn().mockReturnValue('es'),
            toggle: vi.fn(),
        };

        TestBed.configureTestingModule({
            imports: [NavbarComponent, i18nTestingModule()],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
                { provide: NotificationService, useValue: notificationServiceMock },
                { provide: ThemeService, useValue: themeServiceMock },
                { provide: LanguageService, useValue: languageServiceMock },
            ]
        });

        const fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should expose the username from AuthService', () => {
        expect(component.userName).toBe('Test User');
    });

    describe('ngOnInit', () => {
        it('should load notifications when logged in', () => {
            component.ngOnInit();
            expect(notificationServiceMock.getUnread).toHaveBeenCalled();
        });

        it('should not load notifications when not logged in', () => {
            authServiceMock.isLoggedIn.mockReturnValue(false);
            component.ngOnInit();
            expect(notificationServiceMock.getUnread).not.toHaveBeenCalled();
        });
    });

    describe('unreadCount', () => {
        it('should count only unread notifications', () => {
            component.notifications = [
                buildNotification(1, false),
                buildNotification(2, true),
                buildNotification(3, false),
            ];
            expect(component.unreadCount).toBe(2);
        });
    });

    describe('loadNotifications', () => {
        it('should populate notifications from the response content', () => {
            const notifications = [buildNotification(1, false)];
            notificationServiceMock.getUnread.mockReturnValue(of({
                success: true,
                data: { content: notifications, page: 0, size: 50, totalElements: 1, totalPages: 1 },
                message: 'OK',
                timestamp: ''
            }));

            component.loadNotifications();

            expect(component.notifications).toEqual(notifications);
        });

        it('should not throw when the request fails', () => {
            notificationServiceMock.getUnread.mockReturnValue(throwError(() => new Error('network error')));

            expect(() => component.loadNotifications()).not.toThrow();
        });
    });

    describe('onMarkAsRead', () => {
        it('should mark the notification as read locally', () => {
            component.notifications = [buildNotification(1, false), buildNotification(2, false)];
            const event = { stopPropagation: vi.fn() } as unknown as Event;

            component.onMarkAsRead(component.notifications[0], event);

            expect(event.stopPropagation).toHaveBeenCalled();
            expect(component.notifications[0].read).toBe(true);
            expect(component.notifications[1].read).toBe(false);
        });
    });

    describe('onLogout', () => {
        it('should log out and navigate to the login page', () => {
            component.onLogout();

            expect(authServiceMock.logout).toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
        });
    });

    describe('themeService', () => {
        it('should expose the current theme', () => {
            expect(component.themeService.theme()).toBe('dark');
        });

        it('should delegate toggling to ThemeService', () => {
            component.themeService.toggle();
            expect(themeServiceMock.toggle).toHaveBeenCalled();
        });
    });

    describe('languageService', () => {
        it('should expose the current language', () => {
            expect(component.languageService.lang()).toBe('es');
        });

        it('should delegate toggling to LanguageService', () => {
            component.languageService.toggle();
            expect(languageServiceMock.toggle).toHaveBeenCalled();
        });
    });
});
