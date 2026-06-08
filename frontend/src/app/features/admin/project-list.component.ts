import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { Project } from '../../core/models/clock.models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <h2 class="font-poppins text-3xl font-bold text-nero">OBRAS</h2>
        <a routerLink="/admin/projects/new"
          class="bg-nero text-cement-grey font-mono text-xs tracking-widest
                 px-4 py-2 hover:bg-steel-grey">
          + NUEVA
        </a>
      </div>

      @if (loading()) {
        <p class="text-steel-grey">Cargando...</p>
      } @else {
        <div class="border border-steel-grey">
          <div class="grid grid-cols-4 gap-4 p-4 border-b border-steel-grey bg-white">
            <p class="font-mono text-xs tracking-widest text-steel-grey">NOMBRE</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">DIRECCION</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">RADIO</p>
            <p class="font-mono text-xs tracking-widest text-steel-grey">ACCION</p>
          </div>
          @for (project of projects(); track project.id) {
            <div class="grid grid-cols-4 gap-4 p-4 border-b border-steel-grey items-center">
              <p class="font-poppins text-sm text-nero">{{ project.name }}</p>
              <p class="font-mono text-xs text-steel-grey">{{ project.address }}</p>
              <p class="font-mono text-xs text-nero">{{ project.allowedRadiusMeters }}m</p>
              <a [routerLink]="['/admin/projects', project.id]"
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
export class ProjectListComponent implements OnInit {
  private adminService = inject(AdminService);

  projects = signal<Project[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.adminService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
