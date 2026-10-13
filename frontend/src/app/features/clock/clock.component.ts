import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ClockEntryService } from './services/clock-entry.service';
import { GeolocationService } from './services/geolocation.service';
import { ClockEntry, ClockType } from './types/clock.types';
import { ProjectService } from '../projects/services/project.service';
import { Project } from '../projects/types/project.types';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '@app/services/notification.service';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@shared-components/card/card.component';
import { SelectOption } from '@shared-components/select/select.component';
import { ClockTableComponent } from '@components/clock/clock-table/clock-table.component';
import { ClockRegisterModalComponent, LocationState } from '@components/clock/clock-register-modal/clock-register-modal.component';
import { ClockCorrectionsComponent } from './clock-corrections/clock-corrections.component';

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
    ClockCorrectionsComponent,
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

      <app-clock-corrections [isAdmin]="isAdmin()" />

      <app-clock-register-modal
        [show]="showModal()"
        [registeringType]="registeringType"
        [form]="newEntry"
        [projectOptions]="projectOptions()"
        [currentUserLabel]="currentUserLabel()"
        [locationState]="locationState()"
        [locationText]="locationText()"
        (onClose)="closeModal()"
        (onSubmit)="submitEntry($event)"
        (formChange)="onFormChange($event)"
      />
    </div>
  `,
})
export class ClockComponent {
  entries = signal<ClockEntry[]>([]);
  projects = signal<Project[]>([]);
  showModal = signal(false);
  isAdmin = signal(false);
  locationState = signal<LocationState>('idle');
  locationText = signal('');
  registeringType: ClockType = 'ENTRY';
  filterUserId = 0;
  filterStart = '';
  filterEnd = '';
  newEntry: Partial<ClockEntry> = this.emptyForm();

  readonly projectOptions = computed<SelectOption<number>[]>(() =>
    this.projects().map((project) => ({ value: project.id ?? 0, label: project.name })),
  );

  readonly currentUserLabel = computed(() => {
    const user = this.auth.getUser();
    if (!user) return '';
    return `${user.name} · ${user.email}`;
  });

  private position: GeolocationPosition | null = null;

  private destroyRef = inject(DestroyRef);
  private clockService = inject(ClockEntryService);
  private geolocation = inject(GeolocationService);
  private projectService = inject(ProjectService);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);

  constructor() {
    this.setDefaultDates();
    this.filterUserId = this.auth.getUser()?.id ?? 0;
    this.isAdmin.set(this.auth.hasRole('ADMIN'));
    this.loadProjects();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.filterStart = firstDay.toISOString().split('T')[0];
    this.filterEnd = now.toISOString().split('T')[0];
  }

  loadProjects(): void {
    this.projectService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.notifications.error('No se pudieron cargar las obras.'),
    });
  }

  loadByUser(): void {
    if (!this.filterUserId || !this.filterStart || !this.filterEnd) return;
    const start = `${this.filterStart}T00:00:00`;
    const end = `${this.filterEnd}T23:59:59`;
    this.clockService.getByUser(this.filterUserId, start, end).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.entries.set(data),
      error: () => this.notifications.error('No se pudieron cargar los fichajes.'),
    });
  }

  registerEntry(): void {
    this.openModal('ENTRY');
  }

  registerExit(): void {
    this.openModal('EXIT');
  }

  closeModal(): void {
    this.showModal.set(false);
    this.newEntry = this.emptyForm();
    this.position = null;
    this.locationState.set('idle');
    this.locationText.set('');
  }

  onFormChange(change: Record<string, unknown>): void {
    this.newEntry = { ...this.newEntry, ...change };
  }

  submitEntry(form: Partial<{ projectId: number; notes: string }>): void {
    const projectId = form.projectId ?? this.newEntry.projectId;
    if (!projectId) {
      this.notifications.error('Elegí una obra antes de fichar.');
      return;
    }
    if (!this.position) {
      this.notifications.error('No pudimos obtener tu ubicación. Activala y volvé a intentar.');
      return;
    }

    const payload: ClockEntry = {
      projectId,
      clockType: this.registeringType,
      userLatitude: this.position.coords.latitude,
      userLongitude: this.position.coords.longitude,
      notes: form.notes ?? this.newEntry.notes,
    };

    this.clockService.register(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.success('Fichaje registrado.');
        this.closeModal();
        if (this.filterUserId) this.loadByUser();
      },
      error: (error) => {
        const message = typeof error?.error?.message === 'string' ? error.error.message : null;
        this.notifications.error(
          message ? `No se pudo registrar el fichaje: ${message}` : 'No se pudo registrar el fichaje.',
        );
      },
    });
  }

  deleteEntry(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este fichaje?')) return;
    this.clockService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.success('Fichaje eliminado.');
        if (this.filterUserId) this.loadByUser();
      },
      error: () => this.notifications.error('No se pudo eliminar el fichaje.'),
    });
  }

  private openModal(type: ClockType): void {
    this.registeringType = type;
    this.newEntry = this.emptyForm();
    this.position = null;
    this.locationState.set('locating');
    this.locationText.set('');
    this.showModal.set(true);
    this.requestLocation();
  }

  private requestLocation(): void {
    this.geolocation.getPosition().subscribe({
      next: (position) => {
        this.position = position;
        this.locationState.set('ready');
        this.locationText.set(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
      },
      error: (error: Error) => {
        this.position = null;
        this.locationState.set('error');
        this.locationText.set(error.message || 'permiso denegado');
      },
    });
  }

  private emptyForm(): Partial<ClockEntry> {
    return { notes: '' };
  }
}
