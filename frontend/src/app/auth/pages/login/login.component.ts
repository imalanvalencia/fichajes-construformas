import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../../../components/shared/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-cement">
      <div class="w-full max-w-md bg-white border border-steel p-8">
        <!-- Branding -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-nero font-sans">ConstruFormas</h1>
          <p class="text-sm text-steel mt-1 font-mono">ERP System</p>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-steel mb-6">
          <button
            type="button"
            class="flex-1 py-2 text-sm font-mono transition-colors"
            [class]="activeTab() === 'email'
              ? 'border-b-2 border-accent text-nero'
              : 'text-steel hover:text-nero'"
            (click)="activeTab.set('email')">
            Email
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-sm font-mono transition-colors"
            [class]="activeTab() === 'nie'
              ? 'border-b-2 border-accent text-nero'
              : 'text-steel hover:text-nero'"
            (click)="activeTab.set('nie')">
            DNI/NIE
          </button>
        </div>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-50 border border-accent text-accent text-sm">
            {{ errorMessage() }}
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()">
          <!-- Email Tab -->
          @if (activeTab() === 'email') {
            <div class="mb-4">
              <app-input
                type="email"
                [(ngModel)]="email"
                name="email"
                label="Email"
                placeholder="you&#64;company.com"
                [required]="true"
              />
            </div>
          }

          <!-- NIE Tab -->
          @if (activeTab() === 'nie') {
            <div class="mb-4">
              <app-input
                type="text"
                [(ngModel)]="nie"
                name="nie"
                label="DNI/NIE"
                placeholder="12345678Z"
                [required]="true"
              />
            </div>
          }

          <!-- Password -->
          <div class="mb-6">
            <app-input
              type="password"
              [(ngModel)]="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              [required]="true"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full py-3 bg-nero text-white text-sm font-mono hover:bg-accent transition-none disabled:opacity-50">
            @if (isLoading()) {
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  activeTab = signal<'email' | 'nie'>('email');
  email = '';
  nie = '';
  password = '';
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const request = this.activeTab() === 'email'
      ? { email: this.email, password: this.password }
      : { nie: this.nie, password: this.password };

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Invalid credentials. Please try again.'
        );
      },
    });
  }
}
