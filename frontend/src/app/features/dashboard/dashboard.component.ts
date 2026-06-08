import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClockEntryComponent } from './clock-entry.component';
import { ClockHistoryComponent } from './clock-history.component';
import { CorrectionFormComponent } from './correction-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ClockEntryComponent, ClockHistoryComponent, CorrectionFormComponent],
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
