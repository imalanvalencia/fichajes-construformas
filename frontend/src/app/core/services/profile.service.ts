import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  getProfile(userId: number): Observable<User> {
    return this.http.get<User>(`/api/users/${userId}`);
  }

  updateProfile(userId: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/users/${userId}`, data);
  }

  changePassword(userId: number, req: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`/api/users/${userId}/change-password`, req);
  }
}
