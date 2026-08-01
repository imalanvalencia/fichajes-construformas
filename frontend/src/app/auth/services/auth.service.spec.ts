import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../types/auth.types';

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse: AuthResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZXMiOlsiQ09OU1RSVUNUT1IiXSwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.signature',
    refreshToken: 'refresh-token-123',
    email: 'test@example.com',
    roles: ['CONSTRUCTOR'],
    name: 'Test User',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call POST /api/auth/login with email credentials', () => {
      service.login({ email: 'test@example.com', password: 'pass123' }).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'pass123' });
      req.flush(mockAuthResponse);
    });

    it('should call POST /api/auth/login with NIE credentials', () => {
      service.login({ nie: '12345678Z', password: 'pass123' }).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.body).toEqual({ nie: '12345678Z', password: 'pass123' });
      req.flush(mockAuthResponse);
    });

    it('should store tokens in localStorage on success', () => {
      service.login({ email: 'test@example.com', password: 'pass123' }).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('access_token')).toBe(mockAuthResponse.accessToken);
      expect(localStorage.getItem('refresh_token')).toBe(mockAuthResponse.refreshToken);
      expect(localStorage.getItem('user_data')).toBe(JSON.stringify(mockAuthResponse));
    });
  });

  describe('refresh', () => {
    it('should call POST /api/auth/refresh with refresh token', () => {
      service.refresh('refresh-token-123').subscribe();

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token-123' });
      req.flush(mockAuthResponse);
    });

    it('should update stored tokens on refresh', () => {
      const newResponse: AuthResponse = {
        ...mockAuthResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      service.refresh('old-refresh-token').subscribe();

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush(newResponse);

      expect(localStorage.getItem('access_token')).toBe('new-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
    });
  });

  describe('logout', () => {
    it('should clear tokens from localStorage', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('refresh_token', 'refresh');
      localStorage.setItem('user_data', '{}');

      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      req.flush({});

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });

    it('should call POST /api/auth/logout with refresh token', () => {
      localStorage.setItem('refresh_token', 'refresh-token-123');

      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token-123' });
      req.flush({});
    });
  });

  describe('getToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return access token from localStorage', () => {
      localStorage.setItem('access_token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return refresh token from localStorage', () => {
      localStorage.setItem('refresh_token', 'my-refresh');
      expect(service.getRefreshToken()).toBe('my-refresh');
    });
  });

  describe('getUser', () => {
    it('should return null when no user data stored', () => {
      expect(service.getUser()).toBeNull();
    });

    it('should return parsed user from localStorage', () => {
      localStorage.setItem('user_data', JSON.stringify(mockAuthResponse));
      const user = service.getUser();
      expect(user).toEqual(mockAuthResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token stored', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      localStorage.setItem('access_token', mockAuthResponse.accessToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.signature';
      localStorage.setItem('access_token', expiredToken);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false when token is not expired', () => {
      localStorage.setItem('access_token', mockAuthResponse.accessToken);
      expect(service.isTokenExpired()).toBe(false);
    });

    it('should return true when token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.signature';
      localStorage.setItem('access_token', expiredToken);
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true for malformed token', () => {
      localStorage.setItem('access_token', 'not-a-jwt-token');
      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return null for malformed JSON in user_data', () => {
      localStorage.setItem('user_data', '{invalid-json');
      expect(service.getUser()).toBeNull();
    });
  });

  describe('login error handling', () => {
    it('should propagate HTTP errors from login', () => {
      let errorCaught = false;
      service.login({ email: 'bad@example.com', password: 'wrong' }).subscribe({
        next: () => { throw new Error('Expected error'); },
        error: () => { errorCaught = true; },
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

      expect(errorCaught).toBe(true);
      expect(localStorage.getItem('access_token')).toBeNull();
    });
  });
});
