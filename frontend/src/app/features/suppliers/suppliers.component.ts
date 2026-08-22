import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierService } from './services/supplier.service';
import { Supplier } from './types/supplier.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Proveedores</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nuevo Proveedor</app-button>
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
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Contacto</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Email</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Teléfono</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">CIF/NIF</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (supplier of filteredSuppliers(); track supplier.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-medium text-nero">{{ supplier.name }}</td>
                  <td class="py-3 px-4 text-steel">{{ supplier.contactName || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ supplier.email || '—' }}</td>
                  <td class="py-3 px-4 text-steel">{{ supplier.phone || '—' }}</td>
                  <td class="py-3 px-4 text-steel font-mono">{{ supplier.taxId || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="supplier.active ? 'ACTIVE' : 'INACTIVE'" />
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <app-button variant="secondary" size="sm" (click)="openEditModal(supplier)">Editar</app-button>
                    <app-button variant="danger" size="sm" (click)="deleteSupplier(supplier.id!)">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-steel">No hay proveedores registrados.</td>
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
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-bold text-nero">{{ editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>

            <app-input label="Nombre *" [value]="formData.name ?? ''" (valueChange)="formData.name = $event" />
            <app-input label="Contacto" [value]="formData.contactName ?? ''" (valueChange)="formData.contactName = $event" />
            <app-input label="Email" type="email" [value]="formData.email ?? ''" (valueChange)="formData.email = $event" />
            <app-input label="Teléfono" [value]="formData.phone ?? ''" (valueChange)="formData.phone = $event" />
            <app-input label="Dirección" [value]="formData.address ?? ''" (valueChange)="formData.address = $event" />
            <app-input label="Ciudad" [value]="formData.city ?? ''" (valueChange)="formData.city = $event" />
            <app-input label="Código Postal" [value]="formData.postalCode ?? ''" (valueChange)="formData.postalCode = $event" />
            <app-input label="CIF/NIF" [value]="formData.taxId ?? ''" (valueChange)="formData.taxId = $event" />
            <app-input label="Cuenta Bancaria" [value]="formData.bankAccount ?? ''" (valueChange)="formData.bankAccount = $event" />
            <app-input label="Notas" [value]="formData.notes ?? ''" (valueChange)="formData.notes = $event" />

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="saveSupplier()">
                {{ editingSupplier ? 'Actualizar' : 'Crear' }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SuppliersComponent {
  suppliers = signal<Supplier[]>([]);
  filteredSuppliers = signal<Supplier[]>([]);
  searchTerm = '';
  showModal = signal(false);
  editingSupplier: Supplier | null = null;
  formData: Partial<Supplier> = this.emptyForm();

  constructor(private supplierService: SupplierService) {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers.set(data);
        this.filteredSuppliers.set(data);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    if (term.trim()) {
      this.supplierService.search(term).subscribe({
        next: (data) => (this.filteredSuppliers.set(data)),
      });
    } else {
      this.filteredSuppliers.set(this.suppliers());
    }
  }

  openCreateModal(): void {
    this.editingSupplier = null;
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(supplier: Supplier): void {
    this.editingSupplier = supplier;
    this.formData = { ...supplier };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingSupplier = null;
    this.formData = this.emptyForm();
  }

  saveSupplier(): void {
    if (!this.formData.name?.trim()) return;

    if (this.editingSupplier?.id) {
      this.supplierService.update(this.editingSupplier.id, this.formData as Supplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
      });
    } else {
      this.supplierService.create({ ...this.formData, active: true } as Supplier).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
      });
    }
  }

  deleteSupplier(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    this.supplierService.delete(id).subscribe({
      next: () => this.loadSuppliers(),
    });
  }

  private emptyForm(): Partial<Supplier> {
    return {
      name: '', contactName: '', email: '', phone: '',
      address: '', city: '', postalCode: '', taxId: '',
      bankAccount: '', notes: '',
    };
  }
}
