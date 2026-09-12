import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { BudgetsComponent } from './budgets.component';
import { BudgetService } from './services/budget.service';
import { ProjectService } from '../projects/services/project.service';
import { Budget } from './types/budget.types';
import { NotificationService } from '@app/services/notification.service';

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;
  let budgetService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    getItems: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingBudget: Budget = {
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

  beforeEach(async () => {
    budgetService = {
      getAll: vi.fn().mockReturnValue(of([existingBudget])),
      create: vi.fn(),
      getItems: vi.fn().mockReturnValue(of([])),
      delete: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BudgetsComponent],
      providers: [
        { provide: BudgetService, useValue: budgetService },
        {
          provide: ProjectService,
          useValue: {
            getAll: vi.fn().mockReturnValue(
              of([
                {
                  id: 1,
                  clientId: 1,
                  name: 'Proyecto Uno',
                  address: '',
                  latitude: 0,
                  longitude: 0,
                  status: 'PLANNED',
                  active: true,
                },
              ]),
            ),
            create: vi.fn(),
          },
        },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the confirmed budget with its project projection, closes the form, and opens its editor', () => {
    const savedBudget = { ...existingBudget, id: 2 };
    budgetService.create.mockReturnValue(of(savedBudget));
    component.openCreateModal();
    component.onFormChange(savedBudget);

    component.createBudget();

    const displayedBudget = {
      ...savedBudget,
      projectName: 'Proyecto Uno',
      project: component.projects()[0],
    };
    expect(component.budgets()).toEqual([existingBudget, displayedBudget]);
    expect(component.showCreateModal()).toBe(false);
    expect(component.selectedBudget).toEqual(displayedBudget);
    expect(budgetService.getItems).toHaveBeenCalledWith(2);
    expect(notifications.success).toHaveBeenCalledWith('Presupuesto creado correctamente.');
    expect(budgetService.getAll).toHaveBeenCalledTimes(1);
  });

  it('preserves the list and form on create error and notifies the user', () => {
    const form = { ...existingBudget, id: undefined, totalAmount: 250, finalAmount: 250 };
    budgetService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.createBudget();

    expect(component.budgets()).toEqual([existingBudget]);
    expect(component.showCreateModal()).toBe(true);
    expect(component.newBudget).toMatchObject(form);
    expect(component.selectedBudget).toBeNull();
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el presupuesto. Inténtalo de nuevo.',
    );
    expect(budgetService.delete).not.toHaveBeenCalled();
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Budget[]>();
    const savedBudget = { ...existingBudget, id: 2 };
    budgetService.getAll.mockReturnValue(pendingLoad);
    budgetService.create.mockReturnValue(of(savedBudget));
    fixture.destroy();
    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.newBudget = savedBudget;

    component.createBudget();
    pendingLoad.next([existingBudget]);

    expect(component.budgets()).toEqual([
      { ...savedBudget, projectName: 'Proyecto Uno', project: component.projects()[0] },
    ]);
  });

  it('confirmed deletion sends confirmed=true and reloads the list', () => {
    budgetService.delete.mockReturnValue(of(undefined));
    budgetService.getAll.mockReturnValue(of([existingBudget]));

    component.deleteBudget(1, true);

    expect(budgetService.delete).toHaveBeenCalledWith(1, true);
    expect(notifications.success).toHaveBeenCalledWith('Presupuesto eliminado correctamente.');
  });

  it('cancelled deletion does not send any request', () => {
    component.deleteBudget(1, false);

    expect(budgetService.delete).not.toHaveBeenCalled();
  });

  it('deletion error notifies the user', () => {
    budgetService.delete.mockReturnValue(
      throwError(() => ({ status: 409, error: { error: 'Cannot remove an invoice that has been issued or paid' } })),
    );

    component.deleteBudget(1, true);

    expect(notifications.error).toHaveBeenCalled();
  });
});
