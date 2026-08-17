import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

// Provisto a nivel de componente (no providedIn:'root') para que
// @angular/material/paginator siga viviendo solo en el chunk lazy de
// SeriesListComponent en vez de colarse al bundle inicial.
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private transloco = inject(TranslocoService);

  constructor() {
    super();
    // selectTranslateObject (a diferencia de translate()) espera a que el
    // idioma este realmente cargado antes de emitir, asi que no hay riesgo
    // de quedarse con la clave sin traducir en el primer cambio de idioma.
    this.transloco.selectTranslateObject('paginator').subscribe((labels) => {
      this.itemsPerPageLabel = labels.itemsPerPage;
      this.nextPageLabel = labels.nextPage;
      this.previousPageLabel = labels.previousPage;
      this.firstPageLabel = labels.firstPage;
      this.lastPageLabel = labels.lastPage;
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.transloco.translate('paginator.rangeLabelEmpty', { length });
    }
    const safeLength = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < safeLength ? Math.min(startIndex + pageSize, safeLength) : startIndex + pageSize;
    return this.transloco.translate('paginator.rangeLabel', {
      start: startIndex + 1,
      end: endIndex,
      length: safeLength,
    });
  };
}
