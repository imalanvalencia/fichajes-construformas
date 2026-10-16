import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockType } from '../../../features/clock/types/clock.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent, SelectOption } from '../../shared/select/select.component';

export type LocationState = 'idle' | 'locating' | 'ready' | 'error';

@Component({
  selector: 'app-clock-register-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, InputComponent, SelectComponent],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" (click)="onClose.emit()"></div>
        <div class="relative bg-white border border-steel w-full max-w-lg mx-4 p-6 space-y-4">
          <h2 class="text-lg font-bold text-nero">
            {{ registeringType() === 'ENTRY' ? 'Fichar Entrada' : 'Fichar Salida' }}
          </h2>

          <div class="font-mono text-xs text-steel">Ficha por: {{ currentUserLabel() }}</div>

          <app-select
            label="Proyecto *"
            [options]="projectOptions()"
            [value]="form().projectId"
            (valueChange)="onProjectChange($event)"
            placeholder="Seleccioná una obra"
          />

          <div
            class="font-mono text-xs"
            [class.text-steel]="locationState() === 'ready'"
            [class.text-construction-red]="locationState() === 'error'"
          >
            @switch (locationState()) {
              @case ('locating') {
                Obteniendo tu ubicación…
              }
              @case ('ready') {
                Ubicación verificada: {{ locationText() }}
              }
              @case ('error') {
                No pudimos obtener tu ubicación: {{ locationText() }}
              }
              @default {
                La ubicación se tomará de tu navegador al fichar.
              }
            }
          </div>

          <app-input label="Notas" [value]="form().notes ?? ''" (valueChange)="updateField('notes', $event)" />

          <div class="flex justify-end gap-3 pt-2">
            <app-button variant="text" (click)="onClose.emit()">Cancelar</app-button>
            <app-button variant="filled" (click)="onSubmit.emit(form())">Registrar</app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ClockRegisterModalComponent {
  show = input(false);
  registeringType = input<ClockType>('ENTRY');
  form = input<Partial<{ projectId: number; notes: string }>>({});
  projectOptions = input<SelectOption<number>[]>([]);
  currentUserLabel = input('');
  locationState = input<LocationState>('idle');
  locationText = input('');

  onClose = output<void>();
  onSubmit = output<Partial<{ projectId: number; notes: string }>>();
  formChange = output<Record<string, unknown>>();

  updateField(field: string, value: unknown): void {
    this.formChange.emit({ [field]: value });
  }

  onProjectChange(value: unknown): void {
    this.formChange.emit({ projectId: Number(value) });
  }
}
