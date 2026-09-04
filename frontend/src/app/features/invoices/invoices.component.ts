import { Component, signal } from '@angular/core';
import { InvoiceService } from './services/invoice.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { Invoice } from './types/invoice.types';
import { Client } from '../clients/types/client.types';
import { Project } from '../projects/types/project.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InvoicesTableComponent } from '@components/invoices/invoices-table/invoices-table.component';
import { InvoiceFormModalComponent } from '@components/invoices/invoice-form-modal/invoice-form-modal.component';
import { InvoicesSummaryComponent } from '@components/invoices/invoices-summary/invoices-summary.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    ButtonComponent,
    InvoicesTableComponent,
    InvoiceFormModalComponent,
    InvoicesSummaryComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Facturas</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nueva Factura</app-button>
      </div>

      @if (invoices().length > 0) {
        <app-invoices-summary [invoices]="invoices()" />
      }

      <app-invoices-table
        [invoices]="invoices()"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteInvoice($event)"
        (onIssue)="issueInvoice($event)"
      />

      <app-invoice-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingInvoice"
        [clients]="clients()"
        [projects]="projects()"
        (onClose)="closeModal()"
        (onSave)="saveInvoice()"
        (onFormChange)="onFormChange($event)"
        (onCreateClient)="onCreateClient($event)"
        (onCreateProject)="onCreateProject($event)"
      />
    </div>
  `,
})
export class InvoicesComponent {
  invoices = signal<Invoice[]>([]);
  clients = signal<Client[]>([]);
  projects = signal<Project[]>([]);
  showModal = signal(false);
  editingInvoice: Invoice | null = null;
  formData: Partial<Invoice> = this.emptyForm();

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private projectService: ProjectService,
  ) {
    this.loadInvoices();
    this.clientService.getAll().subscribe({
      next: (data) => this.clients.set(data),
    });
    this.projectService.getAll().subscribe({
      next: (data) => this.projects.set(data),
    });
  }

  loadInvoices(): void {
    this.invoiceService.getAll().subscribe({
      next: (data) => this.invoices.set(data),
    });
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
    this.showModal.set(true);
  }

  openEditModal(invoice: Invoice): void {
    this.editingInvoice = invoice;
    this.formData = { ...invoice };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingInvoice = null;
    this.formData = this.emptyForm();
  }

  onFormChange(change: Partial<Invoice>): void {
    this.formData = { ...this.formData, ...change };
  }

  saveInvoice(): void {
    if (!this.formData.invoiceNumber?.trim() || !this.formData.projectId || !this.formData.clientId) return;

    const payload: Invoice = {
      invoiceNumber: this.formData.invoiceNumber!,
      projectId: this.formData.projectId!,
      clientId: this.formData.clientId!,
      status: this.formData.status || 'DRAFT',
      subtotal: this.formData.subtotal ?? 0,
      taxRate: this.formData.taxRate ?? 21,
      taxAmount: (this.formData.subtotal ?? 0) * ((this.formData.taxRate ?? 21) / 100),
      total: (this.formData.subtotal ?? 0) * (1 + (this.formData.taxRate ?? 21) / 100),
      issuedDate: this.formData.issuedDate,
      dueDate: this.formData.dueDate,
      notes: this.formData.notes,
      createdById: 1,
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

  private emptyForm(): Partial<Invoice> {
    return {
      invoiceNumber: '', projectId: 0, clientId: 0, status: 'DRAFT',
      subtotal: 0, taxRate: 21, taxAmount: 0, total: 0,
    };
  }
}
