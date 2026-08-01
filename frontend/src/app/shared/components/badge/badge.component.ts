import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span [class]="badgeClasses">{{ status }}</span>
  `,
  styles: `:host { display: inline-block; }`
})
export class BadgeComponent {
  @Input() status = '';

  get badgeClasses(): string {
    const base = 'font-mono text-[10px] font-medium uppercase px-2 py-0.5';
    const colorMap: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      INACTIVE: 'bg-gray-100 text-gray-500',
      DRAFT: 'bg-gray-100 text-gray-500',
      SENT: 'bg-blue-100 text-blue-700',
      ISSUED: 'bg-blue-100 text-blue-700',
      PLANNED: 'bg-gray-100 text-gray-500',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      REJECTED: 'bg-red-100 text-red-700',
      EXPIRED: 'bg-orange-100 text-orange-700',
      SUPERSEDED: 'bg-purple-100 text-purple-700',
      PAID: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-red-100 text-red-700',
      ADMIN: 'bg-purple-100 text-purple-700',
      OPERATOR: 'bg-blue-100 text-blue-700',
      MANAGER: 'bg-orange-100 text-orange-700',
    };
    const color = colorMap[this.status?.toUpperCase()] ?? 'bg-gray-100 text-gray-500';
    return `${base} ${color}`;
  }
}
