import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SeriesStatus } from '../../core/models/series.model';

@Pipe({
  name: 'seriesStatus',
  standalone: true,
  pure: false,
})
export class SeriesStatusPipe implements PipeTransform {
  private transloco = inject(TranslocoService);

  transform(status: SeriesStatus): string {
    return this.transloco.translate(`status.${status}`);
  }
}
