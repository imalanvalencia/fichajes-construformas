import { Component, input, output } from '@angular/core';
import { Supplier } from '../../../features/suppliers/types/supplier.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { CardComponent } from '../../shared/card/card.component';
import { BadgeComponent } from '../../shared/badge/badge.component';

@Component({
  selector: 'app-suppliers-table',
  standalone: true,
  imports: [ButtonComponent, CardComponent, BadgeComponent],
  template: `
    <app-card>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-steel/30">
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Nombre</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Contacto</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Email</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Teléfono</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">CIF/NIF</th>
              <th class="text-left py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Estado</th>
              <th class="text-right py-3 px-4 font-mono text-xs font-medium text-steel uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (supplier of suppliers(); track supplier.id) {
              <tr class="border-b border-steel/10 hover:bg-cement/50">
                <td class="py-3 px-4 font-medium text-nero">{{ supplier.name }}</td>
                <td class="py-3 px-4 text-steel">{{ supplier.contactName || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ supplier.email || '—' }}</td>
                <td class="py-3 px-4 text-steel">{{ supplier.phone || '—' }}</td>
                <td class="py-3 px-4 text-steel font-mono">{{ supplier.taxId || '—' }}</td>
                <td class="py-3 px-4">
                  <app-badge [status]="supplier.active ? 'ACTIVE' : 'INACTIVE'" />
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                  <app-button variant="text" size="sm" (click)="onEdit.emit(supplier)">Editar</app-button>
                  <app-button variant="text" size="sm" (click)="onDelete.emit(supplier.id!)">Eliminar</app-button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-8 text-center text-steel">No hay proveedores registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class SuppliersTableComponent {
  suppliers = input<Supplier[]>([]);

  onEdit = output<Supplier>();
  onDelete = output<number>();
}
