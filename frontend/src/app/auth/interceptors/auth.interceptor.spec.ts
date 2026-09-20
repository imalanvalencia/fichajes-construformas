import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpRequest, HttpHandlerFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let authService: {
    getToken: ReturnType<typeof vi.fn>;
    getRefreshToken: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsiQ09OU1RSVUNUT1IiXSwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.signature';
  const mockRefreshToken = 'refresh-token-123';

  beforeEach(() => {
    authService = {
      getToken: vi.fn().mockReturnValue(mockToken),
      getRefreshToken: vi.fn().mockReturnValue(mockRefreshToken),
      refresh: vi.fn().mockReturnValue(of({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        email: 'test@example.com',
        roles: ['CONSTRUCTOR'],
        name: 'Test User',
      })),
      logout: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('should add Authorization header to /api requests', () => {
    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('GET', '/api/users');
      const next: HttpHandlerFn = (r) => {
        expect(r.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
        return of(new HttpResponse({ status: 200 }));
      };

      authInterceptor(req, next).subscribe();
    });
  });

  it('should not add Authorization header when no token', () => {
    authService.getToken.mockReturnValue(null);

    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('GET', '/api/users');
      const next: HttpHandlerFn = (r) => {
        expect(r.headers.has('Authorization')).toBe(false);
        return of(new HttpResponse({ status: 200 }));
      };

      authInterceptor(req, next).subscribe();
    });
  });

  it('should not add header to login endpoint', () => {
    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('POST', '/api/auth/login', {});
      const next: HttpHandlerFn = (r) => {
        expect(r.headers.has('Authorization')).toBe(false);
        return of(new HttpResponse({ status: 200 }));
      };

      authInterceptor(req, next).subscribe();
    });
  });

  it('should not add header to refresh endpoint', () => {
    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('POST', '/api/auth/refresh', {});
      const next: HttpHandlerFn = (r) => {
        expect(r.headers.has('Authorization')).toBe(false);
        return of(new HttpResponse({ status: 200 }));
      };

      authInterceptor(req, next).subscribe();
    });
  });

  it('should not add header to non-/api requests', () => {
    TestBed.runInInjectionContext(() => {
      const req = new HttpRequest('GET', 'https://external-api.com/data');
      const next: HttpHandlerFn = (r) => {
        expect(r.headers.has('Authorization')).toBe(false);
        return of(new HttpResponse({ status: 200 }));
      };

      authInterceptor(req, next).subscribe();
    });
  });

  describe('401 handling', () => {
    it('should attempt token refresh on 401 and retry request', () => {
      TestBed.runInInjectionContext(() => {
        let callCount = 0;
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = (r) => {
          callCount++;
          if (callCount === 1) {
            // First call returns 401
            return throwError(() => new HttpErrorResponse({ status: 401 }));
          }
          // Retry should have new token
          expect(r.headers.get('Authorization')).toBe('Bearer new-access-token');
          return of(new HttpResponse({ status: 200, body: { data: 'ok' } }));
        };

        authInterceptor(req, next).subscribe({
          next: (event) => {
            if (event instanceof HttpResponse) {
              expect(event.body).toEqual({ data: 'ok' });
            }
          },
        });

        expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
      });
    });

    it('should call logout when refresh fails', () => {
      authService.refresh.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

      TestBed.runInInjectionContext(() => {
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () => {
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        };

        authInterceptor(req, next).subscribe({
          error: () => {},
        });

        expect(authService.logout).toHaveBeenCalled();
      });
    });

    it('should call logout when no refresh token available', () => {
      authService.getRefreshToken.mockReturnValue(null);

      TestBed.runInInjectionContext(() => {
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () => {
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        };

        authInterceptor(req, next).subscribe({
          error: () => {},
        });

        expect(authService.logout).toHaveBeenCalled();
      });
    });

    it('should not refresh on non-401 errors', () => {
      TestBed.runInInjectionContext(() => {
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () => {
          return throwError(() => new HttpErrorResponse({ status: 500 }));
        };

        authInterceptor(req, next).subscribe({
          error: (err) => {
            expect(err.status).toBe(500);
          },
        });

        expect(authService.refresh).not.toHaveBeenCalled();
      });
    });
  });
});
