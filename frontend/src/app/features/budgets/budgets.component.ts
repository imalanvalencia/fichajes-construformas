import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BudgetService } from './services/budget.service';
import { ProjectService } from '../projects/services/project.service';
import { Budget, BudgetItem } from './types/budget.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '@components/shared/button/button.component';
import { BudgetsTableComponent } from '@components/budgets/budgets-table/budgets-table.component';
import { BudgetSummaryComponent } from '@components/budgets/budget-summary/budget-summary.component';
import { BudgetEditorComponent } from '@components/budgets/budget-editor/budget-editor.component';
import { CreateBudgetModalComponent } from '@components/budgets/create-budget-modal/create-budget-modal.component';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    BudgetsTableComponent,
    BudgetSummaryComponent,
    BudgetEditorComponent,
    CreateBudgetModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Presupuestos</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Presupuesto</app-button>
      </div>

      @if (budgets().length > 0) {
        <app-budget-summary [budgets]="budgets()" />
      }

      <app-budgets-table
        [budgets]="budgets()"
        (onViewItems)="viewItems($event)"
        (onApprove)="approveBudget($event)"
        (onReject)="rejectBudget($event)"
        (onUpdate)="updateBudget($event)"
        (onDelete)="deleteBudget($event)"
      />

      @if (selectedBudget) {
        <app-budget-editor
          [budget]="selectedBudget"
          [items]="budgetItems()"
          (onClose)="closeItemsPanel()"
          (onSave)="onSaveBudget($event)"
          (onUpdateItem)="onUpdateItem($event)"
          (onDeleteItem)="deleteItem($event)"
          (onAddItem)="addItem($event)"
        />
      }

      <app-create-budget-modal
        [show]="showCreateModal()"
        [projects]="projects()"
        [form]="newBudget"
        (onClose)="closeCreateModal()"
        (onCreate)="createBudget()"
        (onCreateProject)="onCreateProject($event)"
        (formChange)="onFormChange($event)"
      />
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
  private loadVersion = 0;

  constructor(
    private budgetService: BudgetService,
    private projectService: ProjectService,
    private notifications: NotificationService,
  ) {
    this.loadBudgets();
    this.projectService.getAll().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err),
    });
  }

  loadBudgets(): void {
    const requestVersion = ++this.loadVersion;
    this.budgetService.getAll().subscribe({
      next: (data) => {
        if (requestVersion !== this.loadVersion) return;
        this.budgets.set(data);
      },
      error: (err) => console.error('Failed to load budgets', err),
    });
  }

  viewItems(budget: Budget): void {
    this.openEditor(budget);
  }

  closeItemsPanel(): void {
    this.selectedBudget = null;
  }

  onSaveBudget(changes: Partial<Budget>): void {
    if (!this.selectedBudget?.id) return;
    this.budgetService.createNewVersion(this.selectedBudget.id, 1).subscribe({
      next: () => {
        this.loadBudgets();
        alert('Borrador guardado.');
      },
      error: (err) => {
        alert('Error al guardar: ' + (err.error?.message || err.message));
      },
    });
  }

  onUpdateItem(event: { id: number; changes: Partial<BudgetItem> }): void {
    if (!this.selectedBudget?.id) return;
    // TODO: Implement PUT /api/budgets/{budgetId}/items/{itemId} in the backend
    console.log('Update item', event.id, event.changes);
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

  onFormChange(change: Partial<Budget>): void {
    this.newBudget = { ...this.newBudget, ...change };
  }

  createBudget(): void {
    if (!this.newBudget.projectId || !this.newBudget.budgetType) return;
    this.budgetService.create(this.newBudget as Budget).subscribe({
      next: (created) => {
        const budget = this.toDisplayBudget(created);
        this.loadVersion++;
        this.budgets.update((budgets) => [...budgets, budget]);
        this.closeCreateModal();
        this.openEditor(budget);
        this.notifications.success('Presupuesto creado correctamente.');
      },
      error: () => {
        this.notifications.error('No se pudo crear el presupuesto. Inténtalo de nuevo.');
      },
    });
  }

  openEditor(budget: Budget): void {
    this.selectedBudget = budget;
    this.budgetService.getItems(budget.id!).subscribe({
      next: (items) => this.budgetItems.set(items),
    });
  }

  addItem(item: Partial<BudgetItem>): void {
    if (!this.selectedBudget?.id) return;
    this.budgetService.addItem(this.selectedBudget.id, item as BudgetItem).subscribe({
      next: () => this.viewItems(this.selectedBudget!),
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

  deleteBudget(id: number, confirmed?: boolean): void {
    if (confirmed === false) return;
    if (confirmed === undefined && !confirm('¿Estás seguro de eliminar este presupuesto?')) return;
    this.budgetService.delete(id, true).subscribe({
      next: () => {
        this.loadBudgets();
        this.notifications.success('Presupuesto eliminado correctamente.');
      },
      error: (err) => {
        const message = err.error?.error || err.message || 'Error al eliminar';
        this.notifications.error(message);
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
      includesMaterials: false,
      includesIva: false,
    };
  }

  private toDisplayBudget(budget: Budget): Budget {
    const project = this.projects().find((item) => item.id === budget.projectId);

    return {
      ...budget,
      projectName: project?.name ?? budget.projectName,
      project: project ?? budget.project,
    };
  }
}
