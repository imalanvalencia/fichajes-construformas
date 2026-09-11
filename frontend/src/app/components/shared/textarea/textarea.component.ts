import { Component, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-textarea',
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
      <textarea
        [id]="fieldId"
        [value]="value()"
        [rows]="rows()"
        [disabled]="disabled()"
        [placeholder]="placeholder()"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="errorMessage() ? true : null"
        [attr.aria-required]="required() ? true : null"
        [class]="textareaClasses"
        (input)="onInput($event)"
        (focus)="focused = true"
        (blur)="focused = false; touched = true; handleTouched()"
      ></textarea>
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
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  private static idCounter = 0;

  label = input('');
  value = model<string>('');
  rows = input(4);
  disabled = input(false);
  required = input(false);
  placeholder = input('');
  errorMessage = input('');
  helpText = input('');
  id = input<string>('');

  focused = false;
  touched = false;

  private readonly instanceId = `app-textarea-${TextareaComponent.idCounter++}`;

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

  get textareaClasses(): string {
    const base = 'w-full bg-transparent font-sans text-sm text-nero outline-none py-2 px-0 resize-y';
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
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.cvaOnChange(target.value);
  }

  handleTouched(): void {
    this.cvaOnTouched();
  }

  // CVA implementation
  private cvaOnChange: (value: string) => void = () => {};
  private cvaOnTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value.set(val);
  }

  registerOnChange(fn: (value: string) => void): void {
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
