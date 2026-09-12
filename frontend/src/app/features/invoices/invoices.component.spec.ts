import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { InvoicesComponent } from './invoices.component';
import { InvoiceService } from './services/invoice.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Invoice } from './types/invoice.types';
import { NotificationService } from '@app/services/notification.service';

describe('InvoicesComponent', () => {
  let component: InvoicesComponent;
  let fixture: ComponentFixture<InvoicesComponent>;
  let invoiceService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingInvoice: Invoice = {
    id: 1,
    projectId: 1,
    clientId: 1,
    invoiceNumber: 'F-001',
    status: 'DRAFT',
    subtotal: 100,
    taxRate: 21,
    taxAmount: 21,
    total: 121,
    createdById: 1,
  };

  beforeEach(async () => {
    invoiceService = {
      getAll: vi.fn().mockReturnValue(of([existingInvoice])),
      create: vi.fn(),
      update: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [InvoicesComponent],
      providers: [
        { provide: InvoiceService, useValue: invoiceService },
        {
          provide: ClientService,
          useValue: {
            getAll: vi
              .fn()
              .mockReturnValue(of([{ id: 1, name: 'Cliente Uno', email: '', active: true }])),
            create: vi.fn(),
          },
        },
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

    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the confirmed invoice with relationship display labels and preserves server totals', () => {
    const savedInvoice = { ...existingInvoice, id: 2, subtotal: 200, taxAmount: 40, total: 240 };
    invoiceService.create.mockReturnValue(of(savedInvoice));
    component.openCreateModal();
    component.onFormChange(savedInvoice);

    component.saveInvoice();

    expect(component.invoices()).toEqual([
      existingInvoice,
      { ...savedInvoice, projectName: 'Proyecto Uno', clientName: 'Cliente Uno' },
    ]);
    expect(component.showModal()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Factura creada correctamente.');
    expect(invoiceService.getAll).toHaveBeenCalledTimes(1);
  });

  it('preserves the list and form on create error and notifies the user', () => {
    invoiceService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange({ ...existingInvoice, total: 240 });

    component.saveInvoice();

    expect(component.invoices()).toEqual([existingInvoice]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject({ ...existingInvoice, total: 240 });
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear la factura. Inténtalo de nuevo.',
    );
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Invoice[]>();
    const savedInvoice = { ...existingInvoice, id: 2 };
    invoiceService.getAll.mockReturnValue(pendingLoad);
    invoiceService.create.mockReturnValue(of(savedInvoice));
    fixture.destroy();
    fixture = TestBed.createComponent(InvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = savedInvoice;

    component.saveInvoice();
    pendingLoad.next([existingInvoice]);

    expect(component.invoices()).toEqual([
      { ...savedInvoice, projectName: 'Proyecto Uno', clientName: 'Cliente Uno' },
    ]);
  });

  it('keeps edits on the update flow instead of applying create behavior', () => {
    invoiceService.update.mockReturnValue(of(existingInvoice));
    component.openEditModal(existingInvoice);

    component.saveInvoice();

    expect(invoiceService.update).toHaveBeenCalledWith(1, expect.objectContaining({ total: 121 }));
    expect(invoiceService.create).not.toHaveBeenCalled();
  });
});
