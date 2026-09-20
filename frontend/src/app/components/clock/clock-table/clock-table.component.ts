import { Component, input, output } from '@angular/core';
import { ClockEntry } from '../../../features/clock/types/clock.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-clock-table',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
    <app-card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fecha/Hora</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Usuario</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Tipo</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Latitud</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Longitud</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Notas</th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (entry of entries(); track entry.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 font-mono text-sm text-nero">{{ formatTimestamp(entry.timestamp) }}</td>
                <td class="py-3 px-4 text-steel">{{ entry.userName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ entry.projectName || '—' }}</td>
                <td class="py-3 px-4">
                  <app-badge [status]="entry.clockType === 'ENTRY' ? 'ACTIVE' : 'INACTIVE'" />
                </td>
                <td class="py-3 px-4 text-steel font-mono text-xs">{{ entry.userLatitude?.toFixed(6) }}</td>
                <td class="py-3 px-4 text-steel font-mono text-xs">{{ entry.userLongitude?.toFixed(6) }}</td>
                <td class="py-3 px-4 text-steel">{{ entry.notes || '—' }}</td>
                <td class="py-3 px-4 text-right">
                  <app-button variant="text" size="sm" (click)="onDelete.emit(entry.id!)">Eliminar</app-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="py-8 text-center text-steel">No hay fichajes registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class ClockTableComponent {
  entries = input<ClockEntry[]>([]);

  onDelete = output<number>();

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
