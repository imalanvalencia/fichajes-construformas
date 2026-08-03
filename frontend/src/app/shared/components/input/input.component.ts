import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative pt-4">
      <label
        [class]="labelClasses"
        (click)="inputEl.focus()"
      >
        {{ label }}
      </label>
      <input
        #inputEl
        [type]="type"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (focus)="focused = true"
        (blur)="focused = false"
        [class]="inputClasses"
      />
    </div>
  `,
  styles: `
    :host { display: block; }
    label {
      position: absolute;
      left: 0;
      top: 0;
      transition: none;
    }
  `,
})
export class InputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  focused = false;

  get inputClasses(): string {
    const base = 'w-full min-h-[2.5rem] bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0';
    const focus = this.focused ? 'border-b-accent' : '';
    const disabled = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${focus} ${disabled}`;
  }

  get labelClasses(): string {
    const base = 'absolute left-0 font-mono text-xs font-medium pointer-events-none';
    const color = this.focused ? 'text-accent' : 'text-steel';
    return `${base} ${color}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  }
}
