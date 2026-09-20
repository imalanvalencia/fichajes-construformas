import { Component, input } from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';

export type LinkVariant =
  | 'text'
  | 'filled'
  | 'elevated'
  | 'outlined'
  | 'tonal'
  | 'icon'
  | 'none'
  | 'fab'
  | 'miniFab'
  | 'fabExtended'
  | 'link';

@Component({
  selector: 'app-link',

  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],

  template: `
    <ng-template #linkContent>
      @if (icon()) {
        <mat-icon fontSet="material-icons-outlined">{{ icon() }}</mat-icon>
      }

      <ng-content />
    </ng-template>

    @if (isStandardVariant) {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        [matButton]="matButtonAppearance"
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'icon') {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        matIconButton
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'link') {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'fab') {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        matFab
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'miniFab') {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        matMiniFab
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'fabExtended') {
      <a
        [routerLink]="route()"
        [routerLinkActive]="activeClasses()"
        [routerLinkActiveOptions]="{ exact: route() === '/' }"
        matFab
        extended
        [class]="classes"
      >
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    }
  `,

  styles: `
    @import 'tailwindcss';

    @import '../../../app.css';

    :host {
      @apply inline-flex! items-center;
    }

    a {
      @apply inline-flex! items-center! gap-2;
    }

    mat-icon {
      @apply align-middle;
    }

    .link-filled {
      @apply hover:bg-accent;
    }

    .link-link {
      @apply text-accent hover:underline;
    }

    .link-tonal {
      @apply bg-primary/70! hover:bg-steel;
    }
  `,
})
export class LinkComponent {
  readonly route = input.required<string>();

  readonly variant = input<LinkVariant>('link');

  readonly icon = input<string | null>(null);

  readonly hostClasses = input<string>('');

  readonly activeClasses = input<string>('');

  get isStandardVariant(): boolean {
    return ['text', 'filled', 'elevated', 'outlined', 'tonal'].includes(this.variant());
  }

  get matButtonAppearance(): MatButtonAppearance {
    if (!this.isStandardVariant) {
      throw new Error(`Invalid variant for matButton: ${this.variant()}`);
    }

    return this.variant() as MatButtonAppearance;
  }

  get classes(): string {
    return `link-${this.variant()} ${this.hostClasses()}`.trim();
  }
}
