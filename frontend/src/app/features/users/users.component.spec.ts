import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { UserService } from './services/user.service';
import { User } from './types/user.types';
import { NotificationService } from '@app/services/notification.service';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userService: {
    getAll: ReturnType<typeof vi.fn>;
    getByRole: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingUser: User = {
    id: 1,
    name: 'Ana Uno',
    email: 'ana@example.com',
    role: 'OPERATOR',
    availability: 'AVAILABLE',
    active: true,
  };

  beforeEach(async () => {
    userService = {
      getAll: vi.fn().mockReturnValue(of([existingUser])),
      getByRole: vi.fn().mockReturnValue(of([existingUser])),
      create: vi.fn(),
      update: vi.fn(),
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

  it('appends the confirmed user once to canonical and unfiltered visible state', () => {
    const savedUser = {
      ...existingUser,
      id: 2,
      role: 'MANAGER' as const,
      availability: 'ON_LEAVE' as const,
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
    const manager = { ...existingUser, id: 2, role: 'MANAGER' as const };
    userService.create.mockReturnValue(of(manager));
    component.onFilterChange('OPERATOR');
    component.openCreateModal();
    component.onFormChange({ ...manager, password: 'secreta' });

    component.saveUser();

    expect(component.users()).toEqual([existingUser, manager]);
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

  it('keeps role and availability on the existing update flow', () => {
    const updatedUser = {
      ...existingUser,
      role: 'MANAGER' as const,
      availability: 'ON_LEAVE' as const,
    };
    userService.update.mockReturnValue(of(updatedUser));
    component.openEditModal(updatedUser);

    component.saveUser();

    expect(userService.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ role: 'MANAGER', availability: 'ON_LEAVE' }),
    );
    expect(userService.create).not.toHaveBeenCalled();
  });
});
