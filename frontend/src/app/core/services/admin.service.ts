import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/auth.models';
import { Project } from '../models/clock.models';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nie?: string;
  role: 'ADMIN' | 'OPERATOR';
}

export interface UpdateUserRequest {
  name: string;
  phone?: string;
  nie?: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  createUser(req: CreateUserRequest): Observable<User> {
    return this.http.post<User>('/api/users', req);
  }

  updateUser(id: number, req: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, req);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }

  // Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('/api/projects');
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`/api/projects/${id}`);
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>('/api/projects', project);
  }

  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`/api/projects/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`/api/projects/${id}`);
  }
}
