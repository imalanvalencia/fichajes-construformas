import { Component, input, output, computed } from '@angular/core';
import { Invoice, InvoiceStatus } from '../../../features/invoices/types/invoice.types';
import { MetricCardComponent } from '../../shared/metric-card/metric-card.component';

@Component({
  selector: 'app-invoices-summary',
  standalone: true,
  imports: [MetricCardComponent],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <app-metric-card
        [value]="invoices().length"
        label="Total Facturas"
        color="#1C1C1D"
      />
      <app-metric-card
        [value]="countByStatus('DRAFT')"
        label="Borradores"
        color="#ACB4B6"
      />
      <app-metric-card
        [value]="countByStatus('ISSUED')"
        label="Emitidas"
        color="#3B82F6"
      />
      <app-metric-card
        [value]="formatCurrency(totalInvoiced())"
        label="Total Facturado"
        color="#E22D2D"
      />
    </div>
  `,
})
export class InvoicesSummaryComponent {
  invoices = input<Invoice[]>([]);

  countByStatus(status: InvoiceStatus): number {
    return this.invoices().filter(i => i.status === status).length;
  }

  totalInvoiced = computed(() => {
    return this.invoices().reduce((sum, i) => sum + (i.total || 0), 0);
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
