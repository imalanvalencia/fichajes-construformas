import { Component, signal } from '@angular/core';
import { UserService } from './services/user.service';
import { User, UserRole } from './types/user.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { UsersTableComponent } from '@components/users/users-table/users-table.component';
import { UserFormModalComponent } from '@components/users/user-form-modal/user-form-modal.component';
import { UsersFiltersComponent } from '@components/users/users-filters/users-filters.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ButtonComponent,
    UsersTableComponent,
    UserFormModalComponent,
    UsersFiltersComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Usuarios</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Usuario</app-button>
      </div>

      <app-users-filters
        [filterRole]="filterRole"
        (onFilterChange)="onFilterChange($event)"
      />

      <app-users-table
        [users]="filteredUsers()"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteUser($event)"
      />

      <app-user-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingUser"
        (onClose)="closeModal()"
        (onSave)="saveUser()"
        (onFormChange)="onFormChange($event)"
      />
    </div>
  `,
})
export class UsersComponent {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  filterRole = '';
  showModal = signal(false);
  editingUser: User | null = null;
  formData: Partial<User> = this.emptyForm();

  constructor(private userService: UserService) {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.filteredUsers.set(data);
      },
    });
  }

  onFilterChange(role: string): void {
    this.filterRole = role;
    if (role) {
      this.userService.getByRole(role as UserRole).subscribe({
        next: (data) => this.filteredUsers.set(data),
      });
    } else {
      this.filteredUsers.set(this.users());
    }
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.formData = { ...user, password: undefined };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser = null;
    this.formData = this.emptyForm();
  }

  onFormChange(change: Partial<User>): void {
    this.formData = { ...this.formData, ...change };
  }

  saveUser(): void {
    if (!this.formData.name?.trim() || !this.formData.email?.trim()) return;
    if (!this.editingUser && !this.formData.password?.trim()) return;

    if (this.editingUser?.id) {
      this.userService.update(this.editingUser.id, this.formData as User).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
      });
    } else {
      this.userService.create({ ...this.formData, active: true } as User).subscribe({
        next: () => {
          this.loadUsers();
          this.closeModal();
        },
      });
    }
  }

  deleteUser(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.userService.delete(id).subscribe({
      next: () => this.loadUsers(),
    });
  }

  private emptyForm(): Partial<User> {
    return {
      name: '', email: '', phone: '', nie: '',
      password: '', role: 'OPERATOR', availability: 'AVAILABLE',
    };
  }
}
