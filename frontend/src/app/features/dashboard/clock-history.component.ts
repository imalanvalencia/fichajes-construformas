import { Component, inject, signal, OnInit } from '@angular/core';
import { ClockEntryService } from '../../core/services/clock-entry.service';
import { AuthService } from '../../core/services/auth.service';
import { ClockEntry } from '../../core/models/clock.models';

@Component({
  selector: 'app-clock-history',
  standalone: true,
  template: `
    <div class="border border-steel-grey p-6">
      <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">HISTORIAL HOY</p>

      @if (loading()) {
        <p class="text-steel-grey text-sm">Cargando...</p>
      } @else if (entries().length === 0) {
        <p class="text-steel-grey text-sm">Sin fichajes hoy</p>
      } @else {
        <div class="space-y-3">
          @for (entry of entries(); track entry.id) {
            <div class="flex justify-between items-center border-b border-steel-grey pb-2">
              <div>
                <p class="font-poppins text-sm text-nero">{{ entry.project.name }}</p>
                <p class="font-mono text-xs text-steel-grey">
                  {{ entry.clockType === 'ENTRY' ? 'ENTRADA' : 'SALIDA' }}
                </p>
              </div>
              <p class="font-mono text-xs text-nero">{{ formatTime(entry.timestamp) }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ClockHistoryComponent implements OnInit {
  private clockService = inject(ClockEntryService);
  private auth = inject(AuthService);

  entries = signal<ClockEntry[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadTodayEntries();
  }

  loadTodayEntries(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    this.clockService.getUserEntries(userId, start, end).subscribe({
      next: (data) => {
        this.entries.set(data.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
