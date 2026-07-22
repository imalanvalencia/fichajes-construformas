import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.models';
import { ClockEntry } from '../../core/models/clock.models';

@Component({
  selector: 'app-admin-report',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <h2 class="font-poppins text-3xl font-bold text-nero">REPORTES</h2>
        @if (entries().length > 0) {
          <button (click)="exportCsv()"
            class="font-mono text-xs tracking-widest text-construction-red hover:text-nero cursor-pointer">
            EXPORTAR CSV
          </button>
        }
      </div>

      <div class="border border-steel-grey p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">USUARIO</label>
            <select [(ngModel)]="selectedUserId" name="userId"
              class="w-full border border-steel-grey p-2 bg-white text-nero">
              <option [ngValue]="null">Todos los usuarios</option>
              @for (u of users(); track u.id) {
                <option [ngValue]="u.id">{{ u.name }} ({{ u.email }})</option>
              }
            </select>
          </div>
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
          class="mt-4 w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
                 py-2 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
          {{ loading() ? 'BUSCANDO...' : 'BUSCAR' }}
        </button>
      </div>

      @if (error()) {
        <p class="text-construction-red text-sm mb-4">{{ error() }}</p>
      }

      @if (entries().length > 0) {
        <div class="border border-steel-grey">
          <div class="grid grid-cols-5 gap-2 p-2 border-b border-steel-grey bg-white">
            <p class="font-mono text-xs tracking-widest text-steel-grey">USUARIO</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">FECHA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">HORA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">OBRA</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">TIPO</p>
          </div>
          @for (entry of entries(); track entry.id) {
            <div class="grid grid-cols-5 gap-2 p-2 border-b border-steel-grey">
              <p class="font-poppins text-xs text-nero">{{ entry.user.name }}</p>
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
      } @else if (!loading()) {
        <p class="text-steel-grey text-sm text-center">Sin resultados</p>
      }
    </div>
  `,
})
export class AdminReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private adminService = inject(AdminService);

  entries = signal<ClockEntry[]>([]);
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedUserId: number | null = null;
  startDate = this.getDefaultStartDate();
  endDate = this.getDefaultEndDate();

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => this.users.set(data),
    });
  }

  getDefaultStartDate(): string {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  loadEntries(): void {
    this.loading.set(true);
    this.error.set(null);

    const start = `${this.startDate}T00:00:00`;
    const end = `${this.endDate}T23:59:59`;

    if (this.selectedUserId) {
      this.reportService.getUserEntries(this.selectedUserId, start, end).subscribe({
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
    } else {
      const allUsers = this.users();
      let allEntries: ClockEntry[] = [];
      let completed = 0;

      if (allUsers.length === 0) {
        this.loading.set(false);
        return;
      }

      for (const user of allUsers) {
        this.reportService.getUserEntries(user.id, start, end).subscribe({
          next: (data) => {
            allEntries = [...allEntries, ...data];
            completed++;
            if (completed === allUsers.length) {
              this.entries.set(allEntries.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              ));
              this.loading.set(false);
            }
          },
          error: () => {
            completed++;
            if (completed === allUsers.length) {
              this.loading.set(false);
            }
          },
        });
      }
    }
  }

  exportCsv(): void {
    this.reportService.exportToCsv(this.entries(), 'reporte_general');
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
