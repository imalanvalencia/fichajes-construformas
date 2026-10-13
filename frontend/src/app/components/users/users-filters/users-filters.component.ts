import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROLE_NAMES, roleLabel } from '../../../features/users/types/user.types';
import { CardComponent } from '../../shared/card/card.component';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-users-filters',
  standalone: true,
  imports: [FormsModule, CardComponent, SelectComponent],
  template: `
    <app-card>
      <div class="flex gap-4">
        <app-select
          label="Filtrar por Rol"
          [options]="roleOptions"
          [value]="filterRole()"
          (valueChange)="onFilterChange.emit($event!)"
          placeholder="Todos"
        />
      </div>
    </app-card>
  `,
})
export class UsersFiltersComponent {
  filterRole = input<string>('');

  onFilterChange = output<string>();

  readonly roleOptions = [
    { value: '', label: 'Todos' },
    ...ROLE_NAMES.map((name) => ({ value: name as string, label: roleLabel(name) })),
  ];
}
