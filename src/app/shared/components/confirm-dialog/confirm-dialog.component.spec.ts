import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let dialogRefMock: { close: ReturnType<typeof vi.fn> };

    const mockData: ConfirmDialogData = {
        title: '¿Eliminar serie?',
        message: 'Esta acción no se puede deshacer',
        confirm: 'Eliminar',
        cancel: 'Cancelar',
    };

    beforeEach(() => {
        dialogRefMock = { close: vi.fn() };

        TestBed.configureTestingModule({
            imports: [ConfirmDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: mockData },
            ]
        });

        const fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should expose the injected dialog data', () => {
        expect(component.data).toEqual(mockData);
    });

    it('should close the dialog with false on cancel', () => {
        component.onCancel();
        expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog with true on confirm', () => {
        component.onConfirm();
        expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });
});
