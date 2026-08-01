import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host { display: inline-block; }
    button:hover { filter: brightness(0.85); }
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  get buttonClasses(): string {
    const base = 'font-sans font-medium tracking-tight cursor-pointer transition-none';
    const sizeMap = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3 text-base',
    };
    const variantMap = {
      primary: 'bg-nero text-white border border-nero hover:bg-nero',
      secondary: 'bg-white text-nero border border-steel hover:bg-cement',
      danger: 'bg-accent text-white border border-accent hover:bg-accent',
    };
    const disabledStyle = this.disabled
      ? 'bg-steel text-white border border-steel cursor-not-allowed hover:bg-steel'
      : '';
    return `${base} ${sizeMap[this.size]} ${disabledStyle || variantMap[this.variant]}`;
  }
}
