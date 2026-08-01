import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../types/client.types';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly API = '/api/clients';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.API);
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API}/${id}`);
  }

  search(name: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API}/search`, { params: { name } });
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.API, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.API}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
