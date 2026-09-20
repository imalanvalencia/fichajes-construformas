import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaymentService } from './services/payment.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Payment, PaymentMethod } from './types/payment.types';
import { Client } from '../clients/types/client.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { CardComponent } from '@shared-components/card/card.component';
import { PaymentsTableComponent } from '@components/payments/payments-table/payments-table.component';
import { PaymentFormModalComponent } from '@components/payments/payment-form-modal/payment-form-modal.component';
import { PaymentsSummaryComponent } from '@components/payments/payments-summary/payments-summary.component';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    ButtonComponent,
    CardComponent,
    PaymentsTableComponent,
    PaymentFormModalComponent,
    PaymentsSummaryComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Pagos</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Pago</app-button>
      </div>

      @if (payments().length > 0) {
        <app-payments-summary [payments]="payments()" [paymentMethods]="paymentMethods()" />
      }

      @if (paymentMethods().length > 0) {
        <app-card>
          <h2 class="text-lg font-bold text-nero mb-4">Métodos de Pago</h2>
          <div class="flex flex-wrap gap-2">
            @for (method of paymentMethods(); track method.id) {
              <span class="font-mono text-xs font-medium px-3 py-1 border border-steel text-nero">
                {{ method.name }}
              </span>
            }
          </div>
        </app-card>
      }

      <app-payments-table [payments]="payments()" />

      <app-payment-form-modal
        [show]="showModal()"
        [form]="formData"
        [clients]="clients()"
        [projects]="projects()"
        [paymentMethods]="paymentMethods()"
        (onClose)="closeModal()"
        (onSave)="createPayment()"
        (onFormChange)="onFormChange($event)"
        (onCreateClient)="onCreateClient($event)"
        (onCreateProject)="onCreateProject($event)"
      />
    </div>
  `,
})
export class PaymentsComponent {
  payments = signal<Payment[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  clients = signal<Client[]>([]);
  projects = signal<Project[]>([]);
  showModal = signal(false);
  formData: Partial<Payment> = this.emptyForm();
  private loadVersion = 0;

  private destroyRef = inject(DestroyRef);
  private paymentService = inject(PaymentService);
  private clientService = inject(ClientService);
  private projectService = inject(ProjectService);
  private notifications = inject(NotificationService);

  constructor() {
    this.loadPayments();
    this.loadMethods();
    this.clientService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.clients.set(data),
    });
    this.projectService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.projects.set(data),
    });
  }

  loadPayments(): void {
    const requestVersion = ++this.loadVersion;
    this.paymentService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (requestVersion !== this.loadVersion) return;
        this.payments.set(data);
      },
    });
  }

  loadMethods(): void {
    this.paymentService.getMethods().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => this.paymentMethods.set(data),
    });
  }

  openCreateModal(): void {
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.formData = this.emptyForm();
  }

  onFormChange(change: Partial<Payment>): void {
    this.formData = { ...this.formData, ...change };
  }

  createPayment(): void {
    if (
      !this.formData.projectId ||
      !this.formData.clientId ||
      !this.formData.paymentMethodId ||
      !this.formData.amount
    )
      return;

    this.paymentService.create(this.formData as Payment).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (created) => {
        this.loadVersion++;
        this.payments.update((payments) => [...payments, this.toDisplayPayment(created)]);
        this.closeModal();
        this.notifications.success('Pago creado correctamente.');
      },
      error: () => {
        this.notifications.error('No se pudo crear el pago. Inténtalo de nuevo.');
      },
    });
  }

  onCreateClient(name: string): void {
    this.clientService.create({ name, email: '', active: true }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (created) => {
        this.clients.update((prev) => [...prev, created]);
        this.formData.clientId = created.id!;
      },
    });
  }

  onCreateProject(name: string): void {
    this.projectService
      .create({
        name,
        clientId: this.formData.clientId || 0,
        address: '',
        latitude: 0,
        longitude: 0,
        status: 'PLANNED',
        active: true,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (created) => {
          this.projects.update((prev) => [...prev, created]);
          this.formData.projectId = created.id!;
        },
      });
  }

  private emptyForm(): Partial<Payment> {
    return {
      projectId: 0,
      clientId: 0,
      paymentMethodId: 0,
      amount: 0,
      paymentDate: '',
      type: 'PHASE_1',
      reference: '',
      notes: '',
    };
  }

  private toDisplayPayment(payment: Payment): Payment {
    const project = this.projects().find((item) => item.id === payment.projectId);
    const client = this.clients().find((item) => item.id === payment.clientId);
    const method = this.paymentMethods().find((item) => item.id === payment.paymentMethodId);

    return {
      ...payment,
      projectName: project?.name ?? payment.projectName,
      clientName: client?.name ?? payment.clientName,
      paymentMethodName: method?.name ?? payment.paymentMethodName,
    };
  }
}
