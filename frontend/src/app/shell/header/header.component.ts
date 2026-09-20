import { Component, inject, output } from '@angular/core';
import { AuthService } from '@auth/services/auth.service';
import { MatIcon } from '@angular/material/icon';
import { InputComponent } from '@app/components/shared';
import { UserComponenent } from '@app/components/header/user/user.componenent';

@Component({
  selector: 'app-header',
  template: `
    <header
      class="flex flex-col items-center justify-between p-4 bg-surface-white border-b border-steel/30 shrink-0"
    >
      <!-- Menu toggle (mobile) -->
      <button
        class="lg:hidden p-2 text-nero hover:text-accent transition-colors"
        (click)="menuToggle.emit()"
      >
        <mat-icon fontSet="material-icons-outlined">menu</mat-icon>
      </button>

      <!-- Right side -->
      <div class="flex self-end items-center gap-4">
        <!-- User info -->
        <div class="text-right">
          <div class="text-sm font-medium text-nero">{{ userName }}</div>
          <div class="flex gap-1 justify-end mt-0.5">
            @for (role of userRoles; track role) {
              <span
                class="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-accent/10 text-accent rounded-sm"
              >
                {{ role.replace('ROLE_', '') }}
              </span>
            }
          </div>
        </div>

        <!-- User button -->
        <app-user />
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  imports: [UserComponenent, MatIcon],
})
export class HeaderComponent {
  menuToggle = output<void>();

  private authService = inject(AuthService);

  get userName(): string {
    return this.authService.getUser()?.name ?? 'Usuario';
  }

  get userRoles(): string[] {
    return this.authService.getUser()?.roles ?? [];
  }
}
