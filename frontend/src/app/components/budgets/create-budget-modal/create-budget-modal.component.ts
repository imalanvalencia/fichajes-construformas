import { Component, input, output, signal } from '@angular/core';
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
          <app-input
            label="Condiciones de Pago"
            [value]="form().paymentTerms ?? ''"
            (valueChange)="updateField('paymentTerms', $event)"
          />

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

  updateField(field: keyof Budget, value: unknown): void {
    this.formChange.emit({ [field]: value });
  }
}
