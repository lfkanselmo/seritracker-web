import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoService } from '@jsverse/transloco';
import { Observable } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirm: string;
  cancel: string;
}

export function confirmDeleteSeries(
  dialog: MatDialog,
  transloco: TranslocoService,
  seriesTitle: string,
): Observable<boolean | undefined> {
  const dialogRef = dialog.open(ConfirmDialogComponent, {
    width: '380px',
    data: {
      title: transloco.translate('dialog.deleteSeriesTitle'),
      message: transloco.translate('dialog.deleteSeriesMessage', { title: seriesTitle }),
      confirm: transloco.translate('dialog.delete'),
      cancel: transloco.translate('dialog.cancel'),
    },
  });

  return dialogRef.afterClosed();
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
