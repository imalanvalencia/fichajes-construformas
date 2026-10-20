import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClockCorrection } from '../types/clock.types';

@Injectable({ providedIn: 'root' })
export class ClockCorrectionService {
  private readonly API = '/api/clock-corrections';

  private http = inject(HttpClient);

  /** ADMIN-only: pending corrections awaiting a decision. */
  getPending(): Observable<ClockCorrection[]> {
    return this.http.get<ClockCorrection[]>(`${this.API}/pending`);
  }

  getByUser(userId: number): Observable<ClockCorrection[]> {
    return this.http.get<ClockCorrection[]>(`${this.API}/user/${userId}`);
  }

  request(correction: ClockCorrection): Observable<ClockCorrection> {
    return this.http.post<ClockCorrection>(this.API, correction);
  }

  /** The reviewer comes from the session; no reviewerId is ever sent. */
  approve(id: number): Observable<ClockCorrection> {
    return this.http.put<ClockCorrection>(`${this.API}/${id}/approve`, {});
  }

  reject(id: number): Observable<ClockCorrection> {
    return this.http.put<ClockCorrection>(`${this.API}/${id}/reject`, {});
  }
}
