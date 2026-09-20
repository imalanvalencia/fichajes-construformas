import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  let component: AuthLayoutComponent;
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: [
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render ConstruFormas branding', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('ConstruFormas');
  });

  it('should render with cement grey background', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.bg-cement');
    expect(container).toBeTruthy();
  });

  it('should render a centered card layout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.bg-white');
    expect(card).toBeTruthy();
  });

  it('should contain a router-outlet for child routes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const outlet = compiled.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });
});
