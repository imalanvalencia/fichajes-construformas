import { Component, input, computed } from '@angular/core';
import { Budget, BudgetStatus } from '../../../features/budgets/types/budget.types';
import { MetricCardComponent } from '../../shared/metric-card/metric-card.component';

@Component({
  selector: 'app-budget-summary',
  standalone: true,
  imports: [MetricCardComponent],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <app-metric-card [value]="budgets().length" label="Total Presupuestos" color="#1C1C1D" />
      <app-metric-card [value]="countByStatus('DRAFT')" label="Borradores" color="#ACB4B6" />
      <app-metric-card
        [value]="countByStatus('APPROVED')"
        label="Aprobados"
        color="#22C55E"
      />
      <app-metric-card
        [value]="formatCurrency(totalAmount())"
        label="Monto Total"
        color="#E22D2D"
      />
    </div>
  `,
})
export class BudgetSummaryComponent {
  budgets = input<Budget[]>([]);

  countByStatus(status: BudgetStatus): number {
    return this.budgets().filter(b => b.status === status).length;
  }

  totalAmount = computed(() => {
    return this.budgets()
      .filter(b => b.status !== 'REJECTED')
      .reduce((sum, b) => sum + (b.finalAmount || 0), 0);
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
