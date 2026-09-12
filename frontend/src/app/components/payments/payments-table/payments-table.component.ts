import { Component, input } from '@angular/core';
import { Payment, PaymentMethod, PaymentType } from '../../../features/payments/types/payment.types';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-payments-table',
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Fecha</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cliente</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Método</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Tipo</th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Monto</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Referencia</th>
            </tr>
          </thead>
          <tbody>
            @for (payment of payments(); track payment.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 text-steel">{{ payment.paymentDate }}</td>
                <td class="py-3 px-4 font-medium text-nero">{{ payment.projectName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ payment.clientName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ payment.paymentMethodName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ formatPaymentType(payment.type) }}</td>
                <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(payment.amount) }}</td>
                <td class="py-3 px-4 text-steel font-mono text-xs">{{ payment.reference || '—' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-8 text-center text-steel">No hay pagos registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class PaymentsTableComponent {
  payments = input<Payment[]>([]);

  formatPaymentType(type: PaymentType): string {
    const map: Record<PaymentType, string> = {
      PHASE_1: 'Fase 1',
      PHASE_2: 'Fase 2',
      PHASE_3: 'Fase 3',
      EXTRA: 'Extra',
      INSURANCE: 'Seguro',
    };
    return map[type] || type;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
