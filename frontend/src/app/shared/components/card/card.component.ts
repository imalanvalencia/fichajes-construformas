import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article class="border border-steel-grey bg-surface-lowest p-6">
      @if (category()) {
        <p class="font-mono text-xs tracking-widest text-steel-grey mb-2">
          {{ category() }}
        </p>
      }
      @if (title()) {
        <h3 class="font-poppins text-2xl font-bold text-nero mb-4">
          {{ title() }}
        </h3>
      }
      <ng-content />
    </article>
  `,
})
export class CardComponent {
  category = input('');
  title = input('');
}
