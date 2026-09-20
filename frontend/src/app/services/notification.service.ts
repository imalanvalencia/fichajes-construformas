import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.open(message, 'polite', 'notification-success');
  }

  error(message: string): void {
    this.open(message, 'assertive', 'notification-error');
  }

  private open(message: string, politeness: 'polite' | 'assertive', panelClass: string): void {
    this.snackBar.open(message, undefined, {
      duration: 5000,
      announcementMessage: message,
      politeness,
      panelClass,
    });
  }
}
