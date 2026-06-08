import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CorrectionService, CorrectionRequest } from '../../core/services/correction.service';
import { ClockEntryService } from '../../core/services/clock-entry.service';
import { AuthService } from '../../core/services/auth.service';
import { Project, ClockEntry } from '../../core/models/clock.models';

@Component({
  selector: 'app-correction-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="border border-steel-grey p-6">
      <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">SOLICITAR CORRECCION</p>

      @if (error()) {
        <p class="text-construction-red text-sm mb-4">{{ error() }}</p>
      }
      @if (success()) {
        <p class="text-green-600 text-sm mb-4">{{ success() }}</p>
      }

      <form (submit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">OBRA</label>
          <select [(ngModel)]="form.projectId" name="projectId" required
            class="w-full border border-steel-grey p-2 bg-white text-nero">
            <option [ngValue]="null">Seleccionar obra...</option>
            @for (p of projects(); track p.id) {
              <option [ngValue]="p.id">{{ p.name }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">TIPO DE FICHAJE</label>
          <select [(ngModel)]="form.originalClockType" name="originalClockType" required
            class="w-full border border-steel-grey p-2 bg-white text-nero">
            <option value="ENTRY">ENTRADA</option>
            <option value="EXIT">SALIDA</option>
          </select>
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">FECHA</label>
          <input type="date" [(ngModel)]="form.correctionDate" name="correctionDate" required
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">HORA CORRECTA</label>
          <input type="time" [(ngModel)]="correctedTimeStr" name="correctedTime" required
            class="w-full border border-steel-grey p-2 bg-white text-nero" />
        </div>

        <div>
          <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">MOTIVO</label>
          <textarea [(ngModel)]="form.reason" name="reason" required rows="3"
            class="w-full border border-steel-grey p-2 bg-white text-nero"
            placeholder="Describe por que necesitas esta correccion..."></textarea>
        </div>

        <button type="submit" [disabled]="loading()"
          class="w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
                 py-3 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
          {{ loading() ? 'ENVIANDO...' : 'ENVIAR SOLICITUD' }}
        </button>
      </form>
    </div>
  `,
})
export class CorrectionFormComponent implements OnInit {
  private correctionService = inject(CorrectionService);
  private clockService = inject(ClockEntryService);
  private auth = inject(AuthService);

  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  correctedTimeStr = '';

  form: Omit<CorrectionRequest, 'correctedTime'> & { correctedTime: string } = {
    userId: 0,
    projectId: null as unknown as number,
    correctionDate: new Date().toISOString().split('T')[0],
    originalClockType: 'ENTRY',
    correctedTime: '',
    reason: '',
  };

  ngOnInit(): void {
    this.form.userId = this.auth.getUserId() || 0;
    this.clockService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: () => this.error.set('Error al cargar obras'),
    });
  }

  onSubmit(): void {
    if (!this.form.projectId || !this.correctedTimeStr) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const [hours, minutes] = this.correctedTimeStr.split(':');
    const dateTime = `${this.form.correctionDate}T${hours}:${minutes}:00`;

    const req: CorrectionRequest = {
      ...this.form,
      correctedTime: dateTime,
    };

    this.correctionService.requestCorrection(req).subscribe({
      next: () => {
        this.success.set('Solicitud enviada correctamente');
        this.loading.set(false);
        this.form.reason = '';
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al enviar solicitud');
        this.loading.set(false);
      },
    });
  }
}
