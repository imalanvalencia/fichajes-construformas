import { Component, inject, signal, OnInit } from '@angular/core';
import { ClockEntryService } from '../../core/services/clock-entry.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, ClockType } from '../../core/models/clock.models';

@Component({
  selector: 'app-clock-entry',
  standalone: true,
  template: `
    <div class="border border-steel-grey p-6">
      <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">FICHAR</p>

      @if (error()) {
        <p class="text-construction-red text-sm mb-4">{{ error() }}</p>
      }
      @if (success()) {
        <p class="text-green-600 text-sm mb-4">{{ success() }}</p>
      }

      <label class="block mb-2 font-mono text-xs text-steel-grey">OBRA</label>
      <select (change)="onProjectChange($event)"
        class="w-full border border-steel-grey p-2 mb-4 bg-white text-nero">
        <option value="">Seleccionar obra...</option>
        @for (p of projects(); track p.id) {
          <option [value]="p.id">{{ p.name }}</option>
        }
      </select>

      <button (click)="clock()"
        [disabled]="loading() || !selectedProjectId()"
        class="w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
               py-3 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
        {{ loading() ? 'ENVIANDO...' : (clockType() === 'ENTRY' ? 'FICHAR ENTRADA' : 'FICHAR SALIDA') }}
      </button>

      <p class="font-mono text-xs text-steel-grey mt-4 text-center">
        {{ clockType() === 'ENTRY' ? 'Estado: Fuera' : 'Estado: Dentro' }}
      </p>
    </div>
  `,
})
export class ClockEntryComponent implements OnInit {
  private clockService = inject(ClockEntryService);
  private auth = inject(AuthService);

  projects = signal<Project[]>([]);
  selectedProjectId = signal<number | null>(null);
  clockType = signal<ClockType>('ENTRY');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  ngOnInit(): void {
    this.clockService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: () => this.error.set('Error al cargar obras'),
    });
  }

  onProjectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(value ? +value : null);
  }

  clock(): void {
    if (!this.selectedProjectId()) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const req = {
          userId: this.auth.getUserId()!,
          projectId: this.selectedProjectId()!,
          clockType: this.clockType(),
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };

        this.clockService.registerClockEntry(req).subscribe({
          next: () => {
            this.success.set('Fichaje registrado');
            this.clockType.set(this.clockType() === 'ENTRY' ? 'EXIT' : 'ENTRY');
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Error al fichar');
            this.loading.set(false);
          },
        });
      },
      () => {
        this.error.set('No se pudo obtener la ubicación');
        this.loading.set(false);
      },
      { enableHighAccuracy: true },
    );
  }
}
