import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupplierService } from './services/supplier.service';
import { Supplier } from './types/supplier.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { InputComponent } from '@shared-components/input/input.component';
import { CardComponent } from '@components/shared/card/card.component';
import { SuppliersTableComponent } from '@components/suppliers/suppliers-table/suppliers-table.component';
import { SupplierFormModalComponent } from '@components/suppliers/supplier-form-modal/supplier-form-modal.component';
import { NotificationService } from '@app/services/notification.service';

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
  private loadVersion = 0;

  private destroyRef = inject(DestroyRef);
  private supplierService = inject(SupplierService);
  private notifications = inject(NotificationService);

  constructor() {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    const requestVersion = ++this.loadVersion;
    this.supplierService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (requestVersion !== this.loadVersion) return;
        this.suppliers.set(data);
        this.filteredSuppliers.set(data);
      },
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    if (term.trim()) {
      this.supplierService.search(term).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
      this.supplierService.update(this.editingSupplier.id, this.formData as Supplier).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loadSuppliers();
          this.closeModal();
        },
      });
    } else {
      this.supplierService.create({ ...this.formData, active: true } as Supplier).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (supplier) => {
          this.loadVersion++;
          this.suppliers.update((suppliers) => [...suppliers, supplier]);
          if (this.matchesActiveFilter(supplier)) {
            this.filteredSuppliers.update((suppliers) => [...suppliers, supplier]);
          }
          this.closeModal();
          this.notifications.success('Proveedor creado correctamente.');
        },
        error: () => {
          this.notifications.error('No se pudo crear el proveedor. Inténtalo de nuevo.');
        },
      });
    }
  }

  deleteSupplier(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    this.supplierService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadSuppliers(),
    });
  }

  private emptyForm(): Partial<Supplier> {
    return {
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      bankAccount: '',
      notes: '',
    };
  }

  private matchesActiveFilter(supplier: Supplier): boolean {
    const filter = this.searchTerm.trim().toLowerCase();
    return !filter || supplier.name.toLowerCase().includes(filter);
  }
}
