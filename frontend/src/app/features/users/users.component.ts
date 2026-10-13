import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { UserService } from './services/user.service';
import { Role, User } from './types/user.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { UsersTableComponent } from '@components/users/users-table/users-table.component';
import { UserFormModalComponent } from '@components/users/user-form-modal/user-form-modal.component';
import { UsersFiltersComponent } from '@components/users/users-filters/users-filters.component';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ButtonComponent, UsersTableComponent, UserFormModalComponent, UsersFiltersComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Usuarios</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Usuario</app-button>
      </div>

      <app-users-filters [filterRole]="filterRole" (onFilterChange)="onFilterChange($event)" />

      <app-users-table
        [users]="filteredUsers()"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteUser($event)"
      />

      <app-user-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingUser"
        [roleCatalog]="roleCatalog()"
        [rolesError]="rolesError()"
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
  roleCatalog = signal<Role[]>([]);
  filterRole = '';
  showModal = signal(false);
  editingUser: User | null = null;
  formData: Partial<User> = this.emptyForm();
  rolesError = signal('');
  private loadVersion = 0;

  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private notifications = inject(NotificationService);

  constructor() {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles(): void {
    this.userService
      .getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (roles) => this.roleCatalog.set(roles) });
  }

  loadUsers(): void {
    const requestVersion = ++this.loadVersion;
    this.userService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        if (requestVersion !== this.loadVersion) return;
        this.users.set(data);
        this.filteredUsers.set(this.matchesActiveFilter(data));
      },
    });
  }

  /** Client-side: `roles` is a set, so a server-side filter no longer applies. */
  onFilterChange(role: string): void {
    this.filterRole = role;
    this.filteredUsers.set(this.matchesActiveFilter(this.users()));
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.formData = this.emptyForm();
    this.rolesError.set('');
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.formData = { ...user, password: undefined };
    this.rolesError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser = null;
    this.formData = this.emptyForm();
    this.rolesError.set('');
  }

  onFormChange(change: Partial<User>): void {
    this.formData = { ...this.formData, ...change };
    if (change.roles?.length) this.rolesError.set('');
  }

  saveUser(): void {
    if (!this.formData.name?.trim() || !this.formData.email?.trim()) return;
    if (!this.editingUser && !this.formData.password?.trim()) return;

    const roles = this.formData.roles ?? [];
    if (roles.length === 0) {
      this.rolesError.set('Seleccioná al menos un rol.');
      return;
    }

    if (this.editingUser?.id) {
      this.updateExisting(this.editingUser.id, roles);
    } else {
      this.createOne(roles);
    }
  }

  private updateExisting(id: number, roles: Role[]): void {
    const availability = this.formData.availability;
    const availabilityChanged = !!availability && availability !== this.editingUser?.availability;

    // Availability has its own endpoint; sending it in the PUT body is ignored server-side.
    const { availability: _ignored, ...rest } = this.formData;
    const payload = { ...rest, roles } as User;

    const request$ = availabilityChanged
      ? this.userService
          .updateAvailability(id, availability)
          .pipe(switchMap(() => this.userService.update(id, payload)))
      : this.userService.update(id, payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
      },
      error: () => {
        this.notifications.error('No se pudo actualizar el usuario. Inténtalo de nuevo.');
      },
    });
  }

  private createOne(roles: Role[]): void {
    this.userService.create({ ...this.formData, roles, active: true } as User).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        this.loadVersion++;
        this.users.update((users) => [...users, user]);
        if (this.matchesActiveFilter([user]).length > 0) {
          this.filteredUsers.update((users) => [...users, user]);
        }
        this.closeModal();
        this.notifications.success('Usuario creado correctamente.');
      },
      error: () => {
        this.notifications.error('No se pudo crear el usuario. Inténtalo de nuevo.');
      },
    });
  }

  deleteUser(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    this.userService.delete(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadUsers(),
    });
  }

  private matchesActiveFilter(users: User[]): User[] {
    if (!this.filterRole) return users;
    return users.filter((user) => (user.roles ?? []).some((role) => role.name === this.filterRole));
  }

  private emptyForm(): Partial<User> {
    return {
      name: '',
      email: '',
      phone: '',
      nie: '',
      password: '',
      roles: [],
      availability: 'AVAILABLE',
      active: true,
    };
  }
}
