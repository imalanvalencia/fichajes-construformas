import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockEntryService } from './services/clock-entry.service';
import { ClockEntry, ClockType } from './types/clock.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Fichajes</h1>
        <div class="flex gap-2">
          <app-button variant="primary" (click)="registerEntry()">Fichar Entrada</app-button>
          <app-button variant="danger" (click)="registerExit()">Fichar Salida</app-button>
        </div>
      </div>

      <!-- Filters -->
      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Usuario ID</label>
            <input
              type="number"
              [(ngModel)]="filterUserId"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            />
          </div>
          <app-input label="Fecha Inicio" type="date" [value]="filterStart" (valueChange)="filterStart = $event" />
          <app-input label="Fecha Fin" type="date" [value]="filterEnd" (valueChange)="filterEnd = $event" />
        </div>
        <div class="mt-4">
          <app-button variant="secondary" (click)="loadByUser()">Buscar</app-button>
        </div>
      </app-card>

      <!-- Table -->
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
              @for (entry of entries; track entry.id) {
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
                    <app-button variant="danger" size="sm" (click)="deleteEntry(entry.id!)">Eliminar</app-button>
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

      <!-- Register Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4">
            <h2 class="text-lg font-bold text-nero">
              {{ registeringType === 'ENTRY' ? 'Fichar Entrada' : 'Fichar Salida' }}
            </h2>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Usuario ID *</label>
              <input
                type="number"
                [(ngModel)]="newEntry.userId"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              />
            </div>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Proyecto ID *</label>
              <input
                type="number"
                [(ngModel)]="newEntry.projectId"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Latitud *" type="number" [value]="newEntry.userLatitude?.toString() ?? ''" (valueChange)="newEntry.userLatitude = +$event" />
              <app-input label="Longitud *" type="number" [value]="newEntry.userLongitude?.toString() ?? ''" (valueChange)="newEntry.userLongitude = +$event" />
            </div>

            <app-input label="Notas" [value]="newEntry.notes ?? ''" (valueChange)="newEntry.notes = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="submitEntry()">Registrar</app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ClockComponent implements OnInit {
  entries: ClockEntry[] = [];
  filterUserId = 0;
  filterStart = '';
  filterEnd = '';
  showModal = false;
  registeringType: ClockType = 'ENTRY';
  newEntry: Partial<ClockEntry> = this.emptyForm();

  constructor(private clockService: ClockEntryService) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.filterStart = firstDay.toISOString().split('T')[0];
    this.filterEnd = now.toISOString().split('T')[0];
  }

  loadByUser(): void {
    if (!this.filterUserId || !this.filterStart || !this.filterEnd) return;
    const start = `${this.filterStart}T00:00:00`;
    const end = `${this.filterEnd}T23:59:59`;
    this.clockService.getByUser(this.filterUserId, start, end).subscribe({
      next: (data) => (this.entries = data),
    });
  }

  registerEntry(): void {
    this.registeringType = 'ENTRY';
    this.newEntry = this.emptyForm();
    this.showModal = true;
  }

  registerExit(): void {
    this.registeringType = 'EXIT';
    this.newEntry = this.emptyForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.newEntry = this.emptyForm();
  }

  submitEntry(): void {
    if (!this.newEntry.userId || !this.newEntry.projectId) return;

    const entry: ClockEntry = {
      userId: this.newEntry.userId!,
      projectId: this.newEntry.projectId!,
      clockType: this.registeringType,
      userLatitude: this.newEntry.userLatitude ?? 0,
      userLongitude: this.newEntry.userLongitude ?? 0,
      timestamp: new Date().toISOString(),
      notes: this.newEntry.notes,
    };

    this.clockService.register(entry).subscribe({
      next: () => {
        this.closeModal();
        if (this.filterUserId) this.loadByUser();
      },
    });
  }

  deleteEntry(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este fichaje?')) return;
    this.clockService.delete(id).subscribe({
      next: () => {
        if (this.filterUserId) this.loadByUser();
      },
    });
  }

  formatTimestamp(timestamp: string): string {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  private emptyForm(): Partial<ClockEntry> {
    return { userId: 0, projectId: 0, userLatitude: 0, userLongitude: 0, notes: '' };
  }
}
