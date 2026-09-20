import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ClientsComponent } from './clients.component';
import { ClientService } from './services/client.service';
import { Client } from './types/client.types';
import { NotificationService } from '@app/services/notification.service';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientService: {
    getAll: ReturnType<typeof vi.fn>;
    search: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingClient: Client = { id: 1, name: 'Cliente existente', active: true };

  beforeEach(async () => {
    clientService = {
      getAll: vi.fn().mockReturnValue(of([existingClient])),
      search: vi.fn().mockReturnValue(of([])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        { provide: ClientService, useValue: clientService },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the saved client immediately, closes the form, and notifies success', () => {
    const savedClient: Client = { id: 2, name: 'Cliente nuevo', active: true };
    clientService.create.mockReturnValue(of(savedClient));
    component.openCreateModal();
    component.onFormChange({ name: savedClient.name });

    component.saveClient();

    expect(component.clients()).toEqual([existingClient, savedClient]);
    expect(component.filteredClients()).toEqual([existingClient, savedClient]);
    expect(component.showModal()).toBe(false);
    expect(component.formData).toEqual({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
    });
    expect(notifications.success).toHaveBeenCalledWith('Cliente creado correctamente.');
    expect(clientService.getAll).toHaveBeenCalledTimes(1);
  });

  it('adds a saved client to the visible list only when it matches the active filter', () => {
    const matchingClient: Client = { id: 2, name: 'Ana Garcia', active: true };
    const nonMatchingClient: Client = { id: 3, name: 'Luis Perez', active: true };
    component.searchTerm = 'ana';
    component.filteredClients.set([]);
    clientService.create
      .mockReturnValueOnce(of(matchingClient))
      .mockReturnValueOnce(of(nonMatchingClient));

    component.formData = { name: matchingClient.name };
    component.saveClient();
    component.formData = { name: nonMatchingClient.name };
    component.saveClient();

    expect(component.clients()).toEqual([existingClient, matchingClient, nonMatchingClient]);
    expect(component.filteredClients()).toEqual([matchingClient]);
  });

  it('preserves the lists and form on create error and notifies the user', () => {
    const form = { name: 'Cliente pendiente' };
    clientService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.saveClient();

    expect(component.clients()).toEqual([existingClient]);
    expect(component.filteredClients()).toEqual([existingClient]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject(form);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el cliente. Inténtalo de nuevo.',
    );
    expect(clientService.delete).not.toHaveBeenCalled();
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Client[]>();
    const savedClient: Client = { id: 2, name: 'Cliente nuevo', active: true };
    clientService.getAll.mockReturnValue(pendingLoad);
    clientService.create.mockReturnValue(of(savedClient));
    fixture.destroy();
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = { name: savedClient.name };

    component.saveClient();
    pendingLoad.next([existingClient]);

    expect(component.clients()).toEqual([savedClient]);
    expect(component.filteredClients()).toEqual([savedClient]);
  });
});
