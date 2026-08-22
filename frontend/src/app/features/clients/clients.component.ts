import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientService } from './services/client.service';
import { Client } from './types/client.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Clientes</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nuevo Cliente</app-button>
      </div>

      <!-- Search -->
      <app-card>
        <app-input
          label="Buscar por nombre..."
          [value]="searchTerm"
          (valueChange)="onSearch($event)"
        />
      </app-card>

      <!-- Table -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Nombre</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Email</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Teléfono</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (client of filteredClients(); track client.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-medium text-nero">{{ client.name }}</td>
                  <td class="py-3 px-4 text-steel">{{ client.email || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ client.phone || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="client.active ? 'ACTIVE' : 'INACTIVE'" />
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <app-button variant="secondary" size="sm" (click)="openEditModal(client)">Editar</app-button>
                    <app-button variant="danger" size="sm" (click)="deleteClient(client.id!)">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-8 text-center text-steel">No hay clientes registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4">
            <h2 class="text-lg font-bold text-nero">{{ editingClient ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>

            <app-input label="Nombre *" [value]="formData.name ?? ''" (valueChange)="formData.name = $event" />
            <app-input label="Email" type="email" [value]="formData.email ?? ''" (valueChange)="formData.email = $event" />
            <app-input label="Teléfono" [value]="formData.phone ?? ''" (valueChange)="formData.phone = $event" />
            <app-input label="Dirección" [value]="formData.address ?? ''" (valueChange)="formData.address = $event" />
            <app-input label="Ciudad" [value]="formData.city ?? ''" (valueChange)="formData.city = $event" />
            <app-input label="Código Postal" [value]="formData.postalCode ?? ''" (valueChange)="formData.postalCode = $event" />
            <app-input label="Notas" [value]="formData.notes ?? ''" (valueChange)="formData.notes = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="saveClient()">
                {{ editingClient ? 'Actualizar' : 'Crear' }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
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
        next: (data) => {
          this.filteredClients.set(data);
        },
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
