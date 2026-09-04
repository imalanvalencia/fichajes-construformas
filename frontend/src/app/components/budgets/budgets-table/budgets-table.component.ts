import { Component, input, output } from '@angular/core';
import { Budget } from '../../../features/budgets/types/budget.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-budgets-table',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
    <app-card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Proyecto
              </th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Versión
              </th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Tipo
              </th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Estado
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Monto Final
              </th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            @for (budget of budgets(); track budget.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 font-medium text-nero">{{ budget.project?.name || '—' }}</td>
                <td class="py-3 px-4 text-steel font-mono">v{{ budget.version }}</td>
                <td class="py-3 px-4 text-steel">{{ budget.budgetType }}</td>
                <td class="py-3 px-4">
                  <app-badge [status]="budget.status" />
                </td>
                <td class="py-3 px-4 text-right font-medium text-nero">
                  {{ formatCurrency(budget.finalAmount) }}
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                  @if (budget.status !== 'SUPERSEDED') {
                    <app-button variant="text" size="sm" (click)="onViewItems.emit(budget)"
                      >Items</app-button
                    >
                  }

                  @if (budget.status === 'DRAFT') {
                    <app-button variant="filled" size="sm" (click)="onApprove.emit(budget.id!)"
                      >Aprobar</app-button
                    >
                    <app-button variant="text" size="sm" (click)="onReject.emit(budget.id!)"
                      >Rechazar</app-button
                    >
                  } @else if (budget.status === 'APPROVED') {
                    <app-button variant="text" size="sm" (click)="onUpdate.emit(budget.id!)"
                      >Actualizar</app-button
                    >
                  } @else if (budget.status === 'REJECTED') {
                    <app-button variant="text" size="sm" (click)="onDelete.emit(budget.id!)"
                      >Eliminar</app-button
                    >
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="py-8 text-center text-steel">
                  No hay presupuestos registrados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class BudgetsTableComponent {
  budgets = input<Budget[]>([]);

  onViewItems = output<Budget>();
  onApprove = output<number>();
  onReject = output<number>();
  onUpdate = output<number>();
  onDelete = output<number>();

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
  }
}
