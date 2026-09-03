import { Component, ContentChild, input, TemplateRef } from '@angular/core';
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
    @if (isStandardVariant) {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         [matButton]="matAppearance"
         [class]="classes">
        @if (icon()) { <mat-icon matPrefix [fontIcon]="icon()!" /> }
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else if (variant() === 'icon') {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         matIconButton
         [class]="classes">
        @if (icon()) { <mat-icon [fontIcon]="icon()!" /> }
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else if (variant() === 'link') {
      <a [routerLink]="route()"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: route() === '/' }"
         [class]="classes">
        @if (icon()) { <mat-icon matPrefix [fontIcon]="icon()!" /> }
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    }
  `,
  styleUrls: ['./link.component.css'],
})
export class LinkComponent {
  @ContentChild('content', { read: TemplateRef }) content!: TemplateRef<unknown>;

  route = input.required<string>();
  variant = input<LinkVariant>('link');
  icon = input<string | null>(null);

  get isStandardVariant(): boolean {
    return ['text', 'filled', 'elevated', 'outlined', 'tonal'].includes(this.variant());
  }

  get matAppearance(): MatButtonAppearance {
    return this.variant() as MatButtonAppearance;
  }

  get classes(): string {
    return `btn-${this.variant()}`;
  }
}
