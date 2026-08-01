import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from './services/user.service';
import { User, UserRole, UserAvailability } from './types/user.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Usuarios</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nuevo Usuario</app-button>
      </div>

      <!-- Filters -->
      <app-card>
        <div class="flex gap-4">
          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Filtrar por Rol</label>
            <select
              [(ngModel)]="filterRole"
              (ngModelChange)="onFilterChange()"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="OPERATOR">Operador</option>
              <option value="MANAGER">Gerente</option>
            </select>
          </div>
        </div>
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
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">NIE</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Rol</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Disponibilidad</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of filteredUsers; track user.id) {
                <tr class="border-b border-steel/10 hover:bg-cement/50">
                  <td class="py-3 px-4 font-medium text-nero">{{ user.name }}</td>
                  <td class="py-3 px-4 text-steel">{{ user.email }}</td>
                  <td class="py-3 px-4 text-steel">{{ user.phone || '—' }}</td>
                  <td class="py-3 px-4 text-steel font-mono">{{ user.nie || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="user.role" />
                  </td>
                  <td class="py-3 px-4 text-steel">{{ formatAvailability(user.availability) }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="user.active ? 'ACTIVE' : 'INACTIVE'" />
                  </td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <app-button variant="secondary" size="sm" (click)="openEditModal(user)">Editar</app-button>
                    <app-button variant="danger" size="sm" (click)="deleteUser(user.id!)">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="py-8 text-center text-steel">No hay usuarios registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </app-card>

      <!-- Modal -->
      @if (showModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
          <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-bold text-nero">{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>

            <app-input label="Nombre *" [value]="formData.name ?? ''" (valueChange)="formData.name = $event" />
            <app-input label="Email *" type="email" [value]="formData.email ?? ''" (valueChange)="formData.email = $event" />
            <app-input label="Teléfono" [value]="formData.phone ?? ''" (valueChange)="formData.phone = $event" />
            <app-input label="NIE" [value]="formData.nie ?? ''" (valueChange)="formData.nie = $event" />

            @if (!editingUser) {
              <app-input label="Contraseña *" type="password" [value]="formData.password ?? ''" (valueChange)="formData.password = $event" />
            }

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Rol *</label>
              <select
                [(ngModel)]="formData.role"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                <option value="ADMIN">Administrador</option>
                <option value="OPERATOR">Operador</option>
                <option value="MANAGER">Gerente</option>
              </select>
            </div>

            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Disponibilidad</label>
              <select
                [(ngModel)]="formData.availability"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                <option value="AVAILABLE">Disponible</option>
                <option value="ON_LEAVE">En Permiso</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="saveUser()">
                {{ editingUser ? 'Actualizar' : 'Crear' }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  filterRole = '';
  showModal = false;
  editingUser: User | null = null;
  formData: Partial<User> = this.emptyForm();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
      },
    });
  }

  onFilterChange(): void {
    if (this.filterRole) {
      this.userService.getByRole(this.filterRole as UserRole).subscribe({
        next: (data) => (this.filteredUsers = data),
      });
    } else {
      this.filteredUsers = this.users;
    }
  }

  formatAvailability(availability: UserAvailability): string {
    const map: Record<UserAvailability, string> = {
      AVAILABLE: 'Disponible',
      ON_LEAVE: 'En Permiso',
      INACTIVE: 'Inactivo',
    };
    return map[availability] || availability;
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.formData = this.emptyForm();
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.formData = { ...user, password: undefined };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
    this.formData = this.emptyForm();
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
