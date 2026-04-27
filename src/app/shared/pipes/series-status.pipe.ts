import { Pipe, PipeTransform } from '@angular/core';
import { SeriesStatus } from '../../core/models/series.model';

@Pipe({
  name: 'seriesStatus',
  standalone: true
})
export class SeriesStatusPipe implements PipeTransform {
  transform(status: SeriesStatus): string {
    const labels: Record<SeriesStatus, string> = {
      WATCHING:      'Viendo',
      WANT_TO_WATCH: 'Por ver',
      COMPLETED:     'Completada',
      ABANDONED:     'Abandonada'
    };
    return labels[status] ?? status;
  }
}