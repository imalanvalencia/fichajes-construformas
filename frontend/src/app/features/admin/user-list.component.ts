import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/auth.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <h2 class="font-poppins text-3xl font-bold text-nero">USUARIOS</h2>
        <a routerLink="/admin/users/new"
          class="bg-nero text-cement-grey font-mono text-xs tracking-widest
                 px-4 py-2 hover:bg-steel-grey">
          + NUEVO
        </a>
      </div>

      @if (loading()) {
        <p class="text-steel-grey">Cargando...</p>
      } @else {
        <div class="border border-steel-grey">
          <div class="grid grid-cols-5 gap-4 p-4 border-b border-steel-grey bg-white">
            <p class="font-mono text-xs tracking-widest text-steel-grey">NOMBRE</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">EMAIL</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">ROL</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">ESTADO</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">ACCION</p>
          </div>
          @for (user of users(); track user.id) {
            <div class="grid grid-cols-5 gap-4 p-4 border-b border-steel-grey items-center">
              <p class="font-poppins text-sm text-nero">{{ user.name }}</p>
              <p class="font-mono text-xs text-nero">{{ user.email }}</p>
              <p class="font-mono text-xs text-steel-grey">{{ user.role }}</p>
              <p class="font-mono text-xs" [class.text-green-600]="user.active" [class.text-construction-red]="!user.active">
                {{ user.active ? 'ACTIVO' : 'INACTIVO' }}
              </p>
              <a [routerLink]="['/admin/users', user.id]"
                class="font-mono text-xs text-steel-grey hover:text-nero">
                EDITAR
              </a>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private adminService = inject(AdminService);

  users = signal<User[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
