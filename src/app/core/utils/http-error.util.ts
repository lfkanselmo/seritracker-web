import { HttpErrorResponse } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';

export function extractErrorMessage(err: HttpErrorResponse, transloco: TranslocoService, fallbackKey: string): string {
  return err.error?.message ?? transloco.translate(fallbackKey);
}
