import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClockEntryComponent } from './clock-entry.component';
import { ClockHistoryComponent } from './clock-history.component';
import { CorrectionFormComponent } from './correction-form.component';
import { ProfileComponent } from './profile.component';
import { ReportComponent } from './report.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ClockEntryComponent, ClockHistoryComponent, CorrectionFormComponent, ProfileComponent, ReportComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.currentUser;
  showProfile = signal(false);
  showReport = signal(false);

  toggleProfile(): void {
    this.showProfile.set(!this.showProfile());
    this.showReport.set(false);
  }

  toggleReport(): void {
    this.showReport.set(!this.showReport());
    this.showProfile.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
