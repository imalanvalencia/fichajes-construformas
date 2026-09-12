import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { SelectComponent, SelectOption } from '../select/select.component';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-select-or-create',
  standalone: true,
  imports: [SelectComponent, InputComponent],
  styles: `
    :host { display: block; }
  `,
  template: `
    <div class="relative pt-4">
      <app-select
        [label]="label"
        [options]="selectOptions()"
        [value]="toStr(value)"
        [placeholder]="placeholder"
        [disabled]="disabled"
        (valueChange)="onSelectChange($event)"
      />
      @if (!disabled) {
        <button
          type="button"
          (click)="showCreate = !showCreate"
          class="absolute right-0 top-0 text-steel hover:text-accent font-mono text-lg px-1 transition-colors duration-0"
          title="Crear nuevo"
        >+</button>
      }
      @if (showCreate) {
        <div class="mt-2 flex gap-2 items-end">
          <app-input
            type="text"
            [value]="newName"
            (valueChange)="newName = $event"
            placeholder="Nombre..."
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

  /** Convert to string for template bindings (String() unavailable in templates) */
  toStr(val: number | null): string {
    return String(val ?? 0);
  }

  selectOptions = computed<SelectOption[]>(() =>
    this.items.map((item) => ({
      value: String(item.id ?? 0),
      label: item.name,
    }))
  );

  onSelectChange(val: string | number): void {
    const num = typeof val === 'string' ? Number(val) : val;
    this.valueChange.emit(num);
  }

  onCreate(): void {
    if (this.newName.trim()) {
      this.create.emit(this.newName.trim());
      this.newName = '';
      this.showCreate = false;
    }
  }
}
