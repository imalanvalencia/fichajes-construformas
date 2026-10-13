import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { UserService } from './services/user.service';
import { Role, User } from './types/user.types';
import { NotificationService } from '@app/services/notification.service';

const OPERATOR_ROLE: Role = { id: 2, name: 'OPERATOR', description: 'Field operator' };
const ADMIN_ROLE: Role = { id: 1, name: 'ADMIN', description: 'Administrator' };

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userService: {
    getAll: ReturnType<typeof vi.fn>;
    getRoles: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateAvailability: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingUser: User = {
    id: 1,
    name: 'Ana Uno',
    email: 'ana@example.com',
    roles: [OPERATOR_ROLE],
    availability: 'AVAILABLE',
    active: true,
  };

  beforeEach(async () => {
    userService = {
      getAll: vi.fn().mockReturnValue(of([existingUser])),
      getRoles: vi.fn().mockReturnValue(of([ADMIN_ROLE, OPERATOR_ROLE])),
      create: vi.fn(),
      update: vi.fn(),
      updateAvailability: vi.fn().mockReturnValue(of('ON_SITE')),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders one badge per role taken from the roles set, not the removed single role', () => {
    component.filteredUsers.set([{ ...existingUser, roles: [ADMIN_ROLE, OPERATOR_ROLE] }]);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('ADMIN');
    expect(text).toContain('OPERATOR');
  });

  it('sends the many-to-many roles payload on create (S6)', () => {
    userService.create.mockReturnValue(of({ ...existingUser, id: 2 }));
    component.openCreateModal();
    component.onFormChange({
      name: 'Ana Dos',
      email: 'ana2@example.com',
      password: 'secreta',
      roles: [OPERATOR_ROLE],
      availability: 'AVAILABLE',
    });

    component.saveUser();

    expect(userService.create).toHaveBeenCalledWith(
      expect.objectContaining({ roles: [OPERATOR_ROLE] }),
    );
  });

  it('persists availability through the dedicated endpoint, not the update body (S5)', () => {
    userService.update.mockReturnValue(of({ ...existingUser, availability: 'ON_SITE' }));
    component.openEditModal(existingUser);
    component.onFormChange({ availability: 'ON_SITE' });

    component.saveUser();

    expect(userService.updateAvailability).toHaveBeenCalledWith(1, 'ON_SITE');
    expect(userService.update).toHaveBeenCalledWith(
      1,
      expect.not.objectContaining({ availability: 'ON_SITE' }),
    );
  });

  it('does not call the availability endpoint when availability is unchanged (S5)', () => {
    userService.update.mockReturnValue(of(existingUser));
    component.openEditModal(existingUser);
    component.onFormChange({ name: 'Ana Editada' });

    component.saveUser();

    expect(userService.updateAvailability).not.toHaveBeenCalled();
  });

  it('filters by role client-side over the roles set (S4)', () => {
    const admin = { ...existingUser, id: 3, name: 'Beto', roles: [ADMIN_ROLE] };
    userService.getAll.mockReturnValue(of([existingUser, admin]));
    component.loadUsers();

    component.onFilterChange('ADMIN');

    expect(component.filteredUsers()).toEqual([admin]);
  });

  it('restores the full list when the role filter is cleared (S4)', () => {
    const admin = { ...existingUser, id: 3, name: 'Beto', roles: [ADMIN_ROLE] };
    userService.getAll.mockReturnValue(of([existingUser, admin]));
    component.loadUsers();

    component.onFilterChange('ADMIN');
    component.onFilterChange('');

    expect(component.filteredUsers()).toEqual([existingUser, admin]);
  });

  it('appends the confirmed user once to canonical and unfiltered visible state', () => {
    const savedUser = {
      ...existingUser,
      id: 2,
      roles: [ADMIN_ROLE],
      availability: 'ON_SITE' as const,
    };
    userService.create.mockReturnValue(of(savedUser));
    component.openCreateModal();
    component.onFormChange({ ...savedUser, password: 'secreta' });

    component.saveUser();

    expect(component.users()).toEqual([existingUser, savedUser]);
    expect(component.filteredUsers()).toEqual([existingUser, savedUser]);
    expect(component.showModal()).toBe(false);
    expect(notifications.success).toHaveBeenCalledWith('Usuario creado correctamente.');
    expect(userService.getAll).toHaveBeenCalledTimes(1);
  });

  it('respects the active role filter when appending a confirmed user', () => {
    const admin = { ...existingUser, id: 2, roles: [ADMIN_ROLE] };
    userService.create.mockReturnValue(of(admin));
    component.onFilterChange('OPERATOR');
    component.openCreateModal();
    component.onFormChange({ ...admin, password: 'secreta' });

    component.saveUser();

    expect(component.users()).toEqual([existingUser, admin]);
    expect(component.filteredUsers()).toEqual([existingUser]);
  });

  it('preserves the list and form on create error and notifies the user', () => {
    const form = { ...existingUser, name: 'Ana Dos', password: 'secreta' };
    userService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.saveUser();

    expect(component.users()).toEqual([existingUser]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject(form);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el usuario. Inténtalo de nuevo.',
    );
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<User[]>();
    const savedUser = { ...existingUser, id: 2, password: 'secreta' };
    userService.getAll.mockReturnValue(pendingLoad);
    userService.create.mockReturnValue(of(savedUser));
    fixture.destroy();
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = savedUser;

    component.saveUser();
    pendingLoad.next([existingUser]);

    expect(component.users()).toEqual([savedUser]);
    expect(component.filteredUsers()).toEqual([savedUser]);
  });

  it('asks for confirmation before deleting a user', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteUser(1);

    expect(userService.delete).toHaveBeenCalledWith(1);
    confirmSpy.mockRestore();
  });
});
