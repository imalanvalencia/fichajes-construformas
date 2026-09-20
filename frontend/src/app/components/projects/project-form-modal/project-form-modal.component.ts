import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project, ProjectStatus } from '../../../features/projects/types/project.types';
import { Client } from '../../../features/clients/types/client.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { SelectOrCreateComponent } from '../../shared/select-or-create/select-or-create.component';

@Component({
  selector: 'app-project-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectComponent, SelectOrCreateComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-nero">{{ isEditing() ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h2>

          <app-input label="Nombre *" [value]="form().name ?? ''" (valueChange)="updateField('name', $event)" />
          <app-input label="Descripción" [value]="form().description ?? ''" (valueChange)="updateField('description', $event)" />
          <app-input label="Dirección *" [value]="form().address ?? ''" (valueChange)="updateField('address', $event)" />
          <app-input label="Ciudad" [value]="form().city ?? ''" (valueChange)="updateField('city', $event)" />

          <app-select-or-create
            label="Cliente *"
            [items]="clients()"
            [value]="form().clientId ?? null"
            placeholder="Seleccionar cliente..."
            [required]="true"
            (valueChange)="updateField('clientId', $event)"
            (create)="onCreateClient.emit($event)"
          />

          <div class="grid grid-cols-2 gap-4">
            <app-input label="Latitud *" type="number" [value]="form().latitude?.toString() ?? ''" (valueChange)="updateField('latitude', +$event)" />
            <app-input label="Longitud *" type="number" [value]="form().longitude?.toString() ?? ''" (valueChange)="updateField('longitude', +$event)" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-input label="Fecha Inicio" type="date" [value]="form().startDate ?? ''" (valueChange)="updateField('startDate', $event)" />
            <app-input label="Fecha Fin Estimada" type="date" [value]="form().estimatedEndDate ?? ''" (valueChange)="updateField('estimatedEndDate', $event)" />
          </div>

          <app-select
            label="Estado"
            [options]="statusOptions"
            [value]="form().status"
            (valueChange)="updateField('status', $event!)"
          />

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onSave.emit()">
              {{ isEditing() ? 'Actualizar' : 'Crear' }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProjectFormModalComponent {
  show = input(false);
  form = input<Partial<Project>>({});
  isEditing = input(false);
  clients = input<Client[]>([]);

  onClose = output<void>();
  onSave = output<void>();
  onFormChange = output<Partial<Project>>();
  onCreateClient = output<string>();

  readonly statusOptions = [
    { value: 'PLANNED', label: 'Planificado' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'CANCELLED', label: 'Cancelado' },
  ];

  updateField(field: keyof Project, value: unknown): void {
    this.onFormChange.emit({ [field]: value });
  }
}
