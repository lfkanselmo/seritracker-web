import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

// Provisto a nivel de componente (no providedIn:'root') para que
// @angular/material/paginator siga viviendo solo en el chunk lazy de
// SeriesListComponent en vez de colarse al bundle inicial.
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private transloco = inject(TranslocoService);
  private rangeLabelTemplate = '';
  private rangeLabelEmptyTemplate = '';

  constructor() {
    super();
    // Se guardan las plantillas ya resueltas en vez de llamar a translate()
    // de nuevo dentro de getRangeLabel: esa segunda llamada es sincronica y,
    // si corria antes de que el idioma nuevo terminara de cargar, devolvia
    // la clave sin traducir en vez del texto.
    this.transloco.selectTranslateObject('paginator').subscribe((labels) => {
      this.itemsPerPageLabel = labels.itemsPerPage;
      this.nextPageLabel = labels.nextPage;
      this.previousPageLabel = labels.previousPage;
      this.firstPageLabel = labels.firstPage;
      this.lastPageLabel = labels.lastPage;
      this.rangeLabelTemplate = labels.rangeLabel;
      this.rangeLabelEmptyTemplate = labels.rangeLabelEmpty;
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.rangeLabelEmptyTemplate.replace('{{length}}', String(length));
    }
    const safeLength = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < safeLength ? Math.min(startIndex + pageSize, safeLength) : startIndex + pageSize;
    return this.rangeLabelTemplate
      .replace('{{start}}', String(startIndex + 1))
      .replace('{{end}}', String(endIndex))
      .replace('{{length}}', String(safeLength));
  };
}
