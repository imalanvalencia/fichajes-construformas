import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../types/user.types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = '/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API}/${id}`);
  }

  getByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/role/${role}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.API, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.API}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
