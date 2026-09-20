import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: {
    login: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockReturnValue(of({
        accessToken: 'token',
        refreshToken: 'refresh',
        email: 'test@example.com',
        roles: ['CONSTRUCTOR'],
        name: 'Test User',
      })),
      isAuthenticated: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: '', component: {} as any }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render email tab and DNI/NIE tab', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Email');
    expect(compiled.textContent).toContain('DNI');
  });

  it('should render login form with inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('should render a submit button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[type="submit"]');
    expect(button).toBeTruthy();
  });

  it('should have email input field', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('input[type="email"], input[placeholder*="email" i]');
    expect(emailInput).toBeTruthy();
  });

  it('should have password input field', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
  });

  describe('login flow', () => {
    it('should call authService.login with email when email tab is active', () => {
      component.activeTab.set('email');
      component.email = 'user@example.com';
      component.password = 'pass123';

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'pass123',
      });
    });

    it('should call authService.login with NIE when NIE tab is active', () => {
      component.activeTab.set('nie');
      component.nie = '12345678Z';
      component.password = 'pass123';

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        nie: '12345678Z',
        password: 'pass123',
      });
    });

    it('should navigate to / on successful login', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.email = 'user@example.com';
      component.password = 'pass123';

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should show error message on login failure', () => {
      authService.login.mockReturnValue(throwError(() => ({
        error: { message: 'Invalid credentials' },
      })));

      component.email = 'bad@example.com';
      component.password = 'wrong';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid credentials');
    });

    it('should show generic error when no message in response', () => {
      authService.login.mockReturnValue(throwError(() => ({})));

      component.email = 'bad@example.com';
      component.password = 'wrong';
      component.onSubmit();

      expect(component.errorMessage()).toBe('Invalid credentials. Please try again.');
    });
  });
});
