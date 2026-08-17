import { TestBed } from '@angular/core/testing';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { TranslatedPaginatorIntl } from './translated-paginator-intl.service';

const ES_PAGINATOR = {
  itemsPerPage: 'Elementos por página',
  nextPage: 'Página siguiente',
  previousPage: 'Página anterior',
  firstPage: 'Primera página',
  lastPage: 'Última página',
  rangeLabel: '{{start}} – {{end}} de {{length}}',
  rangeLabelEmpty: '0 de {{length}}',
};

const EN_PAGINATOR = {
  itemsPerPage: 'Items per page',
  nextPage: 'Next page',
  previousPage: 'Previous page',
  firstPage: 'First page',
  lastPage: 'Last page',
  rangeLabel: '{{start}} – {{end}} of {{length}}',
  rangeLabelEmpty: '0 of {{length}}',
};

describe('TranslatedPaginatorIntl', () => {
  let transloco: TranslocoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: { paginator: ES_PAGINATOR }, en: { paginator: EN_PAGINATOR } },
          translocoConfig: { availableLangs: ['es', 'en'], defaultLang: 'es' },
          preloadLangs: true,
        }),
      ],
      providers: [TranslatedPaginatorIntl],
    });
    transloco = TestBed.inject(TranslocoService);
  });

  it('sets the labels in the active language on creation', () => {
    const intl = TestBed.inject(TranslatedPaginatorIntl);

    expect(intl.itemsPerPageLabel).toBe('Elementos por página');
    expect(intl.nextPageLabel).toBe('Página siguiente');
    expect(intl.firstPageLabel).toBe('Primera página');
  });

  it('updates the labels and notifies subscribers when the language changes', () => {
    const intl = TestBed.inject(TranslatedPaginatorIntl);
    const emitted: void[] = [];
    intl.changes.subscribe(() => emitted.push(undefined));

    transloco.setActiveLang('en');

    expect(intl.itemsPerPageLabel).toBe('Items per page');
    expect(emitted.length).toBeGreaterThan(0);
  });

  it('builds the range label with the translated template', () => {
    const intl = TestBed.inject(TranslatedPaginatorIntl);

    expect(intl.getRangeLabel(0, 20, 45)).toBe('1 – 20 de 45');
    expect(intl.getRangeLabel(2, 20, 45)).toBe('41 – 45 de 45');
  });

  it('uses the empty range label when there is nothing to show', () => {
    const intl = TestBed.inject(TranslatedPaginatorIntl);

    expect(intl.getRangeLabel(0, 20, 0)).toBe('0 de 0');
  });
});
