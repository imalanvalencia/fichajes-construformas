import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { throwError } from 'rxjs';
import { BudgetEditorComponent } from './budget-editor.component';
import { BudgetService } from '../../../features/budgets/services/budget.service';
import { NotificationService } from '../../../services/notification.service';
import { Budget } from '../../../features/budgets/types/budget.types';

const pdfBudget = { id: 42, projectId: 1, version: 1, budgetType: 'ORIGINAL', status: 'DRAFT', totalAmount: 1000, discountAmount: 0, finalAmount: 1000, createdById: 1 } as Budget;

describe('BudgetEditorComponent', () => {
  let component: BudgetEditorComponent;
  let fixture: ComponentFixture<BudgetEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('adds an item when description signal is set and addItem is called', () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);

    component.newItemDescription.set('Install door');
    component.addItem();

    expect(onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Install door', quantity: 1 }),
    );
  });

  it('adds an item when Enter is pressed in the new item row', async () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);

    // Set the description via the signal (app-input writes through CVA)
    component.newItemDescription.set('Install door');
    fixture.detectChanges();
    await fixture.whenStable();

    // Find the app-input wrapper for the description field in the new item row
    const appInputs = fixture.nativeElement.querySelectorAll('app-input');
    let descriptionAppInput: HTMLElement | null = null;
    for (const ai of appInputs) {
      const input = ai.querySelector('input') as HTMLInputElement;
      if (input && input.placeholder === 'Nueva descripción *') {
        descriptionAppInput = ai;
        break;
      }
    }
    expect(descriptionAppInput).toBeTruthy();

    // Dispatch keydown.enter on the <app-input> host element where the binding is
    descriptionAppInput!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Install door', quantity: 1 }),
    );
  });

  it('defaults and clamps a new item quantity to one', () => {
    const onAddItem = vi.fn();
    component.onAddItem.subscribe(onAddItem);
    component.newItemDescription.set('Install door');

    expect(component.newItemQuantity()).toBe(1);

    component.newItemQuantity.set(-2);
    component.addItem();

    expect(onAddItem).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1 }));
    expect(component.newItemQuantity()).toBe(1);
  });
});

describe('BudgetEditorComponent onDownloadPdf', () => {
  let component: BudgetEditorComponent;
  let fixture: ComponentFixture<BudgetEditorComponent>;
  let budgetService: { downloadBudgetPdf: ReturnType<typeof vi.fn> };
  let notifications: { error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    budgetService = { downloadBudgetPdf: vi.fn() };
    notifications = { error: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [BudgetEditorComponent],
      providers: [
        { provide: BudgetService, useValue: budgetService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BudgetEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('budget', pdfBudget);
  });

  it('notifies and does not download when the service errors', () => {
    budgetService.downloadBudgetPdf.mockReturnValue(throwError(() => ({ status: 500 })));
    const createObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;

    component.onDownloadPdf();

    expect(budgetService.downloadBudgetPdf).toHaveBeenCalledWith(42);
    expect(notifications.error).toHaveBeenCalledWith('No se pudo generar el PDF del presupuesto.');
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('does nothing when no budget is loaded', () => {
    fixture.componentRef.setInput('budget', null);

    component.onDownloadPdf();

    expect(budgetService.downloadBudgetPdf).not.toHaveBeenCalled();
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
