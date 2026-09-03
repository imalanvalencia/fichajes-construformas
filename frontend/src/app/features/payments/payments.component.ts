import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentService } from './services/payment.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Payment, PaymentMethod, PaymentType } from './types/payment.types';
import { Client } from '../clients/types/client.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { SelectOrCreateComponent } from '../../shared/components/select-or-create/select-or-create.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, MetricCardComponent, SelectOrCreateComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Pagos</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Pago</app-button>
      </div>

      <!-- Summary -->
      @if (payments().length > 0) {
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <app-metric-card
            [value]="payments().length"
            label="Total Pagos"
            color="#1C1C1D"
          />
          <app-metric-card
            [value]="formatCurrency(getTotalAmount())"
            label="Monto Total"
            color="#22C55E"
          />
          <app-metric-card
            [value]="paymentMethods().length"
            label="Métodos de Pago"
            color="#3B82F6"
          />
        </div>
      }

      <!-- Payment Methods -->
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

      <!-- Table -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fecha</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cliente</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Método</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Tipo</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Monto</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Referencia</th>
              </tr>
            </thead>
            <tbody>
              @for (payment of payments(); track payment.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 text-steel">{{ payment.paymentDate }}</td>
                  <td class="py-3 px-4 font-medium text-nero">{{ payment.projectName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ payment.clientName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ payment.paymentMethodName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ formatPaymentType(payment.type) }}</td>
                  <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(payment.amount) }}</td>
                  <td class="py-3 px-4 text-steel font-mono text-xs">{{ payment.reference || '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-steel">No hay pagos registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Create Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-bold text-nero">Nuevo Pago</h2>

            <app-select-or-create
              label="Proyecto *"
              [items]="projects()"
              [value]="formData.projectId ?? null"
              placeholder="Seleccionar proyecto..."
              [required]="true"
              (valueChange)="formData.projectId = $event"
              (create)="onCreateProject($event)"
            />

            <app-select-or-create
              label="Cliente *"
              [items]="clients()"
              [value]="formData.clientId ?? null"
              placeholder="Seleccionar cliente..."
              [required]="true"
              (valueChange)="formData.clientId = $event"
              (create)="onCreateClient($event)"
            />

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Método de Pago *</label>
              <select
                [(ngModel)]="formData.paymentMethodId"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                @for (method of paymentMethods(); track method.id) {
                  <option [value]="method.id">{{ method.name }}</option>
                }
              </select>
            </div>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Tipo *</label>
              <select
                [(ngModel)]="formData.type"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                <option value="PHASE_1">Fase 1</option>
                <option value="PHASE_2">Fase 2</option>
                <option value="PHASE_3">Fase 3</option>
                <option value="EXTRA">Extra</option>
                <option value="INSURANCE">Seguro</option>
              </select>
            </div>

            <app-input label="Monto *" type="number" [value]="formData.amount?.toString() ?? ''" (valueChange)="formData.amount = +$event" />
            <app-input label="Fecha *" type="date" [value]="formData.paymentDate ?? ''" (valueChange)="formData.paymentDate = $event" />
            <app-input label="Referencia" [value]="formData.reference ?? ''" (valueChange)="formData.reference = $event" />
            <app-input label="Notas" [value]="formData.notes ?? ''" (valueChange)="formData.notes = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="text" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="filled" (click)="createPayment()">Crear</app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PaymentsComponent {
  payments = signal<Payment[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  clients = signal<Client[]>([]);
  projects = signal<Project[]>([]);
  showModal = signal(false);
  formData: Partial<Payment> = this.emptyForm();

  constructor(
    private paymentService: PaymentService,
    private clientService: ClientService,
    private projectService: ProjectService,
  ) {
    this.loadPayments();
    this.loadMethods();
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients.set(data);
      },
    });
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects.set(data);
      },
    });
  }

  loadPayments(): void {
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments.set(data);
      },
    });
  }

  loadMethods(): void {
    this.paymentService.getMethods().subscribe({
      next: (data) => {
        this.paymentMethods.set(data);
      },
    });
  }

  getTotalAmount(): number {
    return this.payments().reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  formatPaymentType(type: PaymentType): string {
    const map: Record<PaymentType, string> = {
      PHASE_1: 'Fase 1',
      PHASE_2: 'Fase 2',
      PHASE_3: 'Fase 3',
      EXTRA: 'Extra',
      INSURANCE: 'Seguro',
    };
    return map[type] || type;
  }

  openCreateModal(): void {
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.formData = this.emptyForm();
  }

  createPayment(): void {
    if (!this.formData.projectId || !this.formData.clientId || !this.formData.paymentMethodId || !this.formData.amount) return;

    this.paymentService.create(this.formData as Payment).subscribe({
      next: () => {
        this.loadPayments();
        this.closeModal();
      },
    });
  }

  onCreateClient(name: string): void {
    this.clientService.create({ name, email: '', active: true }).subscribe({
      next: (created) => {
        this.clients.update(prev => [...prev, created]);
        this.formData.clientId = created.id!;
      },
    });
  }

  onCreateProject(name: string): void {
    this.projectService.create({
      name,
      clientId: this.formData.clientId || 0,
      address: '',
      latitude: 0,
      longitude: 0,
      status: 'PLANNED',
      active: true,
    }).subscribe({
      next: (created) => {
        this.projects.update(prev => [...prev, created]);
        this.formData.projectId = created.id!;
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }

  private emptyForm(): Partial<Payment> {
    return {
      projectId: 0, clientId: 0, paymentMethodId: 0,
      amount: 0, paymentDate: '', type: 'PHASE_1',
      reference: '', notes: '',
    };
  }
}
