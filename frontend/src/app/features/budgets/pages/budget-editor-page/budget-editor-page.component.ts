import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BudgetService } from '../../services/budget.service';
import { Budget, BudgetItem } from '../../types/budget.types';
import { BudgetEditorComponent } from '@components/budgets/budget-editor/budget-editor.component';
import { NotificationService } from '@app/services/notification.service';
import { SidebarService } from '@app/services/sidebar.service';

@Component({
  selector: 'app-budget-editor-page',
  standalone: true,
  imports: [BudgetEditorComponent],
  template: `
    <app-budget-editor
      [budget]="budget()"
      [items]="budgetItems()"
      [hasPrevious]="hasPrevious()"
      [hasNext]="hasNext()"
      [isAddingItem]="addingItem()"
      (onClose)="close()"
      (onSave)="onSaveBudget($event)"
      (onUpdateItem)="onUpdateItem($event)"
      (onDeleteItem)="deleteItem($event)"
      (onAddItem)="addItem($event)"
      (onNavigate)="navigateBudget($event)"
    />
  `,
})
export class BudgetEditorPageComponent {
  budget = signal<Budget | null>(null);
  budgetItems = signal<BudgetItem[]>([]);
  allBudgets = signal<Budget[]>([]);
  addingItem = signal(false);

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private budgetService = inject(BudgetService);
  private notifications = inject(NotificationService);
  private sidebarService = inject(SidebarService);

  constructor() {
    this.sidebarService.hide();
    this.destroyRef.onDestroy(() => this.sidebarService.show());

    this.loadAllBudgets();

    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        if (!id) return of(null as { budget: Budget; items: BudgetItem[] } | null);
        return forkJoin({
          budget: this.budgetService.getById(id),
          items: this.budgetService.getItems(id),
        });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (result) => {
        if (result) {
          this.budget.set(result.budget);
          this.budgetItems.set(result.items);
        }
      },
      error: () => {
        this.notifications.error('No se pudo cargar el presupuesto.');
        this.router.navigate(['/budgets']);
      },
    });
  }

  private loadAllBudgets(): void {
    this.budgetService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.allBudgets.set(data),
    });
  }

  close(): void {
    this.router.navigate(['/budgets']);
  }

  hasPrevious(): boolean {
    const current = this.budget();
    if (!current) return false;
    const idx = this.allBudgets().findIndex((b) => b.id === current.id);
    return idx > 0;
  }

  hasNext(): boolean {
    const current = this.budget();
    if (!current) return false;
    const idx = this.allBudgets().findIndex((b) => b.id === current.id);
    return idx >= 0 && idx < this.allBudgets().length - 1;
  }

  navigateBudget(direction: 'prev' | 'next'): void {
    const current = this.budget();
    if (!current) return;
    const idx = this.allBudgets().findIndex((b) => b.id === current.id);
    const newIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (newIdx >= 0 && newIdx < this.allBudgets().length) {
      const newId = this.allBudgets()[newIdx].id;
      this.router.navigate(['/budgets', newId, 'editor']);
    }
  }

  onSaveBudget(changes: Partial<Budget>): void {
    const current = this.budget();
    if (!current?.id) return;
    this.budgetService.createNewVersion(current.id, 1).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.success('Borrador guardado.');
      },
      error: (err) => {
        this.notifications.error('Error al guardar: ' + (err.error?.message || err.message));
      },
    });
  }

  onUpdateItem(event: { id: number; changes: Partial<BudgetItem> }): void {
    // TODO: Implement PUT /api/budgets/{budgetId}/items/{itemId} in the backend
    console.log('Update item', event.id, event.changes);
  }

  addItem(item: Partial<BudgetItem>): void {
    const current = this.budget();
    if (!current?.id) return;
    this.addingItem.set(true);
    this.budgetService.addItem(current.id, item as BudgetItem).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        this.budgetItems.update((items) => [...items, saved]);
        this.notifications.success('Partida agregada correctamente.');
        this.addingItem.set(false);
      },
      error: (err) => {
        console.error('Error adding item:', err);
        const message = err.error?.message || err.error?.error || err.message || 'Error al agregar item';
        this.notifications.error(message);
        this.addingItem.set(false);
      },
    });
  }

  deleteItem(id: number): void {
    if (!confirm('¿Eliminar este item?')) return;
    const current = this.budget();
    if (!current?.id) return;

    this.budgetService.deleteItem(current.id, id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.budgetItems.update((items) => items.filter((item) => item.id !== id));
      },
      error: (err) => {
        console.error('Error deleting item:', err);
        const message = err.error?.message || err.error?.error || err.message || 'Error al eliminar item';
        this.notifications.error(message);
      },
    });
  }
}
