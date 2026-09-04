import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../features/users/types/user.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
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

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Rol *</label>
            <select
              [ngModel]="form().role"
              (ngModelChange)="updateField('role', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              <option value="ADMIN">Administrador</option>
              <option value="OPERATOR">Operador</option>
              <option value="MANAGER">Gerente</option>
            </select>
          </div>

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Disponibilidad</label>
            <select
              [ngModel]="form().availability"
              (ngModelChange)="updateField('availability', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="ON_LEAVE">En Permiso</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>

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

  updateField(field: keyof User, value: string): void {
    this.onFormChange.emit({ [field]: value });
  }
}
