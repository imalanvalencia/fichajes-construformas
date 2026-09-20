import { Component, inject } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenavContainer,
  MatSidenav,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { SidebarService } from '@app/services/sidebar.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
  ],
  template: `
    <mat-sidenav-container class="flex h-screen overflow-hidden">
      <mat-sidenav class="max-w-max" [opened]="sidebarService.visible()" mode="side">
        <app-sidebar />
      </mat-sidenav>

      <mat-sidenav-content class="flex flex-col flex-1 max-w-full">
        <app-header (menuToggle)="mobileOpen = !mobileOpen" />

        <main class="flex-1 overflow-auto bg-cement p-6 min-h-full">

          <router-outlet />
        </main>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ShellComponent {
  mobileOpen = false;
  sidebarService = inject(SidebarService);
}
