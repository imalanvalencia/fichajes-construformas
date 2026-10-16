import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Wraps the browser Geolocation API as an Observable so the clock feature can
 * treat "no location" as an error path instead of falling back to coordinates.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getPosition(): Observable<GeolocationPosition> {
    return new Observable<GeolocationPosition>((subscriber) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        subscriber.error(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          subscriber.next(position);
          subscriber.complete();
        },
        (error) => subscriber.error(new Error(error.message || 'Location permission denied')),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }
}
