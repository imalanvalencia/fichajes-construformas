import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, RouterOutlet],
  template: `
    <div class="flex h-screen overflow-hidden">
      <app-sidebar (toggle)="mobileOpen = !mobileOpen" />
      <div class="flex flex-col flex-1 min-w-0">
        <app-header (menuToggle)="mobileOpen = !mobileOpen" />
        <main class="flex-1 overflow-auto bg-cement p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (mobileOpen) {
      <div class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-black/50" (click)="mobileOpen = false"></div>
        <div class="absolute inset-y-0 left-0 w-60 bg-nero">
          <app-sidebar (toggle)="mobileOpen = false" />
        </div>
      </div>
    }
  `,
  styles: `:host { display: block; }`
})
export class ShellComponent {
  mobileOpen = false;
}
