import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../features/users/types/user.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-nero">{{ isEditing() ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>

          <app-input label="Nombre *" [value]="form().name ?? ''" (valueChange)="updateField('name', $event)" />
          <app-input label="Email *" type="email" [value]="form().email ?? ''" (valueChange)="updateField('email', $event)" />
          <app-input label="Teléfono" [value]="form().phone ?? ''" (valueChange)="updateField('phone', $event)" />
          <app-input label="NIE" [value]="form().nie ?? ''" (valueChange)="updateField('nie', $event)" />

          @if (!isEditing()) {
            <app-input label="Contraseña *" type="password" [value]="form().password ?? ''" (valueChange)="updateField('password', $event)" />
          }

          <app-select
            label="Rol *"
            [options]="roleOptions"
            [value]="form().role"
            (valueChange)="updateField('role', $event!)"
            [required]="true"
          />

          <app-select
            label="Disponibilidad"
            [options]="availabilityOptions"
            [value]="form().availability"
            (valueChange)="updateField('availability', $event!)"
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
export class UserFormModalComponent {
  show = input(false);
  form = input<Partial<User>>({});
  isEditing = input(false);

  onClose = output<void>();
  onSave = output<void>();
  onFormChange = output<Partial<User>>();

  readonly roleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'OPERATOR', label: 'Operador' },
    { value: 'MANAGER', label: 'Gerente' },
  ];

  readonly availabilityOptions = [
    { value: 'AVAILABLE', label: 'Disponible' },
    { value: 'ON_LEAVE', label: 'En Permiso' },
    { value: 'INACTIVE', label: 'Inactivo' },
  ];

  updateField(field: keyof User, value: string): void {
    this.onFormChange.emit({ [field]: value });
  }
}
