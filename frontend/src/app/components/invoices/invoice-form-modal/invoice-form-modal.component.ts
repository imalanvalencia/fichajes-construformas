import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Invoice } from '../../../features/invoices/types/invoice.types';
import { Client } from '../../../features/clients/types/client.types';
import { Project } from '../../../features/projects/types/project.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectOrCreateComponent } from '../../shared/select-or-create/select-or-create.component';

@Component({
  selector: 'app-invoice-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectOrCreateComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-nero">{{ isEditing() ? 'Editar Factura' : 'Nueva Factura' }}</h2>

          <app-input label="Nº Factura *" [value]="form().invoiceNumber ?? ''" (valueChange)="updateField('invoiceNumber', $event)" />

          <app-select-or-create
            label="Proyecto *"
            [items]="projects()"
            [value]="form().projectId ?? null"
            placeholder="Seleccionar proyecto..."
            [required]="true"
            (valueChange)="updateField('projectId', $event)"
            (create)="onCreateProject.emit($event)"
          />

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
            <app-input label="Subtotal" type="number" [value]="form().subtotal?.toString() ?? ''" (valueChange)="updateField('subtotal', +$event)" />
            <app-input label="Tipo IVA %" type="number" [value]="form().taxRate?.toString() ?? ''" (valueChange)="updateField('taxRate', +$event)" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-input label="Fecha Emisión" type="date" [value]="form().issuedDate ?? ''" (valueChange)="updateField('issuedDate', $event)" />
            <app-input label="Fecha Vencimiento" type="date" [value]="form().dueDate ?? ''" (valueChange)="updateField('dueDate', $event)" />
          </div>

          <app-input label="Notas" [value]="form().notes ?? ''" (valueChange)="updateField('notes', $event)" />

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
export class InvoiceFormModalComponent {
  show = input(false);
  form = input<Partial<Invoice>>({});
  isEditing = input(false);
  clients = input<Client[]>([]);
  projects = input<Project[]>([]);

  onClose = output<void>();
  onSave = output<void>();
  onFormChange = output<Partial<Invoice>>();
  onCreateClient = output<string>();
  onCreateProject = output<string>();

  updateField(field: keyof Invoice, value: unknown): void {
    this.onFormChange.emit({ [field]: value });
  }
}
