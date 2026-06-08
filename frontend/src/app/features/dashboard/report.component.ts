import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { AuthService } from '../../core/services/auth.service';
import { ClockEntry } from '../../core/models/clock.models';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="border border-steel-grey p-6">
      <div class="flex items-center justify-between mb-4">
        <p class="font-mono text-xs tracking-widest text-steel-grey">MIS FICHAJES</p>
        @if (entries().length > 0) {
          <button (click)="exportCsv()"
            class="font-mono text-xs tracking-widest text-construction-red hover:text-nero cursor-pointer">
            EXPORTAR CSV
          </button>
        }
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">DESDE</label>
          <input type="date" [(ngModel)]="startDate" name="startDate"
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>
        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">HASTA</label>
          <input type="date" [(ngModel)]="endDate" name="endDate"
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>
      </div>

      <button (click)="loadEntries()"
        [disabled]="loading()"
        class="w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
               py-2 hover:bg-steel-grey disabled:opacity-50 cursor-pointer mb-4">
        {{ loading() ? 'BUSCANDO...' : 'BUSCAR' }}
      </button>

      @if (error()) {
        <p class="text-construction-red text-sm mb-4">{{ error() }}</p>
      }

      @if (entries().length > 0) {
        <div class="border border-steel-grey">
          <div class="grid grid-cols-4 gap-2 p-2 border-b border-steel-grey bg-white">
            <p class="font-mono text-xs tracking-widest text-steel-grey">FECHA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">HORA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">OBRA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">TIPO</p>
          </div>
          @for (entry of entries(); track entry.id) {
            <div class="grid grid-cols-4 gap-2 p-2 border-b border-steel-grey">
              <p class="font-mono text-xs text-nero">{{ formatDate(entry.timestamp) }}</p>
              <p class="font-mono text-xs text-nero">{{ formatTime(entry.timestamp) }}</p>
              <p class="font-poppins text-xs text-nero">{{ entry.project.name }}</p>
              <p class="font-mono text-xs" [class.text-green-600]="entry.clockType === 'ENTRY'" [class.text-construction-red]="entry.clockType === 'EXIT'">
                {{ entry.clockType === 'ENTRY' ? 'ENTRADA' : 'SALIDA' }}
              </p>
            </div>
          }
        </div>
        <p class="font-mono text-xs text-steel-grey mt-2 text-right">
          Total: {{ entries().length }} fichajes
        </p>
      } @else if (!loading() && entries().length === 0) {
        <p class="text-steel-grey text-sm text-center">Sin resultados</p>
      }
    </div>
  `,
})
export class ReportComponent {
  private reportService = inject(ReportService);
  private auth = inject(AuthService);

  entries = signal<ClockEntry[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  startDate = this.getDefaultStartDate();
  endDate = this.getDefaultEndDate();

  getDefaultStartDate(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadEntries(): void {
    const userId = this.auth.getUserId();
    if (!userId || !this.startDate || !this.endDate) return;

    this.loading.set(true);
    this.error.set(null);

    const start = `${this.startDate}T00:00:00`;
    const end = `${this.endDate}T23:59:59`;

    this.reportService.getUserEntries(userId, start, end).subscribe({
      next: (data) => {
        this.entries.set(data.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar fichajes');
        this.loading.set(false);
      },
    });
  }

  exportCsv(): void {
    const userId = this.auth.getUserId();
    this.reportService.exportToCsv(this.entries(), `fichajes_${userId}`);
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('es-ES');
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
