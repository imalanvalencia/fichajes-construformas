import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Payment, PaymentMethod } from '../../../features/payments/types/payment.types';
import { Client } from '../../../features/clients/types/client.types';
import { Project } from '../../../features/projects/types/project.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectOrCreateComponent } from '../../shared/select-or-create/select-or-create.component';

@Component({
  selector: 'app-payment-form-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectOrCreateComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 class="text-lg font-bold text-nero">Nuevo Pago</h2>

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

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Método de Pago *</label>
            <select
              [ngModel]="form().paymentMethodId"
              (ngModelChange)="updateField('paymentMethodId', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              @for (method of paymentMethods(); track method.id) {
                <option [value]="method.id">{{ method.name }}</option>
              }
            </select>
          </div>

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Tipo *</label>
            <select
              [ngModel]="form().type"
              (ngModelChange)="updateField('type', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              <option value="PHASE_1">Fase 1</option>
              <option value="PHASE_2">Fase 2</option>
              <option value="PHASE_3">Fase 3</option>
              <option value="EXTRA">Extra</option>
              <option value="INSURANCE">Seguro</option>
            </select>
          </div>

          <app-input label="Monto *" type="number" [value]="form().amount?.toString() ?? ''" (valueChange)="updateField('amount', +$event)" />
          <app-input label="Fecha *" type="date" [value]="form().paymentDate ?? ''" (valueChange)="updateField('paymentDate', $event)" />
          <app-input label="Referencia" [value]="form().reference ?? ''" (valueChange)="updateField('reference', $event)" />
          <app-input label="Notas" [value]="form().notes ?? ''" (valueChange)="updateField('notes', $event)" />

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onSave.emit()">Crear</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PaymentFormModalComponent {
  show = input(false);
  form = input<Partial<Payment>>({});
  clients = input<Client[]>([]);
  projects = input<Project[]>([]);
  paymentMethods = input<PaymentMethod[]>([]);

  onClose = output<void>();
  onSave = output<void>();
  onFormChange = output<Partial<Payment>>();
  onCreateClient = output<string>();
  onCreateProject = output<string>();

  updateField(field: keyof Payment, value: unknown): void {
    this.onFormChange.emit({ [field]: value });
  }
}
