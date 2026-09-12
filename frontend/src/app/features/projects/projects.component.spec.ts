import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, Subject, throwError } from 'rxjs';
import { ProjectsComponent } from './projects.component';
import { ProjectService } from './services/project.service';
import { ClientService } from '../clients/services/client.service';
import { Project, ProjectFinancialSummary } from './types/project.types';
import { NotificationService } from '@app/services/notification.service';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;
  let projectService: {
    getAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getFinancialSummary: ReturnType<typeof vi.fn>;
  };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const existingProject: Project = {
    id: 1,
    clientId: 1,
    name: 'Proyecto existente',
    address: 'Calle Uno',
    latitude: 0,
    longitude: 0,
    status: 'PLANNED',
    active: true,
  };

  beforeEach(async () => {
    projectService = {
      getAll: vi.fn().mockReturnValue(of([existingProject])),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getFinancialSummary: vi.fn(),
    };
    notifications = { success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: ProjectService, useValue: projectService },
        {
          provide: ClientService,
          useValue: { getAll: vi.fn().mockReturnValue(of([])), create: vi.fn() },
        },
        { provide: NotificationService, useValue: notifications },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('appends the saved project immediately, preserves the summary, closes the form, and notifies success', () => {
    const savedProject = { ...existingProject, id: 2, name: 'Proyecto nuevo' };
    const summary: ProjectFinancialSummary = {
      projectId: 1,
      projectName: existingProject.name,
      totalBudgeted: 0,
      totalInvoiced: 0,
      totalCollected: 0,
      pendingInvoicing: 0,
      pendingCollection: 0,
      invoicingPercentage: 0,
      collectionPercentage: 0,
    };
    projectService.create.mockReturnValue(of(savedProject));
    component.financialSummary = summary;
    component.openCreateModal();
    component.onFormChange({ name: savedProject.name, address: savedProject.address, clientId: 1 });

    component.saveProject();

    expect(component.projects()).toEqual([existingProject, savedProject]);
    expect(component.financialSummary).toBe(summary);
    expect(component.showModal()).toBe(false);
    expect(component.formData).toEqual({
      name: '',
      description: '',
      address: '',
      city: '',
      clientId: 0,
      latitude: 0,
      longitude: 0,
      status: 'PLANNED',
      active: true,
    });
    expect(notifications.success).toHaveBeenCalledWith('Proyecto creado correctamente.');
    expect(projectService.getAll).toHaveBeenCalledTimes(1);
  });

  it('preserves the list and form on create error and notifies the user', () => {
    const form = { name: 'Proyecto pendiente', address: 'Calle Dos', clientId: 1 };
    projectService.create.mockReturnValue(throwError(() => new Error('Network failure')));
    component.openCreateModal();
    component.onFormChange(form);

    component.saveProject();

    expect(component.projects()).toEqual([existingProject]);
    expect(component.showModal()).toBe(true);
    expect(component.formData).toMatchObject(form);
    expect(notifications.error).toHaveBeenCalledWith(
      'No se pudo crear el proyecto. Inténtalo de nuevo.',
    );
    expect(projectService.delete).not.toHaveBeenCalled();
  });

  it('does not let a stale list response overwrite a successful create', () => {
    const pendingLoad = new Subject<Project[]>();
    const savedProject = { ...existingProject, id: 2, name: 'Proyecto nuevo' };
    projectService.getAll.mockReturnValue(pendingLoad);
    projectService.create.mockReturnValue(of(savedProject));
    fixture.destroy();
    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.formData = { name: savedProject.name, address: savedProject.address, clientId: 1 };

    component.saveProject();
    pendingLoad.next([existingProject]);

    expect(component.projects()).toEqual([savedProject]);
  });
});
