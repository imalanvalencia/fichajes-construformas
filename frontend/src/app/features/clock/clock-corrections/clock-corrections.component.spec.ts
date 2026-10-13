import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClockCorrectionsComponent } from './clock-corrections.component';
import { ClockCorrectionService } from '../services/clock-correction.service';
import { NotificationService } from '@app/services/notification.service';
import { ClockCorrection } from '../types/clock.types';

describe('ClockCorrectionsComponent', () => {
  let component: ClockCorrectionsComponent;
  let fixture: ComponentFixture<ClockCorrectionsComponent>;

  let correctionService: {
    getPending: ReturnType<typeof vi.fn>;
    approve: ReturnType<typeof vi.fn>;
    reject: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const correction: ClockCorrection = {
    id: 11,
    userId: 42,
    userName: 'Ana Operaria',
    projectId: 7,
    projectName: 'Obra Sol',
    originalEntryId: 3,
    correctionDate: '2026-10-10',
    originalClockType: 'ENTRY',
    correctedTime: '2026-10-10T08:15:00',
    reason: 'Olvidé fichar la entrada',
    status: 'PENDING',
  };

  const compile = async (isAdmin: boolean) => {
    await TestBed.configureTestingModule({
      imports: [ClockCorrectionsComponent],
      providers: [
        { provide: ClockCorrectionService, useValue: correctionService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockCorrectionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isAdmin', isAdmin);
    fixture.detectChanges();
  };

  beforeEach(() => {
    correctionService = {
      getPending: vi.fn().mockReturnValue(of([correction])),
      approve: vi.fn().mockReturnValue(of({ ...correction, status: 'APPROVED' })),
      reject: vi.fn().mockReturnValue(of({ ...correction, status: 'REJECTED' })),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
  });

  describe('ADMIN approval screen', () => {
    beforeEach(async () => await compile(true));

    it('loads the pending corrections on init', () => {
      expect(correctionService.getPending).toHaveBeenCalledTimes(1);
      expect(component.corrections()).toEqual([correction]);
    });

    it('renders the reason, corrected time and original fichaje of each pending correction', () => {
      const text: string = fixture.nativeElement.textContent;
      expect(text).toContain('Ana Operaria');
      expect(text).toContain('Obra Sol');
      expect(text).toContain('Olvidé fichar la entrada');
      expect(text).toContain('10/10/2026');
      expect(text).toContain('08:15');
      expect(text).toContain('ENTRADA');
    });

    it('approves a correction, refreshes the list and notifies success', () => {
      correctionService.getPending = vi.fn().mockReturnValue(of([]));

      component.approve(correction);

      expect(correctionService.approve).toHaveBeenCalledWith(11);
      expect(notifications.success).toHaveBeenCalledTimes(1);
      expect(correctionService.getPending).toHaveBeenCalledTimes(1);
      expect(component.corrections()).toEqual([]);
    });

    it('rejects a correction, refreshes the list and notifies success', () => {
      correctionService.getPending = vi.fn().mockReturnValue(of([]));

      component.reject(correction);

      expect(correctionService.reject).toHaveBeenCalledWith(11);
      expect(notifications.success).toHaveBeenCalledTimes(1);
      expect(component.corrections()).toEqual([]);
    });

    it('surfaces a failed approval instead of swallowing the error', () => {
      correctionService.approve = vi.fn().mockReturnValue(throwError(() => new Error('boom')));

      component.approve(correction);

      expect(notifications.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('failed pending load', () => {
    it('surfaces the error instead of swallowing it', async () => {
      correctionService.getPending = vi.fn().mockReturnValue(throwError(() => new Error('boom')));
      await compile(true);

      expect(notifications.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('OPERATOR view', () => {
    beforeEach(async () => await compile(false));

    it('neither requests pending corrections nor renders approve/reject controls', () => {
      expect(correctionService.getPending).not.toHaveBeenCalled();

      const text: string = fixture.nativeElement.textContent;
      expect(text).not.toContain('Aprobar');
      expect(text).not.toContain('Rechazar');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  });
});
