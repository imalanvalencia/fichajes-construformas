import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <section class="min-h-screen bg-cement-grey p-8">
      <header class="flex items-center justify-between mb-12 border-b border-steel-grey pb-4">
        <div class="flex items-center gap-8">
          <h1 class="font-poppins text-2xl font-bold text-nero">CONSTRUFORMAS</h1>
          <span class="font-mono text-xs tracking-widest text-construction-red">ADMIN</span>
        </div>
        <nav class="flex items-center gap-6">
          <a routerLink="/admin/users"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-nero">
            USUARIOS
          </a>
          <a routerLink="/admin/projects"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-nero">
            OBRAS
          </a>
          <a routerLink="/admin/corrections"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-nero">
            CORRECCIONES
          </a>
          <a routerLink="/admin/reports"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-nero">
            REPORTES
          </a>
          <a routerLink="/dashboard"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-nero">
            FICHAR
          </a>
          <button (click)="logout()"
            class="font-mono text-xs tracking-widest text-steel-grey hover:text-construction-red cursor-pointer">
            SALIR
          </button>
        </nav>
      </header>
      <router-outlet />
    </section>
  `,
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
