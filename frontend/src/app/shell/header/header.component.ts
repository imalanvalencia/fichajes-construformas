import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="flex flex-col items-center justify-between h-16 px-6 bg-surface-white border-b border-steel/30 shrink-0">
      <!-- Menu toggle (mobile) -->
      <button
        class="lg:hidden p-2 text-nero hover:text-accent transition-colors"
        (click)="menuToggle.emit()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>

      <!-- Right side -->
      <div class="flex self-end items-center gap-4">
        <!-- User info -->
        <div class="text-right">
          <div class="text-sm font-medium text-nero">{{ userName }}</div>
          <div class="flex gap-1 justify-end mt-0.5">
            @for (role of userRoles; track role) {
              <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-accent/10 text-accent rounded-sm">
                {{ role.replace('ROLE_', '') }}
              </span>
            }
          </div>
        </div>

        <!-- Logout button -->
        <button
          (click)="onLogout()"
          class="p-2 text-steel hover:text-accent transition-colors"
          title="Cerrar sesión"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  `,
  styles: `:host { display: block; }`
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  get userName(): string {
    return this.authService.getUser()?.name ?? 'Usuario';
  }

  get userRoles(): string[] {
    return this.authService.getUser()?.roles ?? [];
  }

  onLogout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
