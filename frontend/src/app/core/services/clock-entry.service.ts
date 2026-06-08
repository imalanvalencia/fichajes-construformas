import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ClockEntryRequest, ClockEntry } from '../models/clock.models';

@Injectable({ providedIn: 'root' })
export class ClockEntryService {
  private http = inject(HttpClient);

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('/api/projects');
  }

  registerClockEntry(req: ClockEntryRequest): Observable<ClockEntry> {
    return this.http.post<ClockEntry>('/api/clock-entries', req);
  }

  getUserEntries(userId: number, start: string, end: string): Observable<ClockEntry[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<ClockEntry[]>(`/api/clock-entries/user/${userId}`, { params });
  }
}
