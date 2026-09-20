import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-surface-container-lowest border border-steel">
      @if (category() || title()) {
        <div class="border-b border-steel px-6 py-4">
          @if (category()) {
            <div class="font-mono text-xs font-medium uppercase tracking-wider text-steel">{{ category() }}</div>
          }
          @if (title()) {
            <div class="font-sans text-lg font-bold text-nero mt-1">{{ title() }}</div>
          }
        </div>
      }
      <div class="p-6">
        <ng-content />
      </div>
    </div>
  `,
  styles: `:host { display: block; }`
})
export class CardComponent {
  category = input('');
  title = input('');
}
