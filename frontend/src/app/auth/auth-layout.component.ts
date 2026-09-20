import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-cement">
      <div class="w-full max-w-md">
        <!-- Branding -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-nero mb-4">
            <span class="text-white text-2xl font-bold font-sans">C</span>
          </div>
          <h1 class="text-2xl font-bold text-nero font-sans">ConstruFormas</h1>
          <p class="text-sm text-steel font-mono">ERP System</p>
        </div>

        <!-- Card Content -->
        <div class="bg-white border border-steel p-8">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
