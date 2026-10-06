import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { BudgetsComponent } from './budgets.component';
import { BudgetService } from './services/budget.service';
import { ProjectService } from '../projects/services/project.service';
import { Budget } from './types/budget.types';
import { NotificationService } from '@app/services/notification.service';
import { AuthService } from '@app/auth/services/auth.service';
import { AuthResponse } from '@app/auth/types/auth.types';

type UrlMethodName = 'createObjectURL' | 'revokeObjectURL';

/** jsdom does not implement URL.createObjectURL/revokeObjectURL, so tests stub them directly. */
function restoreUrlMethod(name: UrlMethodName, original: unknown): void {
  const url = window.URL as unknown as Record<string, unknown>;
  if (original) {
    url[name] = original;
  } else {
    delete url[name];
  }
}

describe('BudgetsComponent', () => {
  let component: BudgetsComponent;
  let fixture: ComponentFixture<BudgetsComponent>;
  let budgetService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    approve: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
    createNewVersion: ReturnType<typeof vi.fn>;
    downloadBudgetPdf: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let authService: { hasRole: ReturnType<typeof vi.fn>; getUser: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  let originalCreateObjectURL: unknown;
  let originalRevokeObjectURL: unknown;
  let originalAnchorClick: unknown;
  let anchorHadOwnClick: boolean;

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

  const mockAdminAuthResponse: AuthResponse = {
    accessToken: 'token',
    refreshToken: 'refresh',
    email: 'admin@test.com',
    roles: ['ADMIN'],
    name: 'Admin User',
  };

  const mockOperatorAuthResponse: AuthResponse = {
    accessToken: 'token',
    refreshToken: 'refresh',
    email: 'operator@test.com',
    roles: ['OPERATOR'],
    name: 'Operator User',
  };

  beforeEach(async () => {
    budgetService = {
      getAll: vi.fn().mockReturnValue(of([existingBudget])),
      create: vi.fn(),
      delete: vi.fn(),
      approve: vi.fn().mockReturnValue(of(existingBudget)),
      updateStatus: vi.fn().mockReturnValue(of(existingBudget)),
      createNewVersion: vi.fn().mockReturnValue(of(existingBudget)),
      downloadBudgetPdf: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };
    authService = { hasRole: vi.fn().mockReturnValue(false), getUser: vi.fn() };
    router = { navigate: vi.fn().mockResolvedValue(true) };

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
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    originalCreateObjectURL = window.URL.createObjectURL;
    originalRevokeObjectURL = window.URL.revokeObjectURL;
    originalAnchorClick = HTMLAnchorElement.prototype.click;
    anchorHadOwnClick = Object.prototype.hasOwnProperty.call(HTMLAnchorElement.prototype, 'click');
  });

  afterEach(() => {
    restoreUrlMethod('createObjectURL', originalCreateObjectURL);
    restoreUrlMethod('revokeObjectURL', originalRevokeObjectURL);
    if (anchorHadOwnClick) {
      HTMLAnchorElement.prototype.click = originalAnchorClick as () => void;
    } else {
      delete (HTMLAnchorElement.prototype as { click?: () => void }).click;
    }
  });

  it('closes the form, notifies, and navigates to the new budget editor on create', () => {
    const savedBudget = { ...existingBudget, id: 2 };
    budgetService.create.mockReturnValue(of(savedBudget));
    component.openCreateModal();
    component.onFormChange(savedBudget);

    component.createBudget();

    expect(budgetService.create).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
    expect(component.showCreateModal()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/budgets', 2, 'editor']);
    expect(notifications.success).toHaveBeenCalledWith('Presupuesto creado correctamente.');
    expect(component.budgets()).toEqual([existingBudget]);
    expect(budgetService.getAll).toHaveBeenCalledTimes(1);
  });

  it('openEditor navigates to the budget editor route', () => {
    component.openEditor(existingBudget);

    expect(router.navigate).toHaveBeenCalledWith(['/budgets', 1, 'editor']);
    expect(budgetService.create).not.toHaveBeenCalled();
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
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el presupuesto. Inténtalo de nuevo.',
    );
    expect(budgetService.delete).not.toHaveBeenCalled();
  });

  it('discards a stale list response after create bumps the load version', () => {
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

    expect(router.navigate).toHaveBeenCalledWith(['/budgets', 2, 'editor']);
    expect(component.budgets()).toEqual([]);
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

  describe('approveBudget', () => {
    it('should not approve and show error when user is not ADMIN', () => {
      authService.hasRole.mockReturnValue(false);
      component.isAdmin.set(false);

      component.approveBudget(1);

      expect(notifications.error).toHaveBeenCalledWith(
        'Solo los administradores pueden aprobar presupuestos.',
      );
      expect(budgetService.approve).not.toHaveBeenCalled();
    });

    it('should approve when user is ADMIN and call the service', () => {
      authService.hasRole.mockReturnValue(true);
      component.isAdmin.set(true);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      component.approveBudget(1);

      expect(authService.hasRole).toHaveBeenCalledWith('ADMIN');
      expect(budgetService.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('downloadPdf', () => {
    it('requests the PDF and downloads it as presupuesto-<id>.pdf', () => {
      const blob = new Blob(['pdf-bytes'], { type: 'application/pdf' });
      budgetService.downloadBudgetPdf.mockReturnValue(of(blob));

      const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const revokeObjectURL = vi.fn();
      const click = vi.fn();
      let clickedAnchor: HTMLAnchorElement | undefined;
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = revokeObjectURL;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        clickedAnchor = this;
        click();
      };

      component.downloadPdf(1);

      expect(budgetService.downloadBudgetPdf).toHaveBeenCalledWith(1);
      expect(createObjectURL).toHaveBeenCalledWith(blob);
      expect(click).toHaveBeenCalledTimes(1);
      expect(clickedAnchor?.download).toBe('presupuesto-1.pdf');
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('notifies the user and downloads nothing when the PDF request fails', () => {
      budgetService.downloadBudgetPdf.mockReturnValue(
        throwError(() => new Error('PDF generation failed')),
      );

      const createObjectURL = vi.fn();
      const revokeObjectURL = vi.fn();
      const click = vi.fn();
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = revokeObjectURL;
      HTMLAnchorElement.prototype.click = click;

      component.downloadPdf(1);

      expect(notifications.error).toHaveBeenCalledWith(
        'No se pudo generar el PDF del presupuesto.',
      );
      expect(createObjectURL).not.toHaveBeenCalled();
      expect(click).not.toHaveBeenCalled();
      expect(revokeObjectURL).not.toHaveBeenCalled();
    });
  });
});
