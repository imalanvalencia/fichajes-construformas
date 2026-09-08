import { Component, input } from '@angular/core';
import { LinkComponent } from '@shared-components';

@Component({
  selector: 'app-nav-link',
  imports: [LinkComponent],
  template: `
    <app-link
      [route]="route()"
      variant="text"
      [icon]="icon()"
      hostClasses="min-w-full! border-l-4! !border-l-transparent p-6! justify-start! hover:bg-accent! hover:text-white!"
      activeClasses="border-l-accent! bg-primary! text-white!"
    >
      <ng-content
    /></app-link>
  `,
  styles: `
    @import 'tailwindcss';
    @import '../../../app.css';

    :host {
      @apply block ;
    }

    :host app-link {
     @apply w-full;
    }
  `,
})
export class NavLinkComponent {
  route = input.required<string>();
  icon = input.required<string>();
}
