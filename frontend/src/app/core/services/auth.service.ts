import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, AuthResponse, User } from '../models/auth.models';

const STORAGE_KEY = 'cf_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userSignal = signal<User | null>(this.loadStored());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.userSignal());

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', req)
      .pipe(tap(res => {
        this.userSignal.set({ userId: res.userId, email: res.email, role: res.role });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
      }));
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  getToken(): string | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse).token : null;
  }

  getUserId(): number | null {
    const user = this.userSignal();
    return user ? user.userId : null;
  }

  private loadStored(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const res = JSON.parse(raw) as AuthResponse;
    return { userId: res.userId, email: res.email, role: res.role };
  }
}
