import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget, BudgetItem } from '../../../features/budgets/types/budget.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-items-panel',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent, InputComponent],
  template: `
    <app-card>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-nero">
          Items del Presupuesto v{{ budget()?.version }}
        </h2>
        <app-button variant="text" size="sm" (click)="onClose.emit()"
          >Cerrar</app-button
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Zona
              </th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Descripción
              </th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Unidad
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Cantidad
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Precio Unit.
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Total
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            @for (item of items(); track item.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 text-steel">{{ item.zone || '—' }}</td>
                <td class="py-3 px-4 font-medium text-nero">{{ item.description }}</td>
                <td class="py-3 px-4 text-steel">{{ item.unit || '—' }}</td>
                <td class="py-3 px-4 text-right text-nero">{{ item.quantity }}</td>
                <td class="py-3 px-4 text-right text-nero">
                  {{ formatCurrency(item.unitPrice) }}
                </td>
                <td class="py-3 px-4 text-right font-medium text-nero">
                  {{ formatCurrency(item.totalPrice) }}
                </td>
                <td class="py-3 px-4 text-right">
                  <app-button variant="text" size="sm" (click)="onDeleteItem.emit(item.id!)"
                    >Eliminar</app-button
                  >
                </td>
              </tr>
            }

            <tr class="border-t-2 border-cement/50 bg-cement/30" [class.ring-2]="isEditing()" [class.ring-primary]="isEditing()">
              <td class="py-2 px-4">
                <app-input
                  [value]="draft().zone ?? ''"
                  (valueChange)="onDraftChange('zone', $event)"
                  placeholder="Zona"
                  class="w-full"
                  (keydown.enter)="saveItem()"
                  (blur)="onBlur()"
                  [autofocus]="true"
                />
              </td>
              <td class="py-2 px-4">
                <app-input
                  [value]="draft().description ?? ''"
                  (valueChange)="onDraftChange('description', $event)"
                  placeholder="Descripción *"
                  class="w-full"
                  (keydown.enter)="saveItem()"
                  (blur)="onBlur()"
                />
              </td>
              <td class="py-2 px-4">
                <app-input
                  [value]="draft().unit ?? ''"
                  (valueChange)="onDraftChange('unit', $event)"
                  placeholder="Unidad"
                  class="w-full"
                  (keydown.enter)="saveItem()"
                  (blur)="onBlur()"
                />
              </td>
              <td class="py-2 px-4 text-right">
                <app-input
                  type="number"
                  [value]="draft().quantity?.toString() ?? ''"
                  (valueChange)="onDraftChangeNumber('quantity', $event)"
                  placeholder="0"
                  class="w-20 text-right"
                  (keydown.enter)="saveItem()"
                  (blur)="onBlur()"
                />
              </td>
              <td class="py-2 px-4 text-right">
                <app-input
                  type="number"
                  [value]="draft().unitPrice?.toString() ?? ''"
                  (valueChange)="onDraftChangeNumber('unitPrice', $event)"
                  placeholder="0"
                  class="w-24 text-right"
                  (keydown.enter)="saveItem()"
                  (blur)="onBlur()"
                />
              </td>
              <td class="py-2 px-4 text-right font-medium text-nero">
                {{ formatCurrency(draft().totalPrice || 0) }}
              </td>
              <td class="py-2 px-4 text-right">
                @if (isEditing()) {
                  <app-button variant="filled" size="sm" (click)="saveItem()"
                    >Guardar</app-button
                  >
                  <app-button variant="text" size="sm" (click)="cancelEdit()"
                    >Cancelar</app-button
                  >
                } @else {
                  <app-button variant="filled" size="sm" (click)="startEdit()"
                    >+ Agregar</app-button
                  >
                }
              </td>
            </tr>

            @if (items().length === 0 && !isEditing()) {
              <tr>
                <td colspan="7" class="py-8 text-center text-steel">
                  No hay items en este presupuesto. Haz clic en "+ Agregar" para comenzar.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class ItemsPanelComponent {
  budget = input<Budget | null>(null);
  items = input<BudgetItem[]>([]);

  onClose = output<void>();
  onDeleteItem = output<number>();
  onAddItem = output<Partial<BudgetItem>>();

  draft = signal<Partial<BudgetItem>>({
    zone: '',
    description: '',
    unit: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    orderNum: 0,
  });

  editing = signal(false);

  isEditing = computed(() => this.editing());

  startEdit(): void {
    this.draft.set(this.emptyForm());
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.draft.set(this.emptyForm());
    this.editing.set(false);
  }

  onBlur(): void {
    setTimeout(() => {
      const d = this.draft();
      const isEmpty = !d.description && !d.zone && !d.unit &&
                      (!d.quantity || d.quantity === 0) &&
                      (!d.unitPrice || d.unitPrice === 0);
      if (isEmpty && this.editing()) {
        this.cancelEdit();
      }
    }, 150);
  }

  onDraftChange(field: string, value: string): void {
    this.draft.update(d => ({ ...d, [field]: value }));
  }

  onDraftChangeNumber(field: string, value: string): void {
    const num = +value;
    this.draft.update(d => ({ ...d, [field]: isNaN(num) ? 0 : num }));
    this.updateTotal();
  }

  updateTotal(): void {
    const d = this.draft();
    this.draft.update(d => ({
      ...d,
      totalPrice: (d.quantity || 0) * (d.unitPrice || 0)
    }));
  }

  saveItem(): void {
    const d = this.draft();
    if (!d.description) return;

    const qty = d.quantity || 0;
    const price = d.unitPrice || 0;

    this.onAddItem.emit({
      ...d,
      quantity: qty,
      unitPrice: price,
      totalPrice: d.totalPrice || (qty * price),
    });

    this.cancelEdit();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }

  private emptyForm(): Partial<BudgetItem> {
    return {
      zone: '',
      description: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      orderNum: 0,
    };
  }
}
