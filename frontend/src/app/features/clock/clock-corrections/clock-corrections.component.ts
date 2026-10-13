import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClockCorrection } from '../types/clock.types';
import { ClockCorrectionService } from '../services/clock-correction.service';
import { NotificationService } from '@app/services/notification.service';
import { ButtonComponent } from '@shared-components/button/button.component';
import { CardComponent } from '@shared-components/card/card.component';
import { BadgeComponent } from '@shared-components/badge/badge.component';

/**
 * Admin-only approval screen for pending clock corrections (S7).
 * Renders nothing for non-admin callers, so OPERATOR never sees
 * approve/reject controls nor triggers the ADMIN-only pending endpoint.
 */
@Component({
  selector: 'app-clock-corrections',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
    @if (isAdmin()) {
      <app-card>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-nero">Correcciones pendientes</h2>
          <app-badge [status]="'PENDING'" />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fecha corrección</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Usuario</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Obra</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fichaje original</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Hora corregida</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Motivo</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (correction of corrections(); track correction.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-mono text-sm text-nero">{{ formatDate(correction.correctionDate) }}</td>
                  <td class="py-3 px-4 text-steel">{{ correction.userName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ correction.projectName || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="clockTypeLabel(correction.originalClockType)" />
                  </td>
                  <td class="py-3 px-4 font-mono text-sm text-nero">{{ formatTime(correction.correctedTime) }}</td>
                  <td class="py-3 px-4 text-steel">{{ correction.reason }}</td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <app-button variant="text" size="sm" (click)="approve(correction)">Aprobar</app-button>
                    <app-button variant="text" size="sm" (click)="reject(correction)">Rechazar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-steel">No hay correcciones pendientes.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>
    }
  `,
})
export class ClockCorrectionsComponent implements OnInit {
  /** False hides the whole screen; the pending endpoint is ADMIN-only. */
  isAdmin = input(false);

  corrections = signal<ClockCorrection[]>([]);

  private destroyRef = inject(DestroyRef);
  private correctionService = inject(ClockCorrectionService);
  private notifications = inject(NotificationService);

  ngOnInit(): void {
    if (this.isAdmin()) this.loadPending();
  }

  loadPending(): void {
    this.correctionService.getPending().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.corrections.set(data),
      error: () => this.notifications.error('No se pudieron cargar las correcciones pendientes.'),
    });
  }

  approve(correction: ClockCorrection): void {
    this.decide(() => this.correctionService.approve(correction.id!), 'Corrección aprobada.');
  }

  reject(correction: ClockCorrection): void {
    this.decide(() => this.correctionService.reject(correction.id!), 'Corrección rechazada.');
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const [year, month, day] = value.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }

  formatTime(value?: string): string {
    if (!value) return '—';
    const time = value.split('T')[1];
    return time ? time.slice(0, 5) : '—';
  }

  clockTypeLabel(clockType?: string): string {
    return clockType === 'EXIT' ? 'SALIDA' : 'ENTRADA';
  }

  private decide(call: () => ReturnType<ClockCorrectionService['approve']>, successMessage: string): void {
    call().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.success(successMessage);
        this.loadPending();
      },
      error: () => this.notifications.error('No se pudo resolver la corrección.'),
    });
  }
}
