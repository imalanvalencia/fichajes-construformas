import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectService } from './services/project.service';
import { ClientService } from '../clients/services/client.service';
import { Project, ProjectFinancialSummary, ProjectStatus } from './types/project.types';
import { Client } from '../clients/types/client.types';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { SelectOrCreateComponent } from '../../shared/components/select-or-create/select-or-create.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, CardComponent, BadgeComponent, MetricCardComponent, SelectOrCreateComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-nero">Proyectos</h1>
        <app-button variant="primary" (click)="openCreateModal()">+ Nuevo Proyecto</app-button>
      </div>

      <!-- Financial Summary -->
      @if (financialSummary) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <app-metric-card
            [value]="formatCurrency(financialSummary.totalBudgeted)"
            label="Presupuestado"
            color="#1C1C1D"
          />
          <app-metric-card
            [value]="formatCurrency(financialSummary.totalInvoiced)"
            label="Facturado"
            color="#E22D2D"
          />
          <app-metric-card
            [value]="formatCurrency(financialSummary.totalCollected)"
            label="Cobrado"
            color="#22C55E"
          />
          <app-metric-card
            [value]="formatCurrency(financialSummary.pendingCollection)"
            label="Pendiente"
            color="#ACB4B6"
          />
        </div>
      }

      <!-- Table -->
      <app-card>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-steel/30">
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Nombre</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cliente</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
                <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fecha Inicio</th>
                <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (project of projects; track project.id) {
                <tr
                  class="border-b border-steel/10 hover:bg-cement/50 cursor-pointer"
                  (click)="selectProject(project)"
                >
                  <td class="py-3 px-4 font-medium text-nero">{{ project.name }}</td>
                  <td class="py-3 px-4 text-steel">{{ project.clientName || '—' }}</td>
                  <td class="py-3 px-4">
                    <app-badge [status]="project.status" />
                  </td>
                  <td class="py-3 px-4 text-steel">{{ project.startDate || '—' }}</td>
                  <td class="py-3 px-4 text-right space-x-2">
                    <app-button variant="secondary" size="sm" (click)="openEditModal(project); $event.stopPropagation()">Editar</app-button>
                    <app-button variant="danger" size="sm" (click)="deleteProject(project.id!); $event.stopPropagation()">Eliminar</app-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-8 text-center text-steel">No hay proyectos registrados.</td>
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
            <h2 class="text-lg font-bold text-nero">{{ editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h2>

            <app-input label="Nombre *" [value]="formData.name ?? ''" (valueChange)="formData.name = $event" />
            <app-input label="Descripción" [value]="formData.description ?? ''" (valueChange)="formData.description = $event" />
            <app-input label="Dirección *" [value]="formData.address ?? ''" (valueChange)="formData.address = $event" />
            <app-input label="Ciudad" [value]="formData.city ?? ''" (valueChange)="formData.city = $event" />

            <!-- Client selector -->
            <app-select-or-create
              label="Cliente *"
              [items]="clients"
              [value]="formData.clientId ?? null"
              placeholder="Seleccionar cliente..."
              [required]="true"
              (valueChange)="formData.clientId = $event"
              (create)="onCreateClient($event)"
            />

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Latitud *" type="number" [value]="formData.latitude?.toString() ?? ''" (valueChange)="formData.latitude = +$event" />
              <app-input label="Longitud *" type="number" [value]="formData.longitude?.toString() ?? ''" (valueChange)="formData.longitude = +$event" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <app-input label="Fecha Inicio" type="date" [value]="formData.startDate ?? ''" (valueChange)="formData.startDate = $event" />
              <app-input label="Fecha Fin Estimada" type="date" [value]="formData.estimatedEndDate ?? ''" (valueChange)="formData.estimatedEndDate = $event" />
            </div>

            <!-- Status selector -->
            <div class="relative">
              <label class="block font-mono text-xs font-medium text-steel mb-1">Estado</label>
              <select
                [ngModel]="formData.status"
                (ngModelChange)="formData.status = $event"
                class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
              >
                <option value="PLANNED">Planificado</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <app-button variant="secondary" (click)="closeModal()">Cancelar</app-button>
              <app-button variant="primary" (click)="saveProject()">
                {{ editingProject ? 'Actualizar' : 'Crear' }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  clients: Client[] = [];
  financialSummary: ProjectFinancialSummary | null = null;
  showModal = false;
  editingProject: Project | null = null;
  formData: Partial<Project> = this.emptyForm();

  constructor(
    private projectService: ProjectService,
    private clientService: ClientService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.clientService.getAll().subscribe({
      next: (data) => (this.clients = data),
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (data) => (this.projects = data),
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
    this.showModal = true;
  }

  openEditModal(project: Project): void {
    this.editingProject = project;
    this.formData = { ...project };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingProject = null;
    this.formData = this.emptyForm();
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
      status: (this.formData.status as ProjectStatus) || 'PLANNED',
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
        this.clients = [...this.clients, created];
        this.formData.clientId = created.id!;
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }

  private emptyForm(): Partial<Project> {
    return {
      name: '', description: '', address: '', city: '',
      clientId: 0, latitude: 0, longitude: 0,
      status: 'PLANNED', active: true,
    };
  }
}
