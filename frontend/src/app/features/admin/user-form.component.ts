import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, CreateUserRequest, UpdateUserRequest } from '../../core/services/admin.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-xl">
      <h2 class="font-poppins text-3xl font-bold text-nero mb-8">
        {{ isEdit() ? 'EDITAR USUARIO' : 'NUEVO USUARIO' }}
      </h2>

      @if (error()) {
        <p class="text-construction-red text-sm mb-4">{{ error() }}</p>
      }

      <form (submit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">NOMBRE</label>
          <input type="text" [(ngModel)]="form.name" name="name" required
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">EMAIL</label>
          <input type="email" [(ngModel)]="form.email" name="email" required
            [disabled]="isEdit()"
            class="w-full border border-steel-grey p-2 bg-white text-nero disabled:bg-cement-grey" />
        </div>

        @if (!isEdit()) {
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">CONTRASEÑA</label>
            <input type="password" [(ngModel)]="form.password" name="password" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>
        }

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">TELEFONO</label>
          <input type="tel" [(ngModel)]="form.phone" name="phone"
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">NIE</label>
          <input type="text" [(ngModel)]="form.nie" name="nie"
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">ROL</label>
          <select [(ngModel)]="form.role" name="role"
            class="w-full border border-steel-grey p-2 bg-white text-nero">
            <option value="OPERATOR">OPERADOR</option>
            <option value="ADMIN">ADMINISTRADOR</option>
          </select>
        </div>

        @if (isEdit()) {
          <div class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="form.active" name="active" id="active"
              class="accent-nero" />
            <label for="active" class="font-mono text-xs tracking-widest text-steel-grey">ACTIVO</label>
          </div>
        }

        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="loading()"
            class="bg-nero text-cement-grey font-mono text-xs tracking-widest
                   px-6 py-2 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
            {{ loading() ? 'GUARDANDO...' : 'GUARDAR' }}
          </button>
          <a routerLink="/admin/users"
            class="border border-steel-grey text-nero font-mono text-xs tracking-widest
                   px-6 py-2 hover:bg-white cursor-pointer">
            CANCELAR
          </a>
        </div>
      </form>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  userId: number | null = null;

  form: CreateUserRequest & UpdateUserRequest & { active: boolean } = {
    name: '',
    email: '',
    password: '',
    phone: '',
    nie: '',
    role: 'OPERATOR',
    active: true,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.userId = +id;
      this.isEdit.set(true);
      this.adminService.getUserById(this.userId).subscribe({
        next: (user) => {
          this.form = {
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || '',
            nie: user.nie || '',
            role: user.role,
            active: user.active,
          };
        },
        error: () => this.error.set('Error al cargar usuario'),
      });
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    if (this.isEdit() && this.userId) {
      const req: UpdateUserRequest = {
        name: this.form.name,
        phone: this.form.phone || undefined,
        nie: this.form.nie || undefined,
        active: this.form.active,
      };
      this.adminService.updateUser(this.userId, req).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar');
          this.loading.set(false);
        },
      });
    } else {
      const req: CreateUserRequest = {
        name: this.form.name,
        email: this.form.email,
        password: this.form.password,
        phone: this.form.phone || undefined,
        nie: this.form.nie || undefined,
        role: this.form.role,
      };
      this.adminService.createUser(req).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.loading.set(false);
        },
      });
    }
  }
}
