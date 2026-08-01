import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div class="bg-white border border-steel p-6">
      <div class="text-[48px] font-extrabold tracking-[-0.03em] leading-none" [style.color]="color || '#1C1C1D'">
        {{ value }}
      </div>
      <div class="font-mono text-sm font-medium text-steel mt-2">{{ label }}</div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class MetricCardComponent {
  @Input() value: string | number = '';
  @Input() label = '';
  @Input() color = '#1C1C1D';
}
