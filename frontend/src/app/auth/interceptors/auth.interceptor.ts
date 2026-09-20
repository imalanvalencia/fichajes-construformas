import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, catchError, throwError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshQueue: Array<{
  next: (token: string) => void;
  error: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(promise => {
    if (token) {
      promise.next(token);
    } else {
      promise.error(error);
    }
  });
  refreshQueue = [];
}

const EXCLUDED_URLS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip header for excluded endpoints
  const isExcluded = EXCLUDED_URLS.some(url => req.url.includes(url));
  if (isExcluded) {
    return next(req);
  }

  // Only add header to /api requests
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        return throwError(() => error);
      }

      if (isRefreshing) {
        return new Observable<string>(subscriber => {
          refreshQueue.push({
            next: (newToken: string) => subscriber.next(newToken),
            error: (err: unknown) => subscriber.error(err),
          });
        }).pipe(
          switchMap(newToken => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          }),
        );
      }

      isRefreshing = true;

      return authService.refresh(refreshToken).pipe(
        switchMap(response => {
          isRefreshing = false;
          processQueue(null, response.accessToken);

          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` },
          });
          return next(retryReq);
        }),
        catchError(refreshError => {
          isRefreshing = false;
          processQueue(refreshError, null);
          authService.logout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
