import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white border border-steel p-6">
      <ng-content />
    </div>
  `,
  styles: `:host { display: block; }`
})
export class CardComponent {}
