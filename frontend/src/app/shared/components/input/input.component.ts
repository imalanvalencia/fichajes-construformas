import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <input
        #inputEl
        [type]="type"
        [value]="value"
        [disabled]="disabled"
        (input)="onInput($event)"
        (focus)="focused = true"
        (blur)="focused = false"
        [class]="inputClasses"
        placeholder=" "
      />
      <label
        [class]="labelClasses"
        (click)="inputEl.focus()"
      >
        {{ label }}
      </label>
    </div>
  `,
  styles: `
    :host { display: block; }
    input:focus + label,
    input:not(:placeholder-shown) + label {
      transform: translateY(-1.4rem);
      font-size: 0.65rem;
      color: #E22D2D;
    }
  `
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
    const base = 'w-full bg-transparent font-sans text-sm text-nero border-b border-steel outline-none py-2 px-0';
    const focus = this.focused ? 'border-b-accent' : '';
    const disabled = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${focus} ${disabled}`;
  }

  get labelClasses(): string {
    const base = 'absolute left-0 top-2 text-sm font-mono text-steel pointer-events-none transition-all duration-0';
    return base;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  }
}
