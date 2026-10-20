import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ClockComponent } from './clock.component';
import { ClockEntryService } from './services/clock-entry.service';
import { ClockCorrectionService } from './services/clock-correction.service';
import { GeolocationService } from './services/geolocation.service';
import { ProjectService } from '../projects/services/project.service';
import { AuthService } from '../../auth/services/auth.service';
import { NotificationService } from '@app/services/notification.service';
import { Project } from '../projects/types/project.types';

describe('ClockComponent', () => {
  let component: ClockComponent;
  let fixture: ComponentFixture<ClockComponent>;

  let clockService: { getByUser: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let correctionService: { getPending: ReturnType<typeof vi.fn>; approve: ReturnType<typeof vi.fn>; reject: ReturnType<typeof vi.fn> };
  let geolocation: { getPosition: ReturnType<typeof vi.fn> };
  let projectService: { getAll: ReturnType<typeof vi.fn> };
  let notifications: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  const project: Project = {
    id: 7,
    clientId: 1,
    name: 'Obra Sol',
    address: 'Calle 1',
    latitude: 40.0,
    longitude: -3.0,
    status: 'IN_PROGRESS',
    active: true,
  };

  const position = {
    coords: { latitude: 40.0001, longitude: -3.0002, accuracy: 5, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: 1,
  } as GeolocationPosition;

  const setup = (positionResult: () => ReturnType<typeof vi.fn>) => {
    clockService = {
      getByUser: vi.fn().mockReturnValue(of([])),
      register: vi.fn().mockReturnValue(of({ id: 1 })),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    correctionService = {
      getPending: vi.fn().mockReturnValue(of([])),
      approve: vi.fn().mockReturnValue(of({})),
      reject: vi.fn().mockReturnValue(of({})),
    };
    geolocation = { getPosition: positionResult() };
    projectService = { getAll: vi.fn().mockReturnValue(of([project])) };
    notifications = { success: vi.fn(), error: vi.fn() };
  };

  const compile = async () => {
    await TestBed.configureTestingModule({
      imports: [ClockComponent],
      providers: [
        { provide: ClockEntryService, useValue: clockService },
        { provide: ClockCorrectionService, useValue: correctionService },
        { provide: GeolocationService, useValue: geolocation },
        { provide: ProjectService, useValue: projectService },
        { provide: NotificationService, useValue: notifications },
        {
          provide: AuthService,
          useValue: {
            getUser: vi.fn().mockReturnValue({ id: 42, name: 'Ana Operaria', email: 'ana@test.com', roles: ['ROLE_OPERATOR'] }),
            hasRole: vi.fn().mockReturnValue(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('project selector and identity', () => {
    beforeEach(async () => {
      setup(() => vi.fn().mockReturnValue(of(position)));
      await compile();
    });

    it('loads the project catalogue on init', () => {
      expect(projectService.getAll).toHaveBeenCalled();
      expect(component.projects()).toEqual([project]);
    });

    it('defaults the filter to the authenticated user instead of asking for a user id', () => {
      expect(component.filterUserId).toBe(42);
    });

    it('offers a project selector and no typed user, project or coordinate inputs in the modal', () => {
      component.registerEntry();
      fixture.detectChanges();

      const modal: HTMLElement = fixture.nativeElement.querySelector('.fixed');
      expect(modal).toBeTruthy();

      const numericInputs = modal.querySelectorAll('input[type="number"]');
      expect(numericInputs.length).toBe(0);

      const labels = Array.from(modal.querySelectorAll('label')).map((l) => l.textContent?.trim() ?? '');
      expect(labels.some((l) => l.includes('Usuario ID'))).toBe(false);
      expect(labels.some((l) => l.includes('Proyecto ID'))).toBe(false);
      expect(labels.some((l) => l.includes('Latitud'))).toBe(false);
      expect(labels.some((l) => l.includes('Longitud'))).toBe(false);

      const options = Array.from(modal.querySelectorAll('option')).map((o) => o.textContent?.trim());
      expect(options).toContain('Obra Sol');
    });

    it('shows the authenticated user in the modal', () => {
      component.registerEntry();
      fixture.detectChanges();

      const modal: HTMLElement = fixture.nativeElement.querySelector('.fixed');
      expect(modal.textContent).toContain('Ana Operaria');
    });
  });

  describe('geolocation', () => {
    it('submits the coordinates reported by the browser without a client-side userId', async () => {
      setup(() => vi.fn().mockReturnValue(of(position)));
      await compile();

      component.registerEntry();
      fixture.detectChanges();
      component.submitEntry({ projectId: 7, notes: '' });

      expect(geolocation.getPosition).toHaveBeenCalled();
      expect(clockService.register).toHaveBeenCalledTimes(1);
      const payload = clockService.register.mock.calls[0][0];
      expect(payload.userLatitude).toBe(40.0001);
      expect(payload.userLongitude).toBe(-3.0002);
      expect(payload.projectId).toBe(7);
      expect(payload.clockType).toBe('ENTRY');
      expect(payload.userId).toBeUndefined();
    });

    it('blocks the request and reports an error when geolocation is denied', async () => {
      setup(() => vi.fn().mockReturnValue(throwError(() => new Error('User denied Geolocation'))));
      await compile();

      component.registerEntry();
      fixture.detectChanges();
      component.submitEntry({ projectId: 7, notes: '' });

      expect(clockService.register).not.toHaveBeenCalled();
      expect(notifications.error).toHaveBeenCalledTimes(1);
    });

    it('never sends a fabricated 0,0 position', async () => {
      setup(() => vi.fn().mockReturnValue(throwError(() => new Error('denied'))));
      await compile();

      component.registerEntry();
      fixture.detectChanges();
      component.submitEntry({ projectId: 7, notes: '' });

      expect(clockService.register).not.toHaveBeenCalled();
    });
  });

  describe('corrections gating (S7)', () => {
    it('shows an OPERATOR no approve/reject controls and never hits the pending endpoint', async () => {
      setup(() => vi.fn().mockReturnValue(of(position)));
      await compile();

      const text: string = fixture.nativeElement.textContent;
      expect(text).not.toContain('Aprobar');
      expect(text).not.toContain('Rechazar');
      expect(correctionService.getPending).not.toHaveBeenCalled();
    });
  });

  describe('feedback (S5)', () => {
    it('surfaces a failed registration instead of swallowing the error', async () => {
      setup(() => vi.fn().mockReturnValue(of(position)));
      clockService.register = vi.fn().mockReturnValue(throwError(() => new Error('boom')));
      await compile();

      component.registerEntry();
      fixture.detectChanges();
      component.submitEntry({ projectId: 7, notes: '' });

      expect(notifications.error).toHaveBeenCalledTimes(1);
    });

    it('notifies success after a registration', async () => {
      setup(() => vi.fn().mockReturnValue(of(position)));
      await compile();

      component.registerEntry();
      fixture.detectChanges();
      component.submitEntry({ projectId: 7, notes: '' });

      expect(notifications.success).toHaveBeenCalledTimes(1);
    });
  });
});
