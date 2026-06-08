import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService, ChangePasswordRequest } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="max-w-xl space-y-8">
      <div class="border border-steel-grey p-6">
        <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">MI PERFIL</p>

        @if (profileError()) {
          <p class="text-construction-red text-sm mb-4">{{ profileError() }}</p>
        }
        @if (profileSuccess()) {
          <p class="text-green-600 text-sm mb-4">{{ profileSuccess() }}</p>
        }

        <form (submit)="onUpdateProfile()" class="space-y-4">
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">NOMBRE</label>
            <input type="text" [(ngModel)]="profileForm.name" name="name" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">EMAIL</label>
            <input type="email" [value]="profileForm.email" disabled
              class="w-full border border-steel-grey p-2 bg-cement-grey text-nero" />
          </div>

          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">TELEFONO</label>
            <input type="tel" [(ngModel)]="profileForm.phone" name="phone"
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">NIE</label>
            <input type="text" [(ngModel)]="profileForm.nie" name="nie"
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <button type="submit" [disabled]="loadingProfile()"
            class="w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
                   py-3 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
            {{ loadingProfile() ? 'GUARDANDO...' : 'GUARDAR CAMBIOS' }}
          </button>
        </form>
      </div>

      <div class="border border-steel-grey p-6">
        <p class="font-mono text-xs tracking-widest text-steel-grey mb-4">CAMBIAR CONTRASEÑA</p>

        @if (passwordError()) {
          <p class="text-construction-red text-sm mb-4">{{ passwordError() }}</p>
        }
        @if (passwordSuccess()) {
          <p class="text-green-600 text-sm mb-4">{{ passwordSuccess() }}</p>
        }

        <form (submit)="onChangePassword()" class="space-y-4">
          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">CONTRASEÑA ACTUAL</label>
            <input type="password" [(ngModel)]="passwordForm.currentPassword" name="currentPassword" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">NUEVA CONTRASEÑA</label>
            <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword" required minlength="6"
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <div>
            <label class="block font-mono text-xs tracking-widest text-steel-grey mb-1">CONFIRMAR NUEVA CONTRASEÑA</label>
            <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required
              class="w-full border border-steel-grey p-2 bg-white text-nero" />
          </div>

          <button type="submit" [disabled]="loadingPassword()"
            class="w-full bg-nero text-cement-grey font-mono text-xs tracking-widest
                   py-3 hover:bg-steel-grey disabled:opacity-50 cursor-pointer">
            {{ loadingPassword() ? 'CAMBIANDO...' : 'CAMBIAR CONTRASEÑA' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);

  profileForm = { name: '', email: '', phone: '', nie: '' };
  passwordForm: ChangePasswordRequest = { currentPassword: '', newPassword: '' };
  confirmPassword = '';

  loadingProfile = signal(false);
  loadingPassword = signal(false);
  profileError = signal<string | null>(null);
  profileSuccess = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.profileService.getProfile(userId).subscribe({
      next: (user) => {
        this.profileForm = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          nie: user.nie || '',
        };
      },
      error: () => this.profileError.set('Error al cargar perfil'),
    });
  }

  onUpdateProfile(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.loadingProfile.set(true);
    this.profileError.set(null);
    this.profileSuccess.set(null);

    this.profileService.updateProfile(userId, {
      name: this.profileForm.name,
      phone: this.profileForm.phone || undefined,
      nie: this.profileForm.nie || undefined,
      active: true,
    }).subscribe({
      next: () => {
        this.profileSuccess.set('Perfil actualizado');
        this.loadingProfile.set(false);
      },
      error: (err) => {
        this.profileError.set(err.error?.message || 'Error al actualizar');
        this.loadingProfile.set(false);
      },
    });
  }

  onChangePassword(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    if (this.passwordForm.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas no coinciden');
      return;
    }

    this.loadingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSuccess.set(null);

    this.profileService.changePassword(userId, this.passwordForm).subscribe({
      next: () => {
        this.passwordSuccess.set('Contraseña cambiada correctamente');
        this.passwordForm = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';
        this.loadingPassword.set(false);
      },
      error: (err) => {
        this.passwordError.set(err.error?.message || 'Error al cambiar contraseña');
        this.loadingPassword.set(false);
      },
    });
  }
}
