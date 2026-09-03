import { Component, input, model, output, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <div class="relative pt-4">
      <label
        [class]="labelClasses"
        (click)="inputEl.focus()"
      >
        {{ label() }}
      </label>
      <input
        #inputEl
        [type]="type()"
        [value]="value()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (focus)="focused = true"
        (blur)="focused = false"
        [class]="inputClasses"
      />
      @if (errorMessage()) {
        <div class="font-mono text-xs text-construction-red mt-1">{{ errorMessage() }}</div>
      }
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
  label = input('');
  type = input('text');
  value = model('');
  disabled = input(false);
  errorMessage = input('');

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  focused = false;

  get inputClasses(): string {
    const base = 'w-full min-h-[2.5rem] bg-transparent font-sans text-sm text-nero outline-none py-2 px-0';
    const border = this.errorMessage()
      ? 'border-b-2 border-construction-red'
      : 'border-b border-steel';
    const focus = this.focused && !this.errorMessage() ? 'border-b-accent' : '';
    const disabled = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${border} ${focus} ${disabled}`;
  }

  get labelClasses(): string {
    const base = 'absolute left-0 font-mono text-xs font-medium pointer-events-none';
    const color = this.errorMessage()
      ? 'text-construction-red'
      : this.focused
        ? 'text-accent'
        : 'text-steel';
    return `${base} ${color}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }
}
