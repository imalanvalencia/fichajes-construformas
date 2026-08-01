import { Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex flex-col w-60 h-full bg-nero text-steel font-sans select-none">
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
        <span class="text-xl font-bold text-white tracking-tight">ConstruFormas</span>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-4">
        @for (item of visibleNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-white/10 text-construction-red border-l-[3px] border-construction-red"
            [routerLinkActiveOptions]="{ exact: item.route === '/' }"
            class="flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-[3px] border-transparent transition-colors hover:text-white hover:bg-white/5"
            (click)="toggle.emit()"
          >
            <span class="text-base">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </div>

      <!-- Logout -->
      <div class="border-t border-white/10 p-4 shrink-0">
        <button
          (click)="onLogout()"
          class="flex items-center gap-3 w-full px-3 py-2 text-sm text-steel hover:text-white transition-colors"
        >
          <span class="text-base">🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </nav>
  `,
  styles: `:host { display: block; height: 100%; }`
})
export class SidebarComponent {
  @Output() toggle = new EventEmitter<void>();

  private allNavItems: NavItem[] = [
    { icon: '🏠', label: 'Dashboard', route: '/' },
    { icon: '👥', label: 'Clientes', route: '/clients' },
    { icon: '📁', label: 'Proyectos', route: '/projects' },
    { icon: '📄', label: 'Presupuestos', route: '/budgets' },
    { icon: '🧾', label: 'Facturas', route: '/invoices' },
    { icon: '🚚', label: 'Proveedores', route: '/suppliers' },
    { icon: '💳', label: 'Pagos', route: '/payments' },
    { icon: '⏱️', label: 'Fichajes', route: '/clock' },
    { icon: '👤', label: 'Usuarios', route: '/users', adminOnly: true },
  ];

  constructor(private authService: AuthService) {}

  get visibleNavItems(): NavItem[] {
    const user = this.authService.getUser();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    return this.allNavItems.filter(item => !item.adminOnly || isAdmin);
  }

  onLogout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
