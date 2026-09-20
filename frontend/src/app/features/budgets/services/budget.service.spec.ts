import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { BudgetService } from './budget.service';
import { Budget, BudgetItem, DocumentLifecycleEvent } from '../types/budget.types';

describe('BudgetService', () => {
  let service: BudgetService;
  let http: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    http = {
      get: vi.fn().mockReturnValue(of([])),
      post: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
    };
    TestBed.configureTestingModule({
      providers: [BudgetService, { provide: HttpClient, useValue: http }],
    });
    service = TestBed.inject(BudgetService);
  });

  it('getLifecycle fetches lifecycle events for a budget', () => {
    const events: DocumentLifecycleEvent[] = [
      { id: 1, type: 'BUDGET_APPROVED', occurredAt: '2026-09-10T14:30:00' },
    ];
    http.get.mockReturnValue(of(events));

    service.getLifecycle(5).subscribe((result) => {
      expect(result).toEqual(events);
    });

    expect(http.get).toHaveBeenCalledWith('/api/budgets/5/lifecycle');
  });

  it('delete with confirmed sends confirmed=true query param', () => {
    service.delete(3, true).subscribe();

    expect(http.delete).toHaveBeenCalledWith('/api/budgets/3?confirmed=true');
  });

  it('delete without confirmed sends no confirmed param', () => {
    service.delete(3).subscribe();

    expect(http.delete).toHaveBeenCalledWith('/api/budgets/3');
  });
});
