import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../types/supplier.types';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly API = '/api/suppliers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.API);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.API}/${id}`);
  }

  search(name: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.API}/search`, { params: { name } });
  }

  create(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.API, supplier);
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.API}/${id}`, supplier);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
