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
  | 'link';

@Component({
  selector: 'app-link',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <ng-template #linkContent>
      @if (icon()) {
        <mat-icon matPrefix [fontIcon]="icon()!" />
      }
      <ng-content />
    </ng-template>

    @if (isStandardVariant) {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         [matButton]="matButtonAppearance"
         [class]="classes">
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'icon') {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         matIconButton
         [class]="classes">
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    } @else if (variant() === 'link') {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         [class]="classes">
        <ng-container *ngTemplateOutlet="linkContent" />
      </a>
    }
  `,
  styleUrls: ['./link.component.css'],
})
export class LinkComponent {
  readonly route = input.required<string>();
  readonly variant = input<LinkVariant>('link');
  readonly icon = input<string | null>(null);

  get isStandardVariant(): boolean {
    return ['text', 'filled', 'elevated', 'outlined', 'tonal'].includes(this.variant());
  }

  get matButtonAppearance(): MatButtonAppearance {
    const map: Record<string, MatButtonAppearance> = {
      text: 'text',
      filled: 'filled',
      elevated: 'elevated',
      outlined: 'outlined',
      tonal: 'tonal',
    };
    return map[this.variant()] ?? 'filled';
  }

  get classes(): string {
    return `btn-${this.variant()}`;
  }
}
