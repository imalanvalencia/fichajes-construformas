import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockType } from '../../../features/clock/types/clock.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-clock-register-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4">
          <h2 class="text-lg font-bold text-nero">
            {{ registeringType() === 'ENTRY' ? 'Fichar Entrada' : 'Fichar Salida' }}
          </h2>

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Usuario ID *</label>
            <input
              type="number"
              [ngModel]="form().userId"
              (ngModelChange)="updateField('userId', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            />
          </div>

          <div class="relative">
            <label class="block font-mono text-xs font-medium text-steel mb-1">Proyecto ID *</label>
            <input
              type="number"
              [ngModel]="form().projectId"
              (ngModelChange)="updateField('projectId', $event)"
              class="w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-input label="Latitud *" type="number" [value]="form().userLatitude?.toString() ?? ''" (valueChange)="updateField('userLatitude', +$event)" />
            <app-input label="Longitud *" type="number" [value]="form().userLongitude?.toString() ?? ''" (valueChange)="updateField('userLongitude', +$event)" />
          </div>

          <app-input label="Notas" [value]="form().notes ?? ''" (valueChange)="updateField('notes', $event)" />

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onSubmit.emit()">Registrar</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClockRegisterModalComponent {
  show = input(false);
  registeringType = input<ClockType>('ENTRY');
  form = input<Partial<{ userId: number; projectId: number; userLatitude: number; userLongitude: number; notes: string }>>({});

  onClose = output<void>();
  onSubmit = output<void>();
  formChange = output<Record<string, unknown>>();

  updateField(field: string, value: unknown): void {
    this.formChange.emit({ [field]: value });
  }
}
