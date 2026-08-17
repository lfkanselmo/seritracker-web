import { trigger, transition, style, animate, query, stagger, group } from '@angular/animations';

// Estos valores replican los tokens --dur-*/--ease-* de styles.scss:
// Angular parsea el timing de animate() del lado del cliente y no
// puede resolver custom properties de CSS ahi, asi que se duplican
// como constantes en vez de referenciarlas.
const DUR_FAST = '120ms';
const DUR_BASE = '200ms';
const DUR_SLOW = '320ms';
const EASE_STANDARD = 'cubic-bezier(0.2, 0, 0, 1)';
const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate(`${DUR_SLOW} ${EASE_SPRING}`, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const pageFadeIn = trigger('pageFadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(`${DUR_BASE} ${EASE_STANDARD}`, style({ opacity: 1 })),
  ]),
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    group([
      query(
        ':leave',
        [animate(`${DUR_BASE} ${EASE_STANDARD}`, style({ opacity: 0, transform: 'scale(0.9)' }))],
        { optional: true },
      ),
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY(10px) scale(0.96)' }),
          stagger('40ms', [
            animate(
              `${DUR_SLOW} ${EASE_SPRING}`,
              style({ opacity: 1, transform: 'translateY(0) scale(1)' }),
            ),
          ]),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);

export const tabFade = trigger('tabFade', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(6px)' }),
    animate(`${DUR_BASE} 50ms ${EASE_SPRING}`, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
  transition(':leave', [animate(`${DUR_FAST} ${EASE_STANDARD}`, style({ opacity: 0 }))]),
]);

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter, :leave', [style({ position: 'absolute', width: '100%' })], { optional: true }),
    group([
      query(':leave', [animate(`${DUR_BASE} ${EASE_STANDARD}`, style({ opacity: 0 }))], {
        optional: true,
      }),
      query(
        ':enter',
        [
          style({ opacity: 0 }),
          animate(`${DUR_BASE} 100ms ${EASE_STANDARD}`, style({ opacity: 1 })),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
