import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Budget } from '../../../features/budgets/types/budget.types';
import { Project } from '../../../features/projects/types/project.types';
import { ButtonComponent } from '../../shared/button/button.component';
import { SelectOrCreateComponent } from '../../shared/select-or-create/select-or-create.component';
import { MatStepperModule } from '@angular/material/stepper';

const DEFAULT_NOTES = [
  'Plazo de ejecución: A determinar tras la firma del contrato.',
  'Garantía: Conforme a la legislación vigente una vez finalizados y entregados los trabajos.',
  'Validez: Durante: 30 días.',
];

@Component({
  selector: 'app-create-budget-modal',
  standalone: true,
  imports: [FormsModule, ButtonComponent, SelectOrCreateComponent, MatStepperModule],
  templateUrl: './create-budget-modal.component.html',
})
export class CreateBudgetModalComponent {
  show = input(false);
  projects = input<Project[]>([]);
  form = input<Partial<Budget>>({});

  onClose = output<void>();
  onCreate = output<void>();
  onCreateProject = output<string>();
  formChange = output<Partial<Budget>>();

  private currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });

  paymentAgreement = computed(() => {
    const amount = this.form().finalAmount ?? 0;

    if (amount <= 0) {
      return 'El acuerdo de pago se generará cuando el presupuesto tenga un monto definido.';
    }

    const includesMaterials = this.form().includesMaterials ?? false;
    const includesIva = this.form().includesIva ?? false;

    const fmt = (v: number) => this.currencyFormatter.format(v);
    const ivaText = includesIva ? 'con IVA incluido' : 'sin IVA';
    const materialsText = includesMaterials
      ? 'y los costes de los materiales incluidos'
      : '';

    const first = amount * 0.5;
    const second = amount * 0.25;
    const third = amount * 0.25;

    return (
      `El presupuesto total de la obra asciende a ${fmt(amount)} (${ivaText}), ` +
      `un precio que corresponde exclusivamente a la mano de obra ${materialsText}.\n` +
      `El calendario de pagos se estructura de la siguiente manera, y está sujeto al avance de los trabajos:\n` +
      `Primer pago: 50% del total (${fmt(first)}), al inicio de los trabajos.\n` +
      `Segundo pago: 25% del total (${fmt(second)}), a la finalización de la primera fase de la obra.\n` +
      `Tercer pago: el 25% restante (${fmt(third)}), a la completa finalización y entrega de la obra.\n` +
      `El acuerdo de pagos está sujeto al avance de los trabajos.`
    );
  });

  updateField(field: keyof Budget, value: unknown): void {
    this.formChange.emit({ [field]: value });
  }

  notesList = signal<string[]>([...DEFAULT_NOTES]);
  defaultNotesCount = DEFAULT_NOTES.length;

  updateNote(index: number, value: string): void {
    this.notesList.update(notes => {
      const updated = [...notes];
      updated[index] = value;
      return updated;
    });
    this.syncNotes();
  }

  addNote(): void {
    this.notesList.update(notes => [...notes, '']);
  }

  removeNote(index: number): void {
    this.notesList.update(notes => notes.filter((_, i) => i !== index));
    this.syncNotes();
  }

  private syncNotes(): void {
    const joined = this.notesList().filter(n => n.trim()).join('\n');
    this.updateField('notes', joined);
  }
}
