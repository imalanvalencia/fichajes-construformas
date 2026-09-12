import { Component, input, model, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative pt-4">
      @if (label()) {
        <label
          [for]="fieldId"
          [class]="labelClasses"
        >
          {{ label() }}
        </label>
      }
      <input
        #inputEl
        [id]="fieldId"
        [name]="name() || undefined"
        [type]="type()"
        [value]="value()"
        [disabled]="disabled()"
        [placeholder]="placeholder()"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="errorMessage() ? true : null"
        [attr.aria-required]="required() ? true : null"
        [class]="inputClasses"
        (input)="onInput($event)"
        (focus)="focused = true"
        (blur)="focused = false; touched = true; handleTouched()"
      />
      @if (helpText() && !errorMessage()) {
        <div [id]="helpId" class="font-mono text-xs text-steel mt-1">{{ helpText() }}</div>
      }
      @if (errorMessage()) {
        <div [id]="errorId" class="font-mono text-xs text-construction-red mt-1">{{ errorMessage() }}</div>
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent<T = string> implements ControlValueAccessor {
  private static idCounter = 0;

  label = input('');
  type = input('text');
  value = model<T>(undefined! as T);
  disabled = input(false);
  required = input(false);
  name = input<string>('');
  errorMessage = input('');
  helpText = input('');
  id = input<string>('');
  placeholder = input('');

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLInputElement>;

  focused = false;
  touched = false;

  private readonly instanceId = `app-input-${InputComponent.idCounter++}`;

  get fieldId(): string {
    return this.id() || this.instanceId;
  }

  get helpId(): string {
    return `${this.fieldId}-help`;
  }

  get errorId(): string {
    return `${this.fieldId}-error`;
  }

  get describedBy(): string | null {
    if (this.errorMessage()) return this.errorId;
    if (this.helpText()) return this.helpId;
    return null;
  }

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
    const val = target.value as unknown as T;
    this.value.set(val);
    this.cvaOnChange(val);
  }

  handleTouched(): void {
    this.cvaOnTouched();
  }

  // CVA implementation
  private cvaOnChange: (value: T) => void = () => {};
  private cvaOnTouched: () => void = () => {};

  writeValue(val: T): void {
    this.value.set(val);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.cvaOnChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.cvaOnTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // Note: InputSignal is read-only in Angular 22.
    // For CVA integration, callers should use the disabled input binding.
    // This method satisfies the ControlValueAccessor interface.
  }
}
