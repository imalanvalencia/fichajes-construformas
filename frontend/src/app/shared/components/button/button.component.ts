import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button [type]="type()" [disabled]="disabled()"
      class="font-poppins font-bold py-3 px-6 text-base cursor-pointer
             disabled:opacity-50 transition-none"
      [ngClass]="{
        'bg-nero text-on-primary hover:bg-construction-red': variant() === 'primary',
        'bg-transparent text-nero border border-nero hover:bg-nero hover:text-on-primary': variant() === 'outline',
        'bg-error text-on-error hover:bg-nero': variant() === 'danger'
      }">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'outline' | 'danger'>('primary');
  disabled = input(false);
}
