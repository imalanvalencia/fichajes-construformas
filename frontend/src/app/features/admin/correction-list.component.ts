import { Component, inject, signal, OnInit } from '@angular/core';
import { CorrectionService, Correction } from '../../core/services/correction.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-correction-list',
  standalone: true,
  template: `
    <div class="border border-steel-grey p-6">
      <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">CORRECCIONES PENDIENTES</p>

      @if (loading()) {
        <p class="text-steel-grey text-sm">Cargando...</p>
      } @else if (corrections().length === 0) {
        <p class="text-steel-grey text-sm">Sin solicitudes pendientes</p>
      } @else {
        <div class="space-y-4">
          @for (c of corrections(); track c.id) {
            <div class="border border-steel-grey p-4">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="font-poppins text-sm text-nero font-bold">{{ c.user.name }}</p>
                  <p class="font-mono text-xs text-steel-grey">{{ c.user.email }}</p>
                </div>
                <span class="font-mono text-xs px-2 py-1"
                  [class.bg-yellow-100]="c.status === 'PENDING'"
                  [class.text-yellow-800]="c.status === 'PENDING'"
                  [class.bg-green-100]="c.status === 'APPROVED'"
                  [class.text-green-800]="c.status === 'APPROVED'"
                  [class.bg-red-100]="c.status === 'REJECTED'"
                  [class.text-red-800]="c.status === 'REJECTED'">
                  {{ c.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                <p class="font-mono text-steel-grey">Obra:</p>
                <p class="text-nero">{{ c.project.name }}</p>
                <p class="font-mono text-steel-grey">Tipo:</p>
                <p class="text-nero">{{ c.originalClockType === 'ENTRY' ? 'ENTRADA' : 'SALIDA' }}</p>
                <p class="font-mono text-steel-grey">Fecha:</p>
                <p class="text-nero">{{ c.correctionDate }}</p>
                <p class="font-mono text-steel-grey">Hora correcta:</p>
                <p class="text-nero">{{ formatTime(c.correctedTime) }}</p>
              </div>

              <p class="font-mono text-xs text-steel-grey mb-3">Motivo: {{ c.reason }}</p>

              @if (c.status === 'PENDING') {
                <div class="flex gap-2">
                  <button (click)="approve(c.id)"
                    class="flex-1 bg-green-600 text-white font-mono text-xs py-2 hover:bg-green-700 cursor-pointer">
                    APROBAR
                  </button>
                  <button (click)="reject(c.id)"
                    class="flex-1 bg-red-600 text-white font-mono text-xs py-2 hover:bg-red-700 cursor-pointer">
                    RECHAZAR
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CorrectionListComponent implements OnInit {
  private correctionService = inject(CorrectionService);
  private auth = inject(AuthService);

  corrections = signal<Correction[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadCorrections();
  }

  loadCorrections(): void {
    this.correctionService.getPendingCorrections().subscribe({
      next: (data) => {
        this.corrections.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  approve(id: number): void {
    const reviewerId = this.auth.getUserId()!;
    this.correctionService.approveCorrection(id, reviewerId).subscribe({
      next: () => this.loadCorrections(),
      error: () => {},
    });
  }

  reject(id: number): void {
    const reviewerId = this.auth.getUserId()!;
    this.correctionService.rejectCorrection(id, reviewerId).subscribe({
      next: () => this.loadCorrections(),
      error: () => {},
    });
  }
}
