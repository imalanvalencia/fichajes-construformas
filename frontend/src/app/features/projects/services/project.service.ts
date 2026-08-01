import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectFinancialSummary } from '../types/project.types';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly API = '/api/projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.API);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.API}/${id}`);
  }

  getByClient(clientId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.API}/client/${clientId}`);
  }

  getFinancialSummary(id: number): Observable<ProjectFinancialSummary> {
    return this.http.get<ProjectFinancialSummary>(`${this.API}/${id}/financial-summary`);
  }

  create(project: Project): Observable<Project> {
    return this.http.post<Project>(this.API, project);
  }

  update(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.API}/${id}`, project);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
