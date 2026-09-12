import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supplier } from '../../../features/suppliers/types/supplier.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-supplier-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-nero">{{ isEditing() ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>

          <app-input label="Nombre *" [value]="form().name ?? ''" (valueChange)="updateField('name', $event)" />
          <app-input label="Contacto" [value]="form().contactName ?? ''" (valueChange)="updateField('contactName', $event)" />
          <app-input label="Email" type="email" [value]="form().email ?? ''" (valueChange)="updateField('email', $event)" />
          <app-input label="Teléfono" [value]="form().phone ?? ''" (valueChange)="updateField('phone', $event)" />
          <app-input label="Dirección" [value]="form().address ?? ''" (valueChange)="updateField('address', $event)" />
          <app-input label="Ciudad" [value]="form().city ?? ''" (valueChange)="updateField('city', $event)" />
          <app-input label="Código Postal" [value]="form().postalCode ?? ''" (valueChange)="updateField('postalCode', $event)" />
          <app-input label="CIF/NIF" [value]="form().taxId ?? ''" (valueChange)="updateField('taxId', $event)" />
          <app-input label="Cuenta Bancaria" [value]="form().bankAccount ?? ''" (valueChange)="updateField('bankAccount', $event)" />
          <app-input label="Notas" [value]="form().notes ?? ''" (valueChange)="updateField('notes', $event)" />

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onSave.emit()">{{ isEditing() ? 'Actualizar' : 'Crear' }}</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SupplierFormModalComponent {
  show = input(false);
  form = input<Partial<Supplier>>({});
  isEditing = input(false);

  onClose = output<void>();
  onSave = output<void>();
  formChange = output<Partial<Supplier>>();

  updateField(field: keyof Supplier, value: string): void {
    this.formChange.emit({ [field]: value });
  }
}
