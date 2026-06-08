import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CorrectionRequest {
  userId: number;
  projectId: number;
  originalEntryId?: number;
  correctionDate: string;
  originalClockType: 'ENTRY' | 'EXIT';
  correctedTime: string;
  reason: string;
}

export interface Correction {
  id: number;
  user: { id: number; name: string; email: string };
  project: { id: number; name: string };
  originalEntry?: { id: number; timestamp: string };
  correctionDate: string;
  originalClockType: 'ENTRY' | 'EXIT';
  correctedTime: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: { id: number; name: string };
  reviewedAt?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CorrectionService {
  private http = inject(HttpClient);

  requestCorrection(req: CorrectionRequest): Observable<Correction> {
    return this.http.post<Correction>('/api/clock-corrections', req);
  }

  getUserCorrections(userId: number): Observable<Correction[]> {
    return this.http.get<Correction[]>(`/api/clock-corrections/user/${userId}`);
  }

  getPendingCorrections(): Observable<Correction[]> {
    return this.http.get<Correction[]>('/api/clock-corrections/pending');
  }

  approveCorrection(id: number, reviewerId: number): Observable<Correction> {
    return this.http.put<Correction>(
      `/api/clock-corrections/${id}/approve?reviewerId=${reviewerId}`, {}
    );
  }

  rejectCorrection(id: number, reviewerId: number): Observable<Correction> {
    return this.http.put<Correction>(
      `/api/clock-corrections/${id}/reject?reviewerId=${reviewerId}`, {}
    );
  }
}
