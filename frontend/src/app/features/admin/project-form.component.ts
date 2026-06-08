import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Project } from '../../core/models/clock.models';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-xl">
      <h2 class="font-poppins text-3xl font-bold text-nero mb-8">
        {{ isEdit() ? 'EDITAR OBRA' : 'NUEVA OBRA' }}
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
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">DIRECCION</label>
          <input type="text" [(ngModel)]="form.address" name="address" required
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">LATITUD</label>
            <input type="number" step="any" [(ngModel)]="form.latitude" name="latitude" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">LONGITUD</label>
            <input type="number" step="any" [(ngModel)]="form.longitude" name="longitude" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">RADIO PERMITIDO (m)</label>
          <input type="number" [(ngModel)]="form.allowedRadiusMeters" name="allowedRadiusMeters"
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div class="flex gap-4 pt-4">
          <button type="submit" [disabled]="loading()"
            class="bg-nero text-cement-grey font-mono text-xs tracking-widest
                   px-6 py-2 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
            {{ loading() ? 'GUARDANDO...' : 'GUARDAR' }}
          </button>
          <a routerLink="/admin/projects"
            class="border border-steel-grey text-nero font-mono text-xs tracking-widest
                   px-6 py-2 hover:bg-white cursor-pointer">
            CANCELAR
          </a>
        </div>
      </form>
    </div>
  `,
})
export class ProjectFormComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  projectId: number | null = null;

  form: Partial<Project> = {
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    allowedRadiusMeters: 50,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.projectId = +id;
      this.isEdit.set(true);
      this.adminService.getProjectById(this.projectId).subscribe({
        next: (project) => {
          this.form = { ...project };
        },
        error: () => this.error.set('Error al cargar obra'),
      });
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    const req = { ...this.form };

    if (this.isEdit() && this.projectId) {
      this.adminService.updateProject(this.projectId, req).subscribe({
        next: () => this.router.navigate(['/admin/projects']),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar');
          this.loading.set(false);
        },
      });
    } else {
      this.adminService.createProject(req).subscribe({
        next: () => this.router.navigate(['/admin/projects']),
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear');
          this.loading.set(false);
        },
      });
    }
  }
}
