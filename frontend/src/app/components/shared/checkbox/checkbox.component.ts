import { Component, input, model, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Application-owned checkbox contract, matching the other `app-*` primitives:
 * label, help/error, disabled, required, and native accessibility attributes.
 * Added so the user-management role picker can express a many-to-many set.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  template: `
    <label [class]="labelClasses" [for]="fieldId">
      <input
        [id]="fieldId"
        type="checkbox"
        class="accent-accent size-4"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-describedby]="describedBy"
        [attr.aria-invalid]="errorMessage() ? true : null"
        [attr.aria-required]="required() ? true : null"
        (change)="onToggle($event)"
        (blur)="touched = true; handleTouched()"
      />
      <span>{{ label() }}</span>
    </label>
    @if (helpText() && !errorMessage()) {
      <div [id]="helpId" class="font-mono text-xs text-steel mt-1">{{ helpText() }}</div>
    }
    @if (errorMessage()) {
      <div [id]="errorId" class="font-mono text-xs text-construction-red mt-1">
        {{ errorMessage() }}
      </div>
    }
  `,
  styles: `
    :host { display: block; }
    label { display: inline-flex; align-items: center; gap: 0.5rem; }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  private static idCounter = 0;

  label = input('');
  checked = model(false);
  disabled = input(false);
  required = input(false);
  errorMessage = input('');
  helpText = input('');
  id = input<string>('');

  touched = false;

  private readonly instanceId = `app-checkbox-${CheckboxComponent.idCounter++}`;

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

  get labelClasses(): string {
    const base = 'font-sans text-sm';
    const color = this.errorMessage() ? 'text-construction-red' : 'text-nero';
    const disabled = this.disabled() ? 'opacity-50 cursor-not-allowed' : '';
    return `${base} ${color} ${disabled}`;
  }

  onToggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.cvaOnChange(next);
  }

  handleTouched(): void {
    this.cvaOnTouched();
  }

  // CVA implementation
  private cvaOnChange: (value: boolean) => void = () => {};
  private cvaOnTouched: () => void = () => {};

  writeValue(val: boolean): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.cvaOnChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.cvaOnTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    // InputSignal is read-only in Angular 22; bind the disabled input instead.
  }
}
