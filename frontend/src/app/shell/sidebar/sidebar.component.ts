import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LinkComponent } from '../../shared/components/link/link.component';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, ButtonComponent, LinkComponent],
  template: `
    <aside class="flex flex-col w-60 h-full bg-inverse-on-surface text-black font-sans select-none">
      <!-- Brand -->
      <section class="flex flex-col items-center gap-3 shrink-0 px-4 py-6">
        <span class="text-xl font-bold text-black tracking-tight">ConstruFormas</span>
        <app-button variant="filled" icon="add">
          <ng-template #content>Nuevo Presupuesto</ng-template>
        </app-button>
        <app-button>
          <ng-template #content>información</ng-template>
        </app-button>
      </section>

      <nav class="flex-1">
        <!-- Navigation -->
        <div class="flex flex-col flex-1 overflow-y-auto py-4 gap-1">
          @for (item of visibleNavItems; track item.route) {
            <app-link route="{{ item.route }}" (click)="toggle.emit()">
              <ng-template #content>
                <mat-icon fontSet="material-icons-outlined">{{ item.icon }}</mat-icon>
                {{ item.label }}
              </ng-template>
            </app-link>
          }
        </div>
      </nav>

      <!-- Logout -->
      <div class="border-t border-white/10 px-4 py-6 shrink-0">
        <app-button icon="logout" variant="text" (click)="onLogout()">
          <ng-template #content>
            <span>Cerrar sesión</span>
          </ng-template>
        </app-button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Output() toggle = new EventEmitter<void>();

  private allNavItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/' },
    { icon: 'groups', label: 'Clientes', route: '/clients' },
    { icon: 'gite', label: 'Proyectos', route: '/projects' },
    { icon: 'assignment', label: 'Presupuestos', route: '/budgets' },
    { icon: 'receipt_long', label: 'Facturas', route: '/invoices' },
    // { icon: 'home', label: 'Proveedores', route: '/suppliers' },
    // { icon: 'home', label: 'Pagos', route: '/payments' },
    // { icon: 'home', label: 'Fichajes', route: '/clock' },
    { icon: 'user', label: 'Usuarios', route: '/users', adminOnly: true },
  ];

  constructor(private authService: AuthService) {}

  get visibleNavItems(): NavItem[] {
    const user = this.authService.getUser();
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    return this.allNavItems.filter((item) => !item.adminOnly || isAdmin);
  }

  onLogout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
