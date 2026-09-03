import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetService } from './services/budget.service';
import { ProjectService } from '../projects/services/project.service';
import { Budget, BudgetItem, BudgetStatus } from './types/budget.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { SelectOrCreateComponent } from '../../shared/components/select-or-create/select-or-create.component';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent,
    MetricCardComponent,
    SelectOrCreateComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Presupuestos</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Presupuesto</app-button>
      </div>

      <!-- Summary -->
      @if (budgets().length > 0) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-metric-card [value]="budgets().length" label="Total Presupuestos" color="#1C1C1D" />
          <app-metric-card [value]="getCountByStatus('DRAFT')" label="Borradores" color="#ACB4B6" />
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
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Proyecto
                </th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Versión
                </th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Tipo
                </th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Estado
                </th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Monto Final
                </th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              @for (budget of budgets(); track budget.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-medium text-nero">{{ budget.project?.name || '—' }}</td>
                  <td class="py-3 px-4 text-steel font-mono">v{{ budget.version }}</td>
                  <td class="py-3 px-4 text-steel">{{ budget.budgetType }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="budget.status" />
                  </td>
                  <td class="py-3 px-4 text-right font-medium text-nero">
                    {{ formatCurrency(budget.finalAmount) }}
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    @if (budget.status !== 'SUPERSEDED') {
                      <app-button variant="text" size="sm" (click)="viewItems(budget)"
                        >Items</app-button
                      >
                    }

                    @if (budget.status === 'DRAFT') {
                      <app-button variant="filled" size="sm" (click)="approveBudget(budget.id!)"
                        >Aprobar</app-button
                      >
                      <app-button variant="text" size="sm" (click)="rejectBudget(budget.id!)"
                        >Rechazar</app-button
                      >
                    } @else if (budget.status === 'APPROVED') {
                      <app-button variant="text" size="sm" (click)="updateBudget(budget.id!)"
                        >Actualizar</app-button
                      >
                    } @else if (budget.status === 'REJECTED') {
                      <app-button variant="text" size="sm" (click)="deleteBudget(budget.id!)"
                        >Eliminar</app-button
                      >
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-8 text-center text-steel">
                    No hay presupuestos registrados.
                  </td>
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
            <h2 class="text-lg font-bold text-nero">
              Items del Presupuesto v{{ selectedBudget.version }}
            </h2>
            <app-button variant="text" size="sm" (click)="closeItemsPanel()"
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
                @for (item of budgetItems(); track item.id) {
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
                      <app-button variant="text" size="sm" (click)="deleteItem(item.id!)"
                        >Eliminar</app-button
                      >
                    </td>
                  </tr>
                }

                <!-- Nueva fila editable para agregar items -->
                <tr class="border-t-2 border-cement/50 bg-cement/30" [class.ring-2]="isEditingNewItem()" [class.ring-primary]="isEditingNewItem()">
                  <td class="py-2 px-4">
                    <app-input
                      [value]="newItemDraft().zone ?? ''"
                      (valueChange)="onDraftChange('zone', $event)"
                      placeholder="Zona"
                      class="w-full"
                      (keydown.enter)="saveNewItem()"
                      (blur)="onNewItemBlur()"
                      [autofocus]="true"
                    />
                  </td>
                  <td class="py-2 px-4">
                    <app-input
                      [value]="newItemDraft().description ?? ''"
                      (valueChange)="onDraftChange('description', $event)"
                      placeholder="Descripción *"
                      class="w-full"
                      (keydown.enter)="saveNewItem()"
                      (blur)="onNewItemBlur()"
                    />
                  </td>
                  <td class="py-2 px-4">
                    <app-input
                      [value]="newItemDraft().unit ?? ''"
                      (valueChange)="onDraftChange('unit', $event)"
                      placeholder="Unidad"
                      class="w-full"
                      (keydown.enter)="saveNewItem()"
                      (blur)="onNewItemBlur()"
                    />
                  </td>
                  <td class="py-2 px-4 text-right">
                    <app-input
                      type="number"
                      [value]="newItemDraft().quantity?.toString() ?? ''"
                      (valueChange)="onDraftChangeNumber('quantity', $event)"
                      placeholder="0"
                      class="w-20 text-right"
                      (keydown.enter)="saveNewItem()"
                      (blur)="onNewItemBlur()"
                    />
                  </td>
                  <td class="py-2 px-4 text-right">
                    <app-input
                      type="number"
                      [value]="newItemDraft().unitPrice?.toString() ?? ''"
                      (valueChange)="onDraftChangeNumber('unitPrice', $event)"
                      placeholder="0"
                      class="w-24 text-right"
                      (keydown.enter)="saveNewItem()"
                      (blur)="onNewItemBlur()"
                    />
                  </td>
                  <td class="py-2 px-4 text-right font-medium text-nero">
                    {{ formatCurrency(newItemDraft().totalPrice || 0) }}
                  </td>
                  <td class="py-2 px-4 text-right">
                    @if (isEditingNewItem()) {
                      <app-button variant="filled" size="sm" (click)="saveNewItem()"
                        >Guardar</app-button
                      >
                      <app-button variant="text" size="sm" (click)="cancelNewItem()"
                        >Cancelar</app-button
                      >
                    } @else {
                      <app-button variant="filled" size="sm" (click)="startNewItem()"
                        >+ Agregar</app-button
                      >
                    }
                  </td>
                </tr>

                @if (budgetItems().length === 0 && !isEditingNewItem()) {
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
      }

      <!-- Create Budget Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeCreateModal()"></div>
          <div
            class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 class="text-lg font-bold text-nero">Nuevo Presupuesto</h2>

            <app-select-or-create
              label="Proyecto *"
              [items]="projects()"
              [value]="newBudget.projectId ?? null"
              placeholder="Seleccionar proyecto..."
              [required]="true"
              (valueChange)="newBudget.projectId = $event"
              (create)="onCreateProject($event)"
            />

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

            <app-input
              label="Notas"
              [value]="newBudget.notes ?? ''"
              (valueChange)="newBudget.notes = $event"
            />
            <app-input
              label="Condiciones de Pago"
              [value]="newBudget.paymentTerms ?? ''"
              (valueChange)="newBudget.paymentTerms = $event"
            />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="text" (click)="closeCreateModal()">Cancelar</app-button>
              <app-button variant="filled" (click)="createBudget()">Crear</app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class BudgetsComponent {
  budgets = signal<Budget[]>([]);
  budgetItems = signal<BudgetItem[]>([]);
  projects = signal<Project[]>([]);
  selectedBudget: Budget | null = null;
  showCreateModal = signal(false);
  newBudget: Partial<Budget> = this.emptyBudgetForm();

  // Estado para la fila editable inline
  newItemDraft = signal<Partial<BudgetItem>>(this.emptyItemForm());
  editingNewItem = signal(false);

  constructor(
    private budgetService: BudgetService,
    private projectService: ProjectService,
  ) {
    this.loadBudgets();
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects.set(data);
      },
      error: (err) => console.error('Failed to load projects', err),
    });
  }

  isEditingNewItem = computed(() => this.editingNewItem());

  loadBudgets(): void {
    this.budgetService.getAll().subscribe({
      next: (data) => {
        this.budgets.set(data);
      },
      error: (err) => console.error('Failed to load budgets', err),
    });
  }

  getCountByStatus(status: BudgetStatus): number {
    return this.budgets().filter((b) => b.status === status).length;
  }

  getTotalAmount(): number {
    return this.budgets()
      .filter((b) => b.status !== 'REJECTED')
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  }

  viewItems(budget: Budget): void {
    this.selectedBudget = budget;
    this.cancelNewItem(); // Resetear draft al abrir
    this.budgetService.getItems(budget.id!).subscribe({
      next: (items) => this.budgetItems.set(items),
    });
  }

  closeItemsPanel(): void {
    this.selectedBudget = null;
    this.cancelNewItem();
  }

  approveBudget(id: number): void {
    if (!confirm('¿Aprobar este presupuesto?')) return;
    this.budgetService.approve(id).subscribe({
      next: () => this.loadBudgets(),
    });
  }

  rejectBudget(id: number): void {
    if (!confirm('¿Rechazar este presupuesto?')) return;
    this.budgetService.updateStatus(id, 'REJECTED').subscribe({
      next: () => this.loadBudgets(),
    });
  }

  openCreateModal(): void {
    this.newBudget = this.emptyBudgetForm();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
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

  startNewItem(): void {
    this.newItemDraft.set(this.emptyItemForm());
    this.editingNewItem.set(true);
  }

  cancelNewItem(): void {
    this.newItemDraft.set(this.emptyItemForm());
    this.editingNewItem.set(false);
  }

  onNewItemBlur(): void {
    // Si la fila está vacía y no se está editando activamente, cancelar
    setTimeout(() => {
      const draft = this.newItemDraft();
      const isEmpty = !draft.description && !draft.zone && !draft.unit &&
                      (!draft.quantity || draft.quantity === 0) &&
                      (!draft.unitPrice || draft.unitPrice === 0);
      if (isEmpty && this.editingNewItem()) {
        this.cancelNewItem();
      }
    }, 150);
  }

  onDraftChange(field: string, value: string): void {
    this.newItemDraft.update(d => ({ ...d, [field]: value }));
  }

  onDraftChangeNumber(field: string, value: string): void {
    const num = +value;
    this.newItemDraft.update(d => ({ ...d, [field]: isNaN(num) ? 0 : num }));
    this.updateItemTotal();
  }

  updateItemTotal(): void {
    const draft = this.newItemDraft();
    const qty = draft.quantity || 0;
    const price = draft.unitPrice || 0;
    this.newItemDraft.update(d => ({ ...d, totalPrice: qty * price }));
  }

  saveNewItem(): void {
    const draft = this.newItemDraft();

    // Validar campos requeridos
    if (!draft.description || !this.selectedBudget?.id) {
      return;
    }

    // Calcular total si no está seteado
    const qty = draft.quantity || 0;
    const price = draft.unitPrice || 0;
    const total = draft.totalPrice || (qty * price);

    const itemToSave: Partial<BudgetItem> = {
      ...draft,
      quantity: qty,
      unitPrice: price,
      totalPrice: total,
    };

    this.budgetService.addItem(this.selectedBudget!.id!, itemToSave as BudgetItem).subscribe({
      next: () => {
        this.viewItems(this.selectedBudget!);
        this.cancelNewItem();
      },
      error: (err) => {
        console.error('Error adding item:', err);
        alert('Error al agregar item: ' + (err.error?.message || err.message));
      },
    });
  }

  deleteItem(id: number): void {
    if (!confirm('¿Eliminar este item?')) return;
    if (!this.selectedBudget?.id) return;

    this.budgetService.deleteItem(this.selectedBudget.id, id).subscribe({
      next: () => this.viewItems(this.selectedBudget!),
      error: (err) => {
        console.error('Error deleting item:', err);
        alert('Error al eliminar item: ' + (err.error?.message || err.message));
      },
    });
  }

  deleteBudget(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) return;
    this.budgetService.delete(id).subscribe({
      next: () => this.loadBudgets(),
      error: (err) => {
        if (err.status === 500) {
          alert(
            'No se puede borrar un presupuesto Aprobado.\nCambia su status a DRAFT o REJECTED primero.',
          );
        } else {
          alert('Error al eliminar: ' + (err.error?.message || err.message));
        }
      },
    });
  }

  updateBudget(id: number): void {
    if (!confirm('¿Estás seguro de crear una nueva versión de este presupuesto?')) return;
    this.budgetService.createNewVersion(id, 1).subscribe({
      next: () => this.loadBudgets(),
      error: (err) => {
        alert('Error al crear nueva versión: ' + (err.error?.message || err.message));
      },
    });
  }

  onCreateProject(name: string): void {
    this.projectService
      .create({
        name,
        clientId: 0,
        address: '',
        latitude: 0,
        longitude: 0,
        status: 'PLANNED',
        active: true,
      })
      .subscribe({
        next: (created) => {
          this.projects.update((prev) => [...prev, created]);
          this.newBudget.projectId = created.id!;
        },
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
      value ?? 0,
    );
  }

  private emptyBudgetForm(): Partial<Budget> {
    return {
      projectId: 0,
      budgetType: 'ORIGINAL',
      status: 'DRAFT',
      version: 1,
      totalAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
      createdById: 1,
    };
  }

  private emptyItemForm(): Partial<BudgetItem> {
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
