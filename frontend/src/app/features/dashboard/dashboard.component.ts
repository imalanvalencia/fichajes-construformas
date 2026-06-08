import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClockEntryComponent } from './clock-entry.component';
import { ClockHistoryComponent } from './clock-history.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ClockEntryComponent, ClockHistoryComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
