import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClockEntry } from '../models/clock.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);

  getUserEntries(userId: number, start: string, end: string): Observable<ClockEntry[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<ClockEntry[]>(`/api/clock-entries/user/${userId}`, { params });
  }

  getProjectEntries(projectId: number, start: string, end: string): Observable<ClockEntry[]> {
    const params = new HttpParams()
      .set('start', start)
      .set('end', end);
    return this.http.get<ClockEntry[]>(`/api/clock-entries/project/${projectId}`, { params });
  }

  exportToCsv(entries: ClockEntry[], filename: string): void {
    const headers = ['Fecha', 'Hora', 'Obra', 'Tipo', 'Latitud', 'Longitud', 'Notas'];
    const rows = entries.map(e => [
      new Date(e.timestamp).toLocaleDateString('es-ES'),
      new Date(e.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      e.project.name,
      e.clockType === 'ENTRY' ? 'Entrada' : 'Salida',
      e.userLatitude.toString(),
      e.userLongitude.toString(),
      e.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
