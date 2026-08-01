import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClockEntry } from '../types/clock.types';

@Injectable({ providedIn: 'root' })
export class ClockEntryService {
  private readonly API = '/api/clock-entries';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<ClockEntry> {
    return this.http.get<ClockEntry>(`${this.API}/${id}`);
  }

  getByUser(userId: number, start: string, end: string): Observable<ClockEntry[]> {
    return this.http.get<ClockEntry[]>(`${this.API}/user/${userId}`, {
      params: { start, end },
    });
  }

  register(entry: ClockEntry): Observable<ClockEntry> {
    return this.http.post<ClockEntry>(this.API, entry);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
