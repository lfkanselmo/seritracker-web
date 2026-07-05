import { TranslocoTestingModule } from '@jsverse/transloco';
import es from '../../../assets/i18n/es.json';
import en from '../../../assets/i18n/en.json';

export function i18nTestingModule() {
  return TranslocoTestingModule.forRoot({
    langs: { es, en },
    translocoConfig: { availableLangs: ['es', 'en'], defaultLang: 'es' },
    preloadLangs: true,
  });
}
