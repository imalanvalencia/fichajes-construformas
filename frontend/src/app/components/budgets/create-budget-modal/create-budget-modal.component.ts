import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget, BudgetType } from '../../../features/budgets/types/budget.types';
import { Project } from '../../../features/projects/types/project.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectOrCreateComponent } from '../../shared/select-or-create/select-or-create.component';

@Component({
  selector: 'app-create-budget-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectOrCreateComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div
          class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        >
          <h2 class="text-lg font-bold text-nero">Nuevo Presupuesto</h2>

          <app-select-or-create
            label="Proyecto *"
            [items]="projects()"
            [value]="form().projectId ?? null"
            placeholder="Seleccionar proyecto..."
            [required]="true"
            (valueChange)="updateField('projectId', $event)"
            (create)="onCreateProject.emit($event)"
          />

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Tipo *</label>
            <select
              [ngModel]="form().budgetType"
              (ngModelChange)="updateField('budgetType', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              <option value="ORIGINAL">Original</option>
              <option value="ANNEX">Anexo</option>
              <option value="VARIATION">Variación</option>
            </select>
          </div>

          <app-input
            label="Notas"
            [value]="form().notes ?? ''"
            (valueChange)="updateField('notes', $event)"
          />

          <!-- Checkboxes -->
          <div class="space-y-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                [ngModel]="form().includesMaterials ?? false"
                (ngModelChange)="updateField('includesMaterials', $event)"
                class="w-4 h-4 accent-nero border-steel rounded"
              />
              <span class="font-sans text-sm text-nero">Incluye materiales</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                [ngModel]="form().includesIva ?? false"
                (ngModelChange)="updateField('includesIva', $event)"
                class="w-4 h-4 accent-nero border-steel rounded"
              />
              <span class="font-sans text-sm text-nero">Incluye IVA</span>
            </label>
          </div>

          <!-- Acuerdo de Pago Preview -->
          <div class="border border-steel rounded-md p-4 bg-gray-50">
            <h3 class="font-mono text-xs font-medium text-steel mb-2">Acuerdo de Pago</h3>
            <p class="font-sans text-sm text-nero whitespace-pre-line">{{ paymentAgreement() }}</p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onCreate.emit()">Crear</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CreateBudgetModalComponent {
  show = input(false);
  projects = input<Project[]>([]);
  form = input<Partial<Budget>>({});

  onClose = output<void>();
  onCreate = output<void>();
  onCreateProject = output<string>();
  formChange = output<Partial<Budget>>();

  private currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  paymentAgreement = computed(() => {
    const amount = this.form().finalAmount ?? 0;

    if (amount <= 0) {
      return 'El acuerdo de pago se generará cuando el presupuesto tenga un monto definido.';
    }

    const includesMaterials = this.form().includesMaterials ?? false;
    const includesIva = this.form().includesIva ?? false;

    const fmt = (v: number) => this.currencyFormatter.format(v);
    const ivaText = includesIva ? 'con IVA incluido' : 'sin IVA';
    const materialsText = includesMaterials
      ? 'y los costes de los materiales incluidos'
      : '';

    const first = amount * 0.5;
    const second = amount * 0.25;
    const third = amount * 0.25;

    return (
      `El presupuesto total de la obra asciende a ${fmt(amount)} (${ivaText}), ` +
      `un precio que corresponde exclusivamente a la mano de obra ${materialsText}.\n` +
      `El calendario de pagos se estructura de la siguiente manera, y está sujeto al avance de los trabajos:\n` +
      `Primer pago: 50% del total (${fmt(first)}), al inicio de los trabajos.\n` +
      `Segundo pago: 25% del total (${fmt(second)}), a la finalización de la primera fase de la obra.\n` +
      `Tercer pago: el 25% restante (${fmt(third)}), a la completa finalización y entrega de la obra.\n` +
      `El acuerdo de pagos está sujeto al avance de los trabajos.`
    );
  });

  updateField(field: keyof Budget, value: unknown): void {
    this.formChange.emit({ [field]: value });
  }
}
