import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserAvailability, Role } from '../types/user.types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = '/api/users';

  private http = inject(HttpClient);

  /** ADMIN only. The payload never carries `password` — it is write-only server-side. */
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.API, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, user);
  }

  /**
   * Availability has its own endpoint: `UserService.update()` on the backend does not
   * read it from the PUT body, so sending it there is silently ignored.
   */
  updateAvailability(id: number, availability: UserAvailability): Observable<UserAvailability> {
    return this.http.put<UserAvailability>(`${this.API}/${id}/availability`, JSON.stringify(availability), {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /**
   * Role catalog from GET /api/roles (ADMIN only). The many-to-many `roles` payload
   * needs real ids, and this is the only way to obtain them.
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('/api/roles');
  }
}
