import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest border border-steel p-6 flex items-start gap-4">
      <div class="text-[48px] font-extrabold tracking-[-0.03em] leading-none text-construction-red">
        {{ value() }}
      </div>
      <div class="w-px h-12 bg-steel"></div>
      <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel pt-1">{{ label() }}</div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class MetricCardComponent {
  value = input<string | number>('');
  label = input('');
}
