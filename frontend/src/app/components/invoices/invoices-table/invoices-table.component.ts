import { Component, input, output } from '@angular/core';
import { Invoice } from '../../../features/invoices/types/invoice.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-invoices-table',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
    <app-card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Nº Factura</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Proyecto</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Cliente</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Total</th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of invoices(); track invoice.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 font-mono text-sm text-nero">{{ invoice.invoiceNumber }}</td>
                <td class="py-3 px-4 text-steel">{{ invoice.projectName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ invoice.clientName || '—' }}</td>
                <td class="py-3 px-4">
                  <app-badge [status]="invoice.status" />
                </td>
                <td class="py-3 px-4 text-right font-medium text-nero">{{ formatCurrency(invoice.total) }}</td>
                <td class="py-3 px-4 text-right space-x-2">
                  @if (invoice.status === 'DRAFT') {
                    <app-button variant="filled" size="sm" (click)="onIssue.emit(invoice.id!)">Emitir</app-button>
                    <app-button variant="text" size="sm" (click)="onEdit.emit(invoice)">Editar</app-button>
                  }
                  <app-button variant="text" size="sm" (click)="onDelete.emit(invoice.id!)">Eliminar</app-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-8 text-center text-steel">No hay facturas registradas.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class InvoicesTableComponent {
  invoices = input<Invoice[]>([]);

  onEdit = output<Invoice>();
  onDelete = output<number>();
  onIssue = output<number>();

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
