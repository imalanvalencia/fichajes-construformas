import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetItem } from '../types/budget.types';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly API = '/api/budgets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.API);
  }

  getById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.API}/${id}`);
  }

  getByProject(projectId: number): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.API}/project/${projectId}`);
  }

  create(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.API, budget);
  }

  createNewVersion(id: number, userId: number): Observable<Budget> {
    return this.http.post<Budget>(`${this.API}/${id}/new-version?userId=${userId}`, {});
  }

  approve(id: number, userId: number): Observable<Budget> {
    return this.http.post<Budget>(`${this.API}/${id}/approve?userId=${userId}`, {});
  }

  addItem(id: number, item: BudgetItem): Observable<BudgetItem> {
    return this.http.post<BudgetItem>(`${this.API}/${id}/items`, item);
  }

  getItems(id: number): Observable<BudgetItem[]> {
    return this.http.get<BudgetItem[]>(`${this.API}/${id}/items`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
