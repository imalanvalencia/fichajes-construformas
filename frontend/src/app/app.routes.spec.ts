import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import { ClockComponent } from './features/clock/clock.component';

describe('app routes', () => {
  const shellChildren = routes.find((route) => route.path === '' && route.children)?.children ?? [];

  it('exposes the clock route inside the authenticated shell (S6)', () => {
    const clockRoute = shellChildren.find((route) => route.path === 'clock');
    expect(clockRoute).toBeTruthy();
    expect(clockRoute?.component).toBe(ClockComponent);
  });
});
