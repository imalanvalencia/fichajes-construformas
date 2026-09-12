import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockEntryService } from './services/clock-entry.service';
import { ClockEntry, ClockType } from './types/clock.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@shared-components/card/card.component';
import { ClockTableComponent } from '@components/clock/clock-table/clock-table.component';
import { ClockRegisterModalComponent } from '@components/clock/clock-register-modal/clock-register-modal.component';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    ClockTableComponent,
    ClockRegisterModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Fichajes</h1>
        <div class="flex gap-2">
          <app-button variant="filled" (click)="registerEntry()">Fichar Entrada</app-button>
          <app-button variant="text" (click)="registerExit()">Fichar Salida</app-button>
        </div>
      </div>

      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <app-input label="Usuario ID" type="number" [value]="filterUserId.toString()" (valueChange)="filterUserId = +$event" />
          <app-input label="Fecha Inicio" type="date" [value]="filterStart" (valueChange)="filterStart = $event" />
          <app-input label="Fecha Fin" type="date" [value]="filterEnd" (valueChange)="filterEnd = $event" />
        </div>
        <div class="mt-4">
          <app-button variant="text" (click)="loadByUser()">Buscar</app-button>
        </div>
      </app-card>

      <app-clock-table
        [entries]="entries()"
        (onDelete)="deleteEntry($event)"
      />

      <app-clock-register-modal
        [show]="showModal"
        [registeringType]="registeringType"
        [form]="newEntry"
        (onClose)="closeModal()"
        (onSubmit)="submitEntry()"
        (formChange)="onFormChange($event)"
      />
    </div>
  `,
})
export class ClockComponent implements OnInit {
  entries = signal<ClockEntry[]>([]);
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
      next: (data) => this.entries.set(data),
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

  onFormChange(change: Record<string, unknown>): void {
    this.newEntry = { ...this.newEntry, ...change };
  }

  submitEntry(): void {
    if (!this.newEntry.userId || !this.newEntry.projectId) return;

    const entry: ClockEntry = {
      userId: this.newEntry.userId as number,
      projectId: this.newEntry.projectId as number,
      clockType: this.registeringType,
      userLatitude: this.newEntry.userLatitude as number ?? 0,
      userLongitude: this.newEntry.userLongitude as number ?? 0,
      timestamp: new Date().toISOString(),
      notes: this.newEntry.notes as string | undefined,
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

  private emptyForm(): Partial<ClockEntry> {
    return { userId: 0, projectId: 0, userLatitude: 0, userLongitude: 0, notes: '' };
  }
}
