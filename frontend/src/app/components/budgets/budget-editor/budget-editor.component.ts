import { Component, input, output, signal, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget, BudgetItem } from '../../../features/budgets/types/budget.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { InputComponent } from '../../shared/input/input.component';
import { TextareaComponent } from '../../shared/textarea/textarea.component';

interface EditableItem {
  local: Partial<BudgetItem>;
  dirty: boolean;
}

@Component({
  selector: 'app-budget-editor',
  standalone: true,
  imports: [FormsModule, ButtonComponent, CardComponent, BadgeComponent, InputComponent, TextareaComponent],
  template: `
    <div class="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div class="max-w-6xl mx-auto px-6 py-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold text-nero">Editor de Presupuesto</h1>
            @if (budget()) {
              <span class="font-mono text-sm text-steel">
                #{{ budget()!.id }} — v{{ budget()!.version }}
              </span>
              <app-badge [status]="budget()!.status" />
            }
          </div>
          <app-button variant="text" (click)="onClose.emit()">Cerrar</app-button>
        </div>

        <!-- Client / Project Info -->
        @if (budget()?.project) {
          <app-card category="Proyecto" [title]="budget()!.project!.name">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="font-mono text-xs text-steel uppercase">Cliente</span>
                <p class="text-nero mt-1">{{ budget()!.project!.clientName || '—' }}</p>
              </div>
              <div>
                <span class="font-mono text-xs text-steel uppercase">Dirección</span>
                <p class="text-nero mt-1">{{ budget()!.project!.address || '—' }}</p>
              </div>
              <div>
                <span class="font-mono text-xs text-steel uppercase">Tipo</span>
                <p class="text-nero mt-1">{{ budget()!.budgetType }}</p>
              </div>
            </div>
          </app-card>
        }

        <!-- Line Items Table -->
        <div class="mt-6">
          <app-card category="Partidas" title="Líneas de Presupuesto">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-steel/30">
                    <th class="text-left py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-16">
                      Ref
                    </th>
                    <th class="text-left py-3 px-3 font-mono text-xs font-medium text-steel uppercase">
                      Descripción
                    </th>
                    <th class="text-left py-3 px-3 font-mono text-xs font-medium text-steel uppercase">
                      Zona
                    </th>
                    <th class="text-left py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-24">
                      Unidad
                    </th>
                    <th class="text-right py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-24">
                      Cantidad
                    </th>
                    <th class="text-right py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-32">
                      Precio Unit.
                    </th>
                    <th class="text-right py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-32">
                      Total
                    </th>
                    <th class="text-right py-3 px-3 font-mono text-xs font-medium text-steel uppercase w-20">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of editableItems(); track $index; let i = $index) {
                    <tr class="border-b border-steel/10 hover:bg-cement/50">
                      <td class="py-2 px-3 font-mono text-xs text-steel">
                        {{ i + 1 }}
                      </td>
                      <td class="py-2 px-3">
                        <app-input
                          type="text"
                          [value]="item.local.description ?? ''"
                          (valueChange)="updateField(i, 'description', $event)"
                          (blur)="emitUpdate(i)"
                          placeholder="Descripción *"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <app-input
                          type="text"
                          [value]="item.local.zone ?? ''"
                          (valueChange)="updateField(i, 'zone', $event)"
                          (blur)="emitUpdate(i)"
                          placeholder="Zona"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <app-input
                          type="text"
                          [value]="item.local.unit ?? ''"
                          (valueChange)="updateField(i, 'unit', $event)"
                          (blur)="emitUpdate(i)"
                          placeholder="Unidad"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <app-input
                          type="number"
                          [value]="str(item.local.quantity)"
                          (valueChange)="updateFieldNumber(i, 'quantity', $event)"
                          (blur)="emitUpdate(i)"
                          placeholder="0"
                        />
                      </td>
                      <td class="py-2 px-3">
                        <div class="flex items-center justify-end">
                          <span class="font-mono text-xs text-steel mr-1">€</span>
                          <app-input
                            type="number"
                            [value]="str(item.local.unitPrice)"
                            (valueChange)="updateFieldNumber(i, 'unitPrice', $event)"
                            (blur)="emitUpdate(i)"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td class="py-2 px-3 text-right font-medium text-nero font-mono text-sm">
                        {{ formatCurrency(item.local.totalPrice || 0) }}
                      </td>
                      <td class="py-2 px-3 text-right">
                        <app-button variant="text" size="sm" (click)="removeItem(i)"
                          >✕</app-button
                        >
                      </td>
                    </tr>
                  }

                  <!-- Add Item Row -->
                  <tr class="border-t-2 border-cement/50 bg-cement/30">
                    <td class="py-2 px-3 font-mono text-xs text-steel">
                      {{ editableItems().length + 1 }}
                    </td>
                    <td class="py-2 px-3">
                      <app-input
                        type="text"
                        [value]="newItemDescription()"
                        (valueChange)="newItemDescription.set($event)"
                        (keydown.enter)="addItem()"
                        placeholder="Nueva descripción *"
                      />
                    </td>
                    <td class="py-2 px-3">
                      <app-input
                        type="text"
                        [value]="newItemZone()"
                        (valueChange)="newItemZone.set($event)"
                        (keydown.enter)="addItem()"
                        placeholder="Zona"
                      />
                    </td>
                    <td class="py-2 px-3">
                      <app-input
                        type="text"
                        [value]="newItemUnit()"
                        (valueChange)="newItemUnit.set($event)"
                        (keydown.enter)="addItem()"
                        placeholder="Unidad"
                      />
                    </td>
                    <td class="py-2 px-3">
                      <app-input
                        type="number"
                        [value]="str(newItemQuantity())"
                        (valueChange)="newItemQuantity.set(+$event || 1)"
                        (keydown.enter)="addItem()"
                        placeholder="1"
                      />
                    </td>
                    <td class="py-2 px-3">
                      <div class="flex items-center justify-end">
                        <span class="font-mono text-xs text-steel mr-1">€</span>
                        <app-input
                          type="number"
                          [value]="str(newItemPrice())"
                          (valueChange)="newItemPrice.set(+$event || 0)"
                          (keydown.enter)="addItem()"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td class="py-2 px-3 text-right font-mono text-sm text-steel">
                      {{ formatCurrency(newItemQuantity() * newItemPrice()) }}
                    </td>
                    <td class="py-2 px-3 text-right">
                      <app-button variant="filled" size="sm" (click)="addItem()"
                        >+ Agregar</app-button
                      >
                    </td>
                  </tr>

                  @if (editableItems().length === 0) {
                    <tr>
                      <td colspan="8" class="py-8 text-center text-steel">
                        No hay partidas. Usa la fila inferior para agregar la primera.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </app-card>
        </div>

        <!-- Terms & Conditions -->
        <div class="mt-6">
          <app-card category="Condiciones" title="Términos y Condiciones">
            <app-textarea
              [value]="termsText()"
              (valueChange)="termsText.set($event)"
              [rows]="5"
              placeholder="Escribe los términos y condiciones del presupuesto..."
            />
          </app-card>
        </div>

        <!-- Totals Section -->
        <div class="mt-6">
          <app-card>
            <div class="flex justify-end">
              <div class="w-80 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="font-mono text-xs text-steel uppercase">Subtotal</span>
                  <span class="font-mono text-nero">{{ formatCurrency(subtotal()) }}</span>
                </div>

                @if (budget()?.includesIva) {
                  <div class="flex justify-between text-sm">
                    <span class="font-mono text-xs text-steel uppercase">IVA 21%</span>
                    <span class="font-mono text-nero">{{ formatCurrency(ivaAmount()) }}</span>
                  </div>
                }

                @if (discountAmount() > 0) {
                  <div class="flex justify-between text-sm">
                    <span class="font-mono text-xs text-steel uppercase">Descuento</span>
                    <span class="font-mono text-construction-red">-{{ formatCurrency(discountAmount()) }}</span>
                  </div>
                }

                <div class="border-t border-steel/30 pt-3 flex justify-between">
                  <span class="font-mono text-sm font-bold text-nero uppercase">Total Final</span>
                  <span class="font-mono text-lg font-bold text-nero">{{ formatCurrency(finalTotal()) }}</span>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex items-center justify-end gap-3 pb-8">
          <app-button variant="outlined" (click)="onClose.emit()">Cancelar</app-button>
          <app-button variant="tonal" [disabled]="true">Previsualizar PDF</app-button>
          <app-button variant="filled" (click)="saveDraft()">Guardar Borrador</app-button>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class BudgetEditorComponent {
  budget = input<Budget | null>(null);
  items = input<BudgetItem[]>([]);

  onClose = output<void>();
  onSave = output<Partial<Budget>>();
  onUpdateItem = output<{ id: number; changes: Partial<BudgetItem> }>();
  onDeleteItem = output<number>();
  onAddItem = output<Partial<BudgetItem>>();

  // --- Local editing state for existing items ---
  editableItems = signal<EditableItem[]>([]);

  // Sync items input → local state
  private syncEffect = effect(() => {
    const incoming = this.items();
    this.editableItems.set(
      incoming.map((item) => ({
        local: { ...item },
        dirty: false,
      }))
    );
  });

  // --- New item draft fields (two-way bound) ---
  newItemDescription = signal('');
  newItemZone = signal('');
  newItemUnit = signal('');
  newItemQuantity = signal(1);
  newItemPrice = signal(0);

  // --- Terms & Conditions ---
  termsText = signal('');

  private syncTermsEffect = effect(() => {
    const b = this.budget();
    if (b) {
      this.termsText.set(b.termsConditions ?? '');
    }
  });

  // --- Discount from budget ---
  discountAmount = signal(0);

  private syncDiscountEffect = effect(() => {
    const b = this.budget();
    if (b) {
      this.discountAmount.set(b.discountAmount ?? 0);
    }
  });

  // --- Computed totals ---
  subtotal = computed(() =>
    this.editableItems().reduce((sum, item) => sum + (item.local.totalPrice || 0), 0)
  );

  ivaAmount = computed(() =>
    this.budget()?.includesIva ? this.subtotal() * 0.21 : 0
  );

  finalTotal = computed(() =>
    this.subtotal() + this.ivaAmount() - this.discountAmount()
  );

  // --- Inline edit handlers ---
  updateField(index: number, field: string, value: string): void {
    this.editableItems.update((items) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        local: { ...updated[index].local, [field]: value },
        dirty: true,
      };
      return updated;
    });
    this.recalcRowTotal(index);
  }

  updateFieldNumber(index: number, field: string, value: string): void {
    const num = +value;
    this.editableItems.update((items) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        local: { ...updated[index].local, [field]: isNaN(num) ? 0 : num },
        dirty: true,
      };
      return updated;
    });
    this.recalcRowTotal(index);
  }

  private recalcRowTotal(index: number): void {
    this.editableItems.update((items) => {
      const updated = [...items];
      const local = updated[index].local;
      const qty = local.quantity || 0;
      const price = local.unitPrice || 0;
      updated[index] = {
        ...updated[index],
        local: { ...local, totalPrice: qty * price },
      };
      return updated;
    });
  }

  emitUpdate(index: number): void {
    const item = this.editableItems()[index];
    if (item?.dirty && item.local.id) {
      this.onUpdateItem.emit({
        id: item.local.id,
        changes: { ...item.local },
      });
      this.editableItems.update((items) => {
        const updated = [...items];
        updated[index] = { ...updated[index], dirty: false };
        return updated;
      });
    }
  }

  // --- Remove existing item ---
  removeItem(index: number): void {
    const item = this.editableItems()[index];
    if (item?.local.id) {
      this.onDeleteItem.emit(item.local.id);
    }
  }

  // --- Add new item ---
  addItem(): void {
    const desc = this.newItemDescription().trim();
    if (!desc) return;

    const qty = Math.max(1, this.newItemQuantity() || 1);
    const price = this.newItemPrice() || 0;

    this.onAddItem.emit({
      description: desc,
      zone: this.newItemZone() || undefined,
      unit: this.newItemUnit() || undefined,
      quantity: qty,
      unitPrice: price,
      totalPrice: qty * price,
      orderNum: this.editableItems().length + 1,
    });

    this.newItemDescription.set('');
    this.newItemZone.set('');
    this.newItemUnit.set('');
    this.newItemQuantity.set(1);
    this.newItemPrice.set(0);
  }

  // --- Save draft (budget-level fields) ---
  saveDraft(): void {
    this.onSave.emit({
      termsConditions: this.termsText(),
    });
  }

  // --- Currency formatting ---
  private currencyFmt = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  formatCurrency(value: number): string {
    return this.currencyFmt.format(value ?? 0);
  }

  /** Convert number to string for template bindings (String() unavailable in templates) */
  str(value: number | undefined | null): string {
    return String(value ?? 0);
  }
}
