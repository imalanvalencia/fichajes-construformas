import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { SuppliersComponent } from './suppliers.component';
import { SupplierService } from './services/supplier.service';
import { Supplier } from './types/supplier.types';
import { NotificationService } from '@app/services/notification.service';

describe('SuppliersComponent', () => {
  let component: SuppliersComponent;
  let fixture: ComponentFixture<SuppliersComponent>;
  let supplierService: {
    getAll: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingSupplier: Supplier = { id: 1, name: 'Proveedor existente', active: true };

  beforeEach(async () => {
    supplierService = {
      getAll: vi.fn().mockReturnValue(of([existingSupplier])),
      search: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SuppliersComponent],
      providers: [
        { provide: SupplierService, useValue: supplierService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the saved supplier immediately, closes the form, and notifies success', () => {
    const savedSupplier: Supplier = { id: 2, name: 'Proveedor nuevo', active: true };
    supplierService.create.mockReturnValue(of(savedSupplier));
    component.openCreateModal();
    component.onFormChange({ name: savedSupplier.name });

    component.saveSupplier();

    expect(component.suppliers()).toEqual([existingSupplier, savedSupplier]);
    expect(component.filteredSuppliers()).toEqual([existingSupplier, savedSupplier]);
    expect(component.showModal()).toBe(false);
    expect(component.formData).toEqual({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      bankAccount: '',
      notes: '',
    });
    expect(notifications.success).toHaveBeenCalledWith('Proveedor creado correctamente.');
    expect(supplierService.getAll).toHaveBeenCalledTimes(1);
  });

  it('adds a saved supplier to the visible list only when it matches the active filter', () => {
    const matchingSupplier: Supplier = { id: 2, name: 'Ana Suministros', active: true };
    const nonMatchingSupplier: Supplier = { id: 3, name: 'Luis Materiales', active: true };
    component.searchTerm = 'ana';
    component.filteredSuppliers.set([]);
    supplierService.create
      .mockReturnValueOnce(of(matchingSupplier))
      .mockReturnValueOnce(of(nonMatchingSupplier));

    component.formData = { name: matchingSupplier.name };
    component.saveSupplier();
    component.formData = { name: nonMatchingSupplier.name };
    component.saveSupplier();

    expect(component.suppliers()).toEqual([
      existingSupplier,
      matchingSupplier,
      nonMatchingSupplier,
    ]);
    expect(component.filteredSuppliers()).toEqual([matchingSupplier]);
  });

  it('preserves the lists and form on create error and notifies the user', () => {
    const form = { name: 'Proveedor pendiente' };
    supplierService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.saveSupplier();

    expect(component.suppliers()).toEqual([existingSupplier]);
    expect(component.filteredSuppliers()).toEqual([existingSupplier]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject(form);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el proveedor. Inténtalo de nuevo.',
    );
    expect(supplierService.delete).not.toHaveBeenCalled();
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Supplier[]>();
    const savedSupplier: Supplier = { id: 2, name: 'Proveedor nuevo', active: true };
    supplierService.getAll.mockReturnValue(pendingLoad);
    supplierService.create.mockReturnValue(of(savedSupplier));
    fixture.destroy();
    fixture = TestBed.createComponent(SuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = { name: savedSupplier.name };

    component.saveSupplier();
    pendingLoad.next([existingSupplier]);

    expect(component.suppliers()).toEqual([savedSupplier]);
    expect(component.filteredSuppliers()).toEqual([savedSupplier]);
  });
});
