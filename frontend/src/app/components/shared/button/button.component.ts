import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';

export type ButtonVariant =
  | 'text'
  | 'filled'
  | 'elevated'
  | 'outlined'
  | 'tonal'
  | 'icon'
  | 'fab'
  | 'miniFab'
  | 'fabExtended';

@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet, MatIconModule, MatButtonModule, MatStepperModule],
  template: `
    <ng-template #buttonContent>
      @if (icon()) {
        <mat-icon iconPositionEnd>{{ icon()! }}</mat-icon>
      }
      <ng-content />
    </ng-template>

    @if (isStandardVariant) {
      <button
        [matButton]="matAppearance"
        [disabled]="disabled()"
        [class]="classes"
        (click)="handleStepperAction()"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'icon') {
      <button
        matIconButton
        [disabled]="disabled()"
        [class]="classes"
        (click)="handleStepperAction()"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'fab') {
      <button
        matFab
        [disabled]="disabled()"
        [class]="classes"
        (click)="handleStepperAction()"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'miniFab') {
      <button
        matMiniFab
        [disabled]="disabled()"
        [class]="classes"
        (click)="handleStepperAction()"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'fabExtended') {
      <button
        matFab
        extended
        [disabled]="disabled()"
        [class]="classes"
        (click)="handleStepperAction()"
      >
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    }
  `,
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  readonly icon = input<string | null>(null);
  readonly variant = input<ButtonVariant>('filled');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input<boolean>(false);

  // Inputs para manejar el stepper dinámicamente
  readonly stepper = input<MatStepper | null>(null);
  readonly stepperAction = input<'next' | 'previous' | null>(null);

  get isStandardVariant(): boolean {
    return ['text', 'filled', 'elevated', 'outlined', 'tonal'].includes(this.variant());
  }

  get matAppearance(): MatButtonAppearance {
    return this.variant() as MatButtonAppearance;
  }

  get classes(): string {
    return `btn btn-${this.variant()} btn-${this.size()}`;
  }

  handleStepperAction(): void {
    const st = this.stepper();
    const action = this.stepperAction();
    if (!st || !action) return;

    if (action === 'next') st.next();
    if (action === 'previous') st.previous();
  }
}
