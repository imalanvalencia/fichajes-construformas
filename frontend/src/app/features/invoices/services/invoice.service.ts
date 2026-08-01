import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceItem, RectifyingInvoice } from '../types/invoice.types';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly API = '/api/invoices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.API);
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.API}/${id}`);
  }

  getByProject(projectId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.API}/project/${projectId}`);
  }

  create(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.API, invoice);
  }

  update(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.API}/${id}`, invoice);
  }

  issue(id: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.API}/${id}/issue`, {});
  }

  addItem(id: number, item: InvoiceItem): Observable<InvoiceItem> {
    return this.http.post<InvoiceItem>(`${this.API}/${id}/items`, item);
  }

  rectify(id: number, rectifying: RectifyingInvoice, userId: number): Observable<RectifyingInvoice> {
    return this.http.post<RectifyingInvoice>(`${this.API}/${id}/rectify?userId=${userId}`, rectifying);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
