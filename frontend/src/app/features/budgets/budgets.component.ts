import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetService } from './services/budget.service';
import { Budget, BudgetItem, BudgetStatus } from './types/budget.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent, MetricCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Presupuestos</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nuevo Presupuesto</app-button>
      </div>

      <!-- Summary -->
      @if (budgets.length > 0) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-metric-card
            [value]="budgets.length"
            label="Total Presupuestos"
            color="#1C1C1D"
          />
          <app-metric-card
            [value]="getCountByStatus('DRAFT')"
            label="Borradores"
            color="#ACB4B6"
          />
          <app-metric-card
            [value]="getCountByStatus('APPROVED')"
            label="Aprobados"
            color="#22C55E"
          />
          <app-metric-card
            [value]="formatCurrency(getTotalAmount())"
            label="Monto Total"
            color="#E22D2D"
          />
        </div>
      }

      <!-- Table -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Versión</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Tipo</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Monto Final</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (budget of budgets; track budget.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-medium text-nero">{{ budget.projectName || '—' }}</td>
                  <td class="py-3 px-4 text-steel font-mono">v{{ budget.version }}</td>
                  <td class="py-3 px-4 text-steel">{{ budget.budgetType }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="budget.status" />
                  </td>
                  <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(budget.finalAmount) }}</td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <app-button variant="secondary" size="sm" (click)="viewItems(budget)">Items</app-button>
                    @if (budget.status === 'DRAFT') {
                      <app-button variant="primary" size="sm" (click)="approveBudget(budget.id!)">Aprobar</app-button>
                    }
                    <app-button variant="danger" size="sm" (click)="deleteBudget(budget.id!)">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-8 text-center text-steel">No hay presupuestos registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Items Panel -->
      @if (selectedBudget) {
        <app-card>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-nero">Items del Presupuesto v{{ selectedBudget.version }}</h2>
            <div class="flex gap-2">
              <app-button variant="primary" size="sm" (click)="openAddItemModal()">+ Agregar Item</app-button>
              <app-button variant="secondary" size="sm" (click)="selectedBudget = null">Cerrar</app-button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-steel/30">
                  <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Zona</th>
                  <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Descripción</th>
                  <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Unidad</th>
                  <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cantidad</th>
                  <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Precio Unit.</th>
                  <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                @for (item of budgetItems; track item.id) {
                  <tr class="border-b border-steel/10 hover:bg-cement/50">
                    <td class="py-3 px-4 text-steel">{{ item.zone || '—' }}</td>
                    <td class="py-3 px-4 font-medium text-nero">{{ item.description }}</td>
                    <td class="py-3 px-4 text-steel">{{ item.unit || '—' }}</td>
                    <td class="py-3 px-4 text-right text-nero">{{ item.quantity }}</td>
                    <td class="py-3 px-4 text-right text-nero">{{ formatCurrency(item.unitPrice) }}</td>
                    <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(item.totalPrice) }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-8 text-center text-steel">No hay items en este presupuesto.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

      <!-- Create Budget Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeCreateModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-bold text-nero">Nuevo Presupuesto</h2>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Proyecto ID *</label>
              <input
                type="number"
                [(ngModel)]="newBudget.projectId"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              />
            </div>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Tipo *</label>
              <select
                [(ngModel)]="newBudget.budgetType"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                <option value="ORIGINAL">Original</option>
                <option value="ANNEX">Anexo</option>
                <option value="VARIATION">Variación</option>
              </select>
            </div>

            <app-input label="Notas" [value]="newBudget.notes ?? ''" (valueChange)="newBudget.notes = $event" />
            <app-input label="Condiciones de Pago" [value]="newBudget.paymentTerms ?? ''" (valueChange)="newBudget.paymentTerms = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeCreateModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="createBudget()">Crear</app-button>
            </div>
          </div>
        </div>
      }

      <!-- Add Item Modal -->
      @if (showItemModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeItemModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4">
            <h2 class="text-lg font-bold text-nero">Agregar Item</h2>

            <app-input label="Zona" [value]="newItem.zone ?? ''" (valueChange)="newItem.zone = $event" />
            <app-input label="Descripción *" [value]="newItem.description ?? ''" (valueChange)="newItem.description = $event" />
            <app-input label="Unidad" [value]="newItem.unit ?? ''" (valueChange)="newItem.unit = $event" />
            <app-input label="Cantidad *" type="number" [value]="newItem.quantity?.toString() ?? ''" (valueChange)="newItem.quantity = +$event" />
            <app-input label="Precio Unitario *" type="number" [value]="newItem.unitPrice?.toString() ?? ''" (valueChange)="newItem.unitPrice = +$event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeItemModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="addItem()">Agregar</app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  budgetItems: BudgetItem[] = [];
  selectedBudget: Budget | null = null;
  showCreateModal = false;
  showItemModal = false;
  newBudget: Partial<Budget> = this.emptyBudgetForm();
  newItem: Partial<BudgetItem> = this.emptyItemForm();

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.budgetService.getAll().subscribe({
      next: (data) => (this.budgets = data),
    });
  }

  getCountByStatus(status: BudgetStatus): number {
    return this.budgets.filter((b) => b.status === status).length;
  }

  getTotalAmount(): number {
    return this.budgets.reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  }

  viewItems(budget: Budget): void {
    this.selectedBudget = budget;
    this.budgetService.getItems(budget.id!).subscribe({
      next: (items) => (this.budgetItems = items),
    });
  }

  approveBudget(id: number): void {
    if (!confirm('¿Aprobar este presupuesto?')) return;
    const userId = 1; // TODO: get from auth context
    this.budgetService.approve(id, userId).subscribe({
      next: () => this.loadBudgets(),
    });
  }

  openCreateModal(): void {
    this.newBudget = this.emptyBudgetForm();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newBudget = this.emptyBudgetForm();
  }

  createBudget(): void {
    if (!this.newBudget.projectId || !this.newBudget.budgetType) return;
    this.budgetService.create(this.newBudget as Budget).subscribe({
      next: () => {
        this.loadBudgets();
        this.closeCreateModal();
      },
    });
  }

  openAddItemModal(): void {
    this.newItem = this.emptyItemForm();
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.newItem = this.emptyItemForm();
  }

  addItem(): void {
    if (!this.selectedBudget?.id || !this.newItem.description) return;
    this.budgetService.addItem(this.selectedBudget.id, this.newItem as BudgetItem).subscribe({
      next: () => {
        this.viewItems(this.selectedBudget!);
        this.closeItemModal();
      },
    });
  }

  deleteBudget(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => this.loadBudgets(),
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }

  private emptyBudgetForm(): Partial<Budget> {
    return { projectId: 0, budgetType: 'ORIGINAL', status: 'DRAFT', version: 1, totalAmount: 0, discountAmount: 0, finalAmount: 0 };
  }

  private emptyItemForm(): Partial<BudgetItem> {
    return { zone: '', description: '', unit: '', quantity: 0, unitPrice: 0, totalPrice: 0, orderNum: 0 };
  }
}
