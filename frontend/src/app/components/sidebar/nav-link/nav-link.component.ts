import { Component, input } from '@angular/core';
import { LinkComponent } from '@shared-components';

@Component({
  selector: 'app-nav-link',
  imports: [LinkComponent],
  template: ` <app-link [route]="route()"> <ng-content /></app-link> `,
  styles: ``,
})
export class NavLinkComponent {
  route = input.required<string>();
}
