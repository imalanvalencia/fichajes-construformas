import { Component, input } from '@angular/core';
import { ProjectFinancialSummary } from '../../../features/projects/types/project.types';
import { MetricCardComponent } from '../../shared/metric-card/metric-card.component';

@Component({
  selector: 'app-projects-summary',
  standalone: true,
  imports: [MetricCardComponent],
  template: `
    @if (summary()) {
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <app-metric-card
          [value]="formatCurrency(summary()!.totalBudgeted)"
          label="Presupuestado"
          color="#1C1C1D"
        />
        <app-metric-card
          [value]="formatCurrency(summary()!.totalInvoiced)"
          label="Facturado"
          color="#E22D2D"
        />
        <app-metric-card
          [value]="formatCurrency(summary()!.totalCollected)"
          label="Cobrado"
          color="#22C55E"
        />
        <app-metric-card
          [value]="formatCurrency(summary()!.pendingCollection)"
          label="Pendiente"
          color="#ACB4B6"
        />
      </div>
    }
  `,
})
export class ProjectsSummaryComponent {
  summary = input<ProjectFinancialSummary | null>(null);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
