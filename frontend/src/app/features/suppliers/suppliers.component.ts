import { Component, signal } from '@angular/core';
import { SupplierService } from './services/supplier.service';
import { Supplier } from './types/supplier.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@components/shared/card/card.component';
import { SuppliersTableComponent } from '@components/suppliers/suppliers-table/suppliers-table.component';
import { SupplierFormModalComponent } from '@components/suppliers/supplier-form-modal/supplier-form-modal.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    SuppliersTableComponent,
    SupplierFormModalComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Proveedores</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Proveedor</app-button>
      </div>

      <app-card>
        <app-input
          label="Buscar por nombre..."
          [value]="searchTerm"
          (valueChange)="onSearch($event)"
        />
      </app-card>

      <app-suppliers-table
        [suppliers]="filteredSuppliers()"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteSupplier($event)"
      />

      <app-supplier-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingSupplier"
        (onClose)="closeModal()"
        (onSave)="saveSupplier()"
        (formChange)="onFormChange($event)"
      />
    </div>
  `,
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
        next: (data) => this.filteredSuppliers.set(data),
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

  onFormChange(change: Partial<Supplier>): void {
    this.formData = { ...this.formData, ...change };
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
