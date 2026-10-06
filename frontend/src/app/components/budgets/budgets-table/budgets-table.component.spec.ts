import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BudgetsTableComponent } from './budgets-table.component';
import { Budget } from '../../../features/budgets/types/budget.types';

describe('BudgetsTableComponent', () => {
  let fixture: ComponentFixture<BudgetsTableComponent>;

  const draftBudget: Budget = {
    id: 1,
    projectId: 1,
    version: 1,
    budgetType: 'ORIGINAL',
    status: 'DRAFT',
    totalAmount: 100,
    discountAmount: 0,
    finalAmount: 100,
    createdById: 1,
  };

  const approvedBudget: Budget = {
    ...draftBudget,
    id: 2,
    status: 'APPROVED',
  };

  const supersededBudget: Budget = {
    ...draftBudget,
    id: 3,
    status: 'SUPERSEDED',
  };

  const budgets = [draftBudget, approvedBudget, supersededBudget];

  const pdfButtons = (): HTMLButtonElement[] =>
    Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).filter(
      (b) => b.textContent?.trim() === 'PDF',
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetsTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsTableComponent);
    fixture.componentRef.setInput('budgets', budgets);
    fixture.detectChanges();
  });

  it('renders one PDF button per budget row, including SUPERSEDED rows', () => {
    expect(pdfButtons()).toHaveLength(budgets.length);

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(budgets.length);
    const supersededRowButtons = Array.from<HTMLButtonElement>(
      rows[2].querySelectorAll('button'),
    ).map((b) => b.textContent?.trim());
    expect(supersededRowButtons).toContain('PDF');
    // Unlike Items, PDF is not gated by status
    expect(supersededRowButtons).not.toContain('Items');
  });

  it('places the PDF button as the first action button of the row', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    const firstAction = rows[0].querySelector('td:last-child button');
    expect(firstAction?.textContent?.trim()).toBe('PDF');
  });

  it('emits onDownloadPdf with the budget id and does not emit onViewItems', () => {
    const onDownloadPdf = vi.fn();
    const onViewItems = vi.fn();
    fixture.componentRef.instance.onDownloadPdf.subscribe(onDownloadPdf);
    fixture.componentRef.instance.onViewItems.subscribe(onViewItems);

    pdfButtons()[1].click();

    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
    expect(onDownloadPdf).toHaveBeenCalledWith(2);
    expect(onViewItems).not.toHaveBeenCalled();
  });
});
