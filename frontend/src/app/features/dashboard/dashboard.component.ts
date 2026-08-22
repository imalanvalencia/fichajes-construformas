import { Component, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { ClientService } from '../clients/services/client.service';
import { ProjectService } from '../projects/services/project.service';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MetricCardComponent, CardComponent],
  template: `
    <div class="space-y-6">
      <!-- Welcome -->
      <div>
        <h1 class="text-2xl font-bold text-nero">Bienvenido, {{ userName() }}</h1>
        <p class="text-steel text-sm mt-1">Resumen general del sistema de gestión.</p>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <app-metric-card [value]="totalProjects()" label="Proyectos Totales" color="#1C1C1D" />
        <app-metric-card [value]="activeBudgets()" label="Presupuestos Activos" color="#E22D2D" />
        <app-metric-card [value]="pendingInvoices()" label="Facturas Pendientes" color="#ACB4B6" />
        <app-metric-card [value]="totalClients()" label="Clientes Totales" color="#1C1C1D" />
      </div>

      <!-- Recent Activity -->
      <app-card>
        <h2 class="text-lg font-bold text-nero mb-4">Actividad Reciente</h2>
        <div class="space-y-3">
          @for (activity of recentActivities(); track activity.id) {
            <div class="flex items-center gap-3 py-2 border-b border-steel/10 last:border-0">
              <span class="text-lg">{{ activity.icon }}</span>
              <div class="flex-1">
                <p class="text-sm text-nero">{{ activity.description }}</p>
                <p class="text-xs text-steel font-mono">{{ activity.time }}</p>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-steel text-center py-4">No hay actividad reciente.</p>
          }
        </div>
      </app-card>
    </div>
  `
})
export class DashboardComponent {
  userName = signal('Usuario');
  totalProjects = signal(0);
  activeBudgets = signal(0);
  pendingInvoices = signal(0);
  totalClients = signal(0);

  recentActivities = signal<{ id: number; icon: string; description: string; time: string }[]>([]);

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private projectService: ProjectService,
  ) {
    const user = this.authService.getUser();
    this.userName.set(user?.name ?? 'Usuario');

    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.totalClients.set(clients.length);
      },
    });

    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.totalProjects.set(projects.length);
        this.activeBudgets.set(projects.filter(p => p.status === 'IN_PROGRESS').length);
      },
    });
  }
}
