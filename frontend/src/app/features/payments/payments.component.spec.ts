import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { PaymentsComponent } from './payments.component';
import { PaymentService } from './services/payment.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Payment } from './types/payment.types';
import { NotificationService } from '@app/services/notification.service';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let paymentService: {
    getAll: ReturnType<typeof vi.fn>;
    getMethods: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingPayment: Payment = {
    id: 1,
    projectId: 1,
    clientId: 1,
    paymentMethodId: 1,
    amount: 100,
    paymentDate: '2026-09-11',
    type: 'PHASE_1',
    createdById: 1,
  };

  beforeEach(async () => {
    paymentService = {
      getAll: vi.fn().mockReturnValue(of([existingPayment])),
      getMethods: vi.fn().mockReturnValue(of([{ id: 1, name: 'Transferencia', active: true }])),
      create: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [
        { provide: PaymentService, useValue: paymentService },
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

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the confirmed payment with display labels, closes the form, and updates the summary state', () => {
    const savedPayment = { ...existingPayment, id: 2, amount: 250 };
    paymentService.create.mockReturnValue(of(savedPayment));
    component.openCreateModal();
    component.onFormChange(savedPayment);

    component.createPayment();

    expect(component.payments()).toEqual([
      existingPayment,
      {
        ...savedPayment,
        projectName: 'Proyecto Uno',
        clientName: 'Cliente Uno',
        paymentMethodName: 'Transferencia',
      },
    ]);
    expect(component.payments().reduce((total, payment) => total + payment.amount, 0)).toBe(350);
    expect(component.showModal()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Pago creado correctamente.');
    expect(paymentService.getAll).toHaveBeenCalledTimes(1);
  });

  it('preserves the list and form on create error and notifies the user', () => {
    const form = { ...existingPayment, amount: 250 };
    paymentService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.createPayment();

    expect(component.payments()).toEqual([existingPayment]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject(form);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el pago. Inténtalo de nuevo.',
    );
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Payment[]>();
    const savedPayment = { ...existingPayment, id: 2 };
    paymentService.getAll.mockReturnValue(pendingLoad);
    paymentService.create.mockReturnValue(of(savedPayment));
    fixture.destroy();
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = savedPayment;

    component.createPayment();
    pendingLoad.next([existingPayment]);

    expect(component.payments()).toEqual([
      {
        ...savedPayment,
        projectName: 'Proyecto Uno',
        clientName: 'Cliente Uno',
        paymentMethodName: 'Transferencia',
      },
    ]);
  });
});
