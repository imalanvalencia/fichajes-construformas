import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';

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
  imports: [NgTemplateOutlet, MatIconModule, MatButtonModule],
  template: `
    <ng-template #buttonContent>
      @if (icon()) {
        <mat-icon fontSet="material-icons-outlined">{{ icon()! }}</mat-icon>
      }
      <ng-content />
    </ng-template>

    @if (isStandardVariant) {
      <button [matButton]="matAppearance" [disabled]="disabled()" [class]="classes">
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'icon') {
      <button matIconButton [disabled]="disabled()" [class]="classes">
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'fab') {
      <button matFab [disabled]="disabled()" [class]="classes">
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'miniFab') {
      <button matMiniFab [disabled]="disabled()" [class]="classes">
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    } @else if (variant() === 'fabExtended') {
      <button matFab extended [disabled]="disabled()" [class]="classes">
        <ng-container *ngTemplateOutlet="buttonContent" />
      </button>
    }
  `,
  styles: `
    @import 'tailwindcss';
    @import '../../../app.css';

    :host {
      @apply inline-flex! items-center;
    }

    button,
    a {
      @apply inline-flex! items-center! gap-4!;
    }

    mat-icon {
      @apply align-middle;
    }

    .btn-filled {
      @apply hover:bg-accent;
    }

    .btn-tonal {
      @apply bg-primary/70! hover:bg-steel;
    }
  `,
})
export class ButtonComponent {
  readonly icon = input<string | null>(null);
  readonly variant = input<ButtonVariant>('filled');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input<boolean>(false);
  readonly hostClasses = input<string>('');

  get isStandardVariant(): boolean {
    return ['text', 'filled', 'elevated', 'outlined', 'tonal'].includes(this.variant());
  }

  get matAppearance(): MatButtonAppearance {
    if (!this.isStandardVariant) {
      throw new Error(`Invalid variant for matButton: ${this.variant()}`);
    }
    return this.variant() as MatButtonAppearance;
  }

  get classes(): string {
    return `btn-${this.variant()} btn-${this.size()} ${this.hostClasses()}`.trim();
  }
}
