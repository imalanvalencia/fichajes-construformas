import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, PaymentMethod } from '../types/payment.types';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly API = '/api/payments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.API);
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.API}/${id}`);
  }

  getByProject(projectId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.API}/project/${projectId}`);
  }

  getMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.API}/methods`);
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.API, payment);
  }
}
