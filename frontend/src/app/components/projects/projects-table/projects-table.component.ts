import { Component, input, output } from '@angular/core';
import { Project } from '../../../features/projects/types/project.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-projects-table',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
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
            @for (project of projects(); track project.id) {
              <tr
                class="border-b border-steel/10 hover:bg-cement/50 cursor-pointer"
                (click)="onSelect.emit(project)"
              >
                <td class="py-3 px-4 font-medium text-nero">{{ project.name }}</td>
                <td class="py-3 px-4 text-steel">{{ project.clientName || '—' }}</td>
                <td class="py-3 px-4">
                  <app-badge [status]="project.status" />
                </td>
                <td class="py-3 px-4 text-steel">{{ project.startDate || '—' }}</td>
                <td class="py-3 px-4 text-right space-x-2">
                  <app-button variant="text" size="sm" (click)="onEdit.emit(project); $event.stopPropagation()">Editar</app-button>
                  <app-button variant="text" size="sm" (click)="onDelete.emit(project.id!); $event.stopPropagation()">Eliminar</app-button>
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
  `,
})
export class ProjectsTableComponent {
  projects = input<Project[]>([]);

  onSelect = output<Project>();
  onEdit = output<Project>();
  onDelete = output<number>();
}
