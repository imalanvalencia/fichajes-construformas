import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-1">
      <label class="font-mono text-xs tracking-widest text-steel-grey">
        {{ label() }}
      </label>
      <input [type]="type()" [ngModel]="value()" (ngModelChange)="valueChange.emit($event)"
        [placeholder]="placeholder()"
        class="w-full bg-transparent border-b border-nero py-2 text-base font-poppins
               text-nero outline-none focus:border-construction-red placeholder:text-outline-variant" />
      @if (error()) {
        <span class="font-mono text-xs text-error">{{ error() }}</span>
      }
    </div>
  `,
})
export class InputComponent {
  label = input.required<string>();
  type = input('text');
  placeholder = input('');
  value = input('');
  error = input('');
  valueChange = output<string>();
}
