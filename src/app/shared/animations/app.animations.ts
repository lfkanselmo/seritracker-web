import {
    trigger,
    transition,
    style,
    animate,
    query,
    stagger,
    group,
} from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
]);

export const pageFadeIn = trigger('pageFadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 }))
    ])
]);

export const listStagger = trigger('listStagger', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            stagger('40ms', [
                animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ], { optional: true }),
        query(':leave', [
            stagger('30ms', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(-80%)' }))
            ])
        ], { optional: true })
    ])
]);

export const tabFade = trigger('tabFade', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('250ms 50ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
    ])
]);

export const routeAnimations = trigger('routeAnimations', [
    transition('* <=> *', [
        query(':enter, :leave', [
            style({ position: 'absolute', width: '100%' })
        ], { optional: true }),
        group([
            query(':leave', [
                animate('200ms ease-out', style({ opacity: 0 }))
            ], { optional: true }),
            query(':enter', [
                style({ opacity: 0 }),
                animate('250ms 100ms ease-out', style({ opacity: 1 }))
            ], { optional: true })
        ])
    ])
]);