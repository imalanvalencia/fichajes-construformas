import { Component, signal } from '@angular/core';
import { ClientService } from './services/client.service';
import { Client } from './types/client.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@components/shared/card/card.component';
import { ClientsTableComponent } from '@components/clients/clients-table/clients-table.component';
import { ClientFormModalComponent } from '@components/clients/client-form-modal/client-form-modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    ClientsTableComponent,
    ClientFormModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Clientes</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Cliente</app-button>
      </div>

      <app-card>
        <app-input
          label="Buscar por nombre..."
          [value]="searchTerm"
          (valueChange)="onSearch($event)"
        />
      </app-card>

      <app-clients-table
        [clients]="filteredClients()"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteClient($event)"
      />

      <app-client-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingClient"
        (onClose)="closeModal()"
        (onSave)="saveClient()"
        (formChange)="onFormChange($event)"
      />
    </div>
  `,
})
export class ClientsComponent {
  clients = signal<Client[]>([]);
  filteredClients = signal<Client[]>([]);
  searchTerm = '';
  showModal = signal(false);
  editingClient: Client | null = null;
  formData: Partial<Client> = this.emptyForm();

  constructor(private clientService: ClientService) {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.filteredClients.set(data);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    if (term.trim()) {
      this.clientService.search(term).subscribe({
        next: (data) => this.filteredClients.set(data),
      });
    } else {
      this.filteredClients.set(this.clients());
    }
  }

  openCreateModal(): void {
    this.editingClient = null;
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(client: Client): void {
    this.editingClient = client;
    this.formData = { ...client };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingClient = null;
    this.formData = this.emptyForm();
  }

  onFormChange(change: Partial<Client>): void {
    this.formData = { ...this.formData, ...change };
  }

  saveClient(): void {
    if (!this.formData.name?.trim()) return;

    if (this.editingClient?.id) {
      this.clientService.update(this.editingClient.id, this.formData as Client).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
      });
    } else {
      this.clientService.create({ ...this.formData, active: true } as Client).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
      });
    }
  }

  deleteClient(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    this.clientService.delete(id).subscribe({
      next: () => this.loadClients(),
    });
  }

  private emptyForm(): Partial<Client> {
    return { name: '', email: '', phone: '', address: '', city: '', postalCode: '', notes: '' };
  }
}
