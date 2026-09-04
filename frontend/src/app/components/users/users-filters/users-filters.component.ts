import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../features/users/types/user.types';
import { CardComponent } from '../../shared/card/card.component';

@Component({
  selector: 'app-users-filters',
  standalone: true,
  imports: [FormsModule, CardComponent],
  template: `
    <app-card>
      <div class="flex gap-4">
        <div class="relative">
          <label class="block font-mono text-xs font-medium text-steel mb-1">Filtrar por Rol</label>
          <select
            [ngModel]="filterRole()"
            (ngModelChange)="onFilterChange.emit($event)"
            class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
          >
            <option value="">Todos</option>
            <option value="ADMIN">Administrador</option>
            <option value="OPERATOR">Operador</option>
            <option value="MANAGER">Gerente</option>
          </select>
        </div>
      </div>
    </app-card>
  `,
})
export class UsersFiltersComponent {
  filterRole = input<string>('');

  onFilterChange = output<string>();
}
