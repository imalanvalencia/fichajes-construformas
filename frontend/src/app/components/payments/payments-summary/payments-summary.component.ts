import { Component, input, computed } from '@angular/core';
import { Payment, PaymentMethod } from '../../../features/payments/types/payment.types';
import { MetricCardComponent } from '../../shared/metric-card/metric-card.component';

@Component({
  selector: 'app-payments-summary',
  standalone: true,
  imports: [MetricCardComponent],
  template: `
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <app-metric-card
        [value]="payments().length"
        label="Total Pagos"
        color="#1C1C1D"
      />
      <app-metric-card
        [value]="formatCurrency(totalAmount())"
        label="Monto Total"
        color="#22C55E"
      />
      <app-metric-card
        [value]="paymentMethods().length"
        label="Métodos de Pago"
        color="#3B82F6"
      />
    </div>
  `,
})
export class PaymentsSummaryComponent {
  payments = input<Payment[]>([]);
  paymentMethods = input<PaymentMethod[]>([]);

  totalAmount = computed(() => {
    return this.payments().reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
