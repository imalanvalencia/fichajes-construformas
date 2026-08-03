import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from './services/invoice.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Invoice, InvoiceItem, InvoiceStatus } from './types/invoice.types';
import { Client } from '../clients/types/client.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { SelectOrCreateComponent } from '../../shared/components/select-or-create/select-or-create.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent, MetricCardComponent, SelectOrCreateComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Facturas</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nueva Factura</app-button>
      </div>

      <!-- Summary -->
      @if (invoices.length > 0) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-metric-card
            [value]="invoices.length"
            label="Total Facturas"
            color="#1C1C1D"
          />
          <app-metric-card
            [value]="getCountByStatus('DRAFT')"
            label="Borradores"
            color="#ACB4B6"
          />
          <app-metric-card
            [value]="getCountByStatus('ISSUED')"
            label="Emitidas"
            color="#3B82F6"
          />
          <app-metric-card
            [value]="formatCurrency(getTotalInvoiced())"
            label="Total Facturado"
            color="#E22D2D"
          />
        </div>
      }

      <!-- Table -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Nº Factura</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cliente</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Total</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (invoice of invoices; track invoice.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-mono text-sm text-nero">{{ invoice.invoiceNumber }}</td>
                  <td class="py-3 px-4 text-steel">{{ invoice.projectName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ invoice.clientName || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="invoice.status" />
                  </td>
                  <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(invoice.total) }}</td>
                  <td class="py-3 px-4 text-right space-x-2">
                    @if (invoice.status === 'DRAFT') {
                      <app-button variant="primary" size="sm" (click)="issueInvoice(invoice.id!)">Emitir</app-button>
                      <app-button variant="secondary" size="sm" (click)="openEditModal(invoice)">Editar</app-button>
                    }
                    <app-button variant="danger" size="sm" (click)="deleteInvoice(invoice.id!)">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-8 text-center text-steel">No hay facturas registradas.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Create/Edit Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-bold text-nero">{{ editingInvoice ? 'Editar Factura' : 'Nueva Factura' }}</h2>

            <app-input label="Nº Factura *" [value]="formData.invoiceNumber ?? ''" (valueChange)="formData.invoiceNumber = $event" />

            <app-select-or-create
              label="Proyecto *"
              [items]="projects"
              [value]="formData.projectId ?? null"
              placeholder="Seleccionar proyecto..."
              [required]="true"
              (valueChange)="formData.projectId = $event"
              (create)="onCreateProject($event)"
            />

            <app-select-or-create
              label="Cliente *"
              [items]="clients"
              [value]="formData.clientId ?? null"
              placeholder="Seleccionar cliente..."
              [required]="true"
              (valueChange)="formData.clientId = $event"
              (create)="onCreateClient($event)"
            />

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Subtotal" type="number" [value]="formData.subtotal?.toString() ?? ''" (valueChange)="formData.subtotal = +$event" />
              <app-input label="Tipo IVA %" type="number" [value]="formData.taxRate?.toString() ?? ''" (valueChange)="formData.taxRate = +$event" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Fecha Emisión" type="date" [value]="formData.issuedDate ?? ''" (valueChange)="formData.issuedDate = $event" />
              <app-input label="Fecha Vencimiento" type="date" [value]="formData.dueDate ?? ''" (valueChange)="formData.dueDate = $event" />
            </div>

            <app-input label="Notas" [value]="formData.notes ?? ''" (valueChange)="formData.notes = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="saveInvoice()">
                {{ editingInvoice ? 'Actualizar' : 'Crear' }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  showModal = false;
  editingInvoice: Invoice | null = null;
  formData: Partial<Invoice> = this.emptyForm();

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.clientService.getAll().subscribe({
      next: (data) => (this.clients = data),
    });
    this.projectService.getAll().subscribe({
      next: (data) => (this.projects = data),
    });
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: (data) => (this.invoices = data),
    });
  }

  getCountByStatus(status: InvoiceStatus): number {
    return this.invoices.filter((i) => i.status === status).length;
  }

  getTotalInvoiced(): number {
    return this.invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  }

  issueInvoice(id: number): void {
    if (!confirm('¿Emitir esta factura?')) return;
    this.invoiceService.issue(id).subscribe({
      next: () => this.loadInvoices(),
    });
  }

  openCreateModal(): void {
    this.editingInvoice = null;
    this.formData = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(invoice: Invoice): void {
    this.editingInvoice = invoice;
    this.formData = { ...invoice };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingInvoice = null;
    this.formData = this.emptyForm();
  }

  saveInvoice(): void {
    if (!this.formData.invoiceNumber?.trim() || !this.formData.projectId || !this.formData.clientId) return;

    const payload: Invoice = {
      invoiceNumber: this.formData.invoiceNumber!,
      projectId: this.formData.projectId!,
      clientId: this.formData.client  Id!,
      status: this.formData.status || 'DRAFT',
      subtotal: this.formData.subtotal ?? 0,
      taxRate: this.formData.taxRate ?? 21,
      taxAmount: (this.formData.subtotal ?? 0) * ((this.formData.taxRate ?? 21) / 100),
      total: (this.formData.subtotal ?? 0) * (1 + (this.formData.taxRate ?? 21) / 100),
      issuedDate: this.formData.issuedDate,
      dueDate: this.formData.dueDate,
      notes: this.formData.notes,
      createdById: 1, // TODO: get from auth context
    };

    if (this.editingInvoice?.id) {
      this.invoiceService.update(this.editingInvoice.id, payload).subscribe({
        next: () => {
          this.loadInvoices();
          this.closeModal();
        },
      });
    } else {
      this.invoiceService.create(payload).subscribe({
        next: () => {
          this.loadInvoices();
          this.closeModal();
        },
      });
    }
  }

  deleteInvoice(id: number): void {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) return;
    this.invoiceService.delete(id).subscribe({
      next: () => this.loadInvoices(),
    });
  }

  onCreateClient(name: string): void {
    this.clientService.create({ name, email: '', active: true }).subscribe({
      next: (created) => {
        this.clients = [...this.clients, created];
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
        this.projects = [...this.projects, created];
        this.formData.projectId = created.id!;
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }

  private emptyForm(): Partial<Invoice> {
    return {
      invoiceNumber: '', projectId: 0, clientId: 0, status: 'DRAFT',
      subtotal: 0, taxRate: 21, taxAmount: 0, total: 0,
    };
  }
}
