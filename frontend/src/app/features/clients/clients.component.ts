import { Component, signal } from '@angular/core';
import { ClientService } from './services/client.service';
import { Client } from './types/client.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@components/shared/card/card.component';
import { ClientsTableComponent } from '@components/clients/clients-table/clients-table.component';
import { ClientFormModalComponent } from '@components/clients/client-form-modal/client-form-modal.component';
import { NotificationService } from '@app/services/notification.service';

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
  private loadVersion = 0;

  constructor(
    private clientService: ClientService,
    private notifications: NotificationService,
  ) {
    this.loadClients();
  }

  loadClients(): void {
    const requestVersion = ++this.loadVersion;
    this.clientService.getAll().subscribe({
      next: (data) => {
        if (requestVersion !== this.loadVersion) return;
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
        next: (client) => {
          this.loadVersion++;
          this.clients.update((clients) => [...clients, client]);
          if (this.matchesActiveFilter(client)) {
            this.filteredClients.update((clients) => [...clients, client]);
          }
          this.closeModal();
          this.notifications.success('Cliente creado correctamente.');
        },
        error: () => {
          this.notifications.error('No se pudo crear el cliente. Inténtalo de nuevo.');
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

  private matchesActiveFilter(client: Client): boolean {
    const filter = this.searchTerm.trim().toLowerCase();
    return !filter || client.name.toLowerCase().includes(filter);
  }
}
