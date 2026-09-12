import { Component, signal } from '@angular/core';
import { ProjectService } from './services/project.service';
import { ClientService } from '../clients/services/client.service';
import { Project, ProjectFinancialSummary } from './types/project.types';
import { Client } from '../clients/types/client.types';
import { ButtonComponent } from '@shared-components/button/button.component';
import { ProjectsTableComponent } from '@components/projects/projects-table/projects-table.component';
import { ProjectFormModalComponent } from '@components/projects/project-form-modal/project-form-modal.component';
import { ProjectsSummaryComponent } from '@components/projects/projects-summary/projects-summary.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    ButtonComponent,
    ProjectsTableComponent,
    ProjectFormModalComponent,
    ProjectsSummaryComponent,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Proyectos</h1>
        <app-button variant="filled" (click)="openCreateModal()">+ Nuevo Proyecto</app-button>
      </div>

      <app-projects-summary [summary]="financialSummary" />

      <app-projects-table
        [projects]="projects()"
        (onSelect)="selectProject($event)"
        (onEdit)="openEditModal($event)"
        (onDelete)="deleteProject($event)"
      />

      <app-project-form-modal
        [show]="showModal()"
        [form]="formData"
        [isEditing]="!!editingProject"
        [clients]="clients()"
        (onClose)="closeModal()"
        (onSave)="saveProject()"
        (onFormChange)="onFormChange($event)"
        (onCreateClient)="onCreateClient($event)"
      />
    </div>
  `,
})
export class ProjectsComponent {
  projects = signal<Project[]>([]);
  clients = signal<Client[]>([]);
  financialSummary: ProjectFinancialSummary | null = null;
  showModal = signal(false);
  editingProject: Project | null = null;
  formData: Partial<Project> = this.emptyForm();

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
  ) {
    this.loadProjects();
    this.clientService.getAll().subscribe({
      next: (data) => this.clients.set(data),
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => this.projects.set(data),
    });
  }

  selectProject(project: Project): void {
    if (project.id) {
      this.projectService.getFinancialSummary(project.id).subscribe({
        next: (summary) => (this.financialSummary = summary),
      });
    }
  }

  openCreateModal(): void {
    this.editingProject = null;
    this.formData = this.emptyForm();
    this.showModal.set(true);
  }

  openEditModal(project: Project): void {
    this.editingProject = project;
    this.formData = { ...project };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProject = null;
    this.formData = this.emptyForm();
  }

  onFormChange(change: Partial<Project>): void {
    this.formData = { ...this.formData, ...change };
  }

  saveProject(): void {
    if (!this.formData.name?.trim() || !this.formData.address?.trim() || !this.formData.clientId) return;

    const payload: Project = {
      clientId: this.formData.clientId!,
      name: this.formData.name!,
      description: this.formData.description,
      address: this.formData.address!,
      city: this.formData.city,
      latitude: this.formData.latitude ?? 0,
      longitude: this.formData.longitude ?? 0,
      allowedRadiusMeters: this.formData.allowedRadiusMeters ?? 50,
      startDate: this.formData.startDate,
      estimatedEndDate: this.formData.estimatedEndDate,
      status: this.formData.status as any || 'PLANNED',
      active: true,
    };

    if (this.editingProject?.id) {
      this.projectService.update(this.editingProject.id, payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeModal();
        },
      });
    } else {
      this.projectService.create(payload).subscribe({
        next: () => {
          this.loadProjects();
          this.closeModal();
        },
      });
    }
  }

  deleteProject(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    this.projectService.delete(id).subscribe({
      next: () => {
        this.loadProjects();
        this.financialSummary = null;
      },
    });
  }

  onCreateClient(name: string): void {
    this.clientService.create({ name, email: '', active: true }).subscribe({
      next: (created) => {
        this.clients.update(prev => [...prev, created]);
        this.formData.clientId = created.id!;
      },
    });
  }

  private emptyForm(): Partial<Project> {
    return {
      name: '', description: '', address: '', city: '',
      clientId: 0, latitude: 0, longitude: 0,
      status: 'PLANNED', active: true,
    };
  }
}
