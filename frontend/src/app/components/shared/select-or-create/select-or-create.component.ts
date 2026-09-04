import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-or-create',
  standalone: true,
  imports: [FormsModule],
  styles: `
    :host { display: block; }
    label {
      position: absolute;
      left: 0;
      top: 0;
      transition: none;
    }
  `,
  template: `
    <div class="relative pt-4">
      <label class="absolute left-0 top-0 font-mono text-xs font-medium text-steel pointer-events-none">{{ label }}</label>
      <div class="flex gap-2 items-center">
        <select
          [ngModel]="value"
          (ngModelChange)="valueChange.emit($event)"
          [disabled]="disabled"
          class="flex-1 min-h-[2.5rem] bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0"
        >
          <option [ngValue]="null">{{ placeholder }}</option>
          @for (item of items; track item.id ?? item.name) {
            <option [ngValue]="item.id">{{ item.name }}</option>
          }
        </select>
        @if (!disabled) {
          <button
            type="button"
            (click)="showCreate = !showCreate"
            class="text-steel hover:text-accent font-mono text-lg px-1 transition-colors duration-0"
            title="Crear nuevo"
          >+</button>
        }
      </div>
      @if (showCreate) {
        <div class="mt-2 flex gap-2 items-end">
          <input
            #createInput
            type="text"
            [ngModel]="newName"
            (ngModelChange)="newName = $event"
            placeholder="Nombre..."
            class="flex-1 bg-transparent font-sans text-sm text-nero border-b border-steel focus:border-b-accent outline-none py-2 px-0"
          />
          <button
            type="button"
            (click)="onCreate()"
            class="bg-nero text-white text-xs font-medium px-3 py-2 hover:bg-accent transition-colors duration-0"
          >Crear</button>
          <button
            type="button"
            (click)="showCreate = false; newName = ''"
            class="text-steel text-xs font-medium px-2 py-2 hover:text-nero transition-colors duration-0"
          >Cancelar</button>
        </div>
      }
    </div>
  `,
})
export class SelectOrCreateComponent {
  @Input() label = '';
  @Input() items: Array<{ id?: number; name: string }> = [];
  @Input() value: number | null = null;
  @Input() placeholder = 'Seleccionar...';
  @Input() required = false;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<number>();
  @Output() create = new EventEmitter<string>();

  showCreate = false;
  newName = '';

  onCreate(): void {
    if (this.newName.trim()) {
      this.create.emit(this.newName.trim());
      this.newName = '';
      this.showCreate = false;
    }
  }
}
