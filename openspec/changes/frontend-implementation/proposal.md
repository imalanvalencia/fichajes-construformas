# Proposal: Frontend Implementation — Foundation + Auth + Layout

## Intent

The backend is complete (11 controllers, 23 DTOs, JWT auth) but the frontend is bare Angular 22 + TailwindCSS 4.x boilerplate. Construformas has no way to interact with its own API. This change delivers the first autonomous slice: a working app shell with authentication, routing, and the Construformas design system — enabling all subsequent feature work to build on a real foundation.

## Scope

### In Scope
- TailwindCSS 4.x theme with Construformas brand colors (Nero, Construction Red, Cement Grey, Steel Grey)
- Google Fonts loading (Poppins + JetBrains Mono)
- Environment config with API base URL and dev proxy
- Auth module: AuthService, JWT interceptor, route guard, login + register pages
- Shell layout: sidebar nav, header with user info/logout, router outlet
- Design system: sharp corners, underline-only inputs, button variants, card components

### Out of Scope
- Client/project CRUD pages (future slices)
- Dashboard, reporting, financial summaries
- E2E testing, CI/CD pipeline
- Role-based access control beyond basic JWT role field
- Offline support, PWA, service workers

## Capabilities

### New Capabilities
- `design-system`: Construformas brand tokens, Tailwind theme, base UI components (buttons, inputs, cards)
- `auth`: JWT login/register, token storage, HTTP interceptor, route guard, auth pages
- `app-shell`: Sidebar navigation, header bar, protected route layout, router configuration

### Modified Capabilities
None — this is the first frontend slice.

## Approach

1. Configure TailwindCSS 4.x `@theme` with brand colors, Poppins/JetBrains Mono font families, sharp corners, and 8px grid
2. Add `provideHttpClient(withInterceptors(...))` to `app.config.ts`; create `environment.ts` + `proxy.conf.json`
3. Implement `AuthService` (login, register, JWT decode, token storage via localStorage), `authInterceptor` functional interceptor, and `authGuard` route guard
4. Build login/register pages with underline-only inputs and Construformas visual language
5. Create shell layout component with sidebar (Nero bg, Construction Red active state), header, and `<router-outlet>`
6. Wire routing: `/login`, `/register` (public), `/` redirect to shell (protected), shell children for future features

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/app.config.ts` | Modified | Add HttpClient, router config |
| `src/app/app.routes.ts` | Modified | Route structure with guards |
| `src/app/app.component.*` | Modified | Shell layout wrapper |
| `src/app/core/auth/` | New | AuthService, interceptor, guard |
| `src/app/features/auth/` | New | Login + register pages + components |
| `src/app/layout/` | New | Shell, sidebar, header |
| `src/app/shared/design-system/` | New | Buttons, inputs, cards |
| `src/environments/` | New | environment.ts, environment.prod.ts |
| `proxy.conf.json` | New | Dev proxy to backend |
| `src/styles.css` | Modified | Tailwind @theme, fonts, base styles |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TailwindCSS 4.x @theme syntax differs from 3.x docs | Medium | Use official v4 docs; test theme early |
| JWT decode edge cases (expired, malformed tokens) | Low | Validate token on decode; clear on failure |
| Proxy misconfiguration blocks API calls | Low | Document exact proxy.conf.json; verify with curl |

## Rollback Plan

- Revert to `main` branch HEAD — all changes are additive (new files + minimal config modifications)
- No database migrations involved; backend is untouched
- If Tailwind theme breaks, revert `src/styles.css` and `angular.json` style imports

## Dependencies

- Backend running on `localhost:8081` with `/api/auth/login` and `/api/auth/register` endpoints
- Node.js 22+, Angular CLI 22, TailwindCSS 4.x

## Success Criteria

- [ ] `ng serve` starts with Construformas theme applied (colors, fonts visible)
- [ ] Login page renders with underline-only inputs, sharp corners, correct colors
- [ ] Successful login returns JWT token stored in localStorage
- [ ] Authenticated requests include `Authorization: Bearer <token>` header
- [ ] Unauthenticated access to `/` redirects to `/login`
- [ ] Sidebar navigation renders with correct brand styling
- [ ] Logout clears token and redirects to login
- [ ] Dev proxy forwards `/api/*` to `localhost:8081`

## Proposal Question Round

Before finalizing, please review these questions. Answers will refine the proposal assumptions:

1. **Login page fields**: Should login use email + password only, or is there a username field? The backend endpoint accepts `email` — confirm this is the login identifier.

2. **Role handling**: The backend returns a `role` field in the auth response. Should the first slice enforce any role-based route restrictions, or just store the role for display (e.g., header shows "Admin" vs "User")?

3. **Sidebar nav items**: Which navigation items should appear in the sidebar for the first slice? Empty state? Or should we include placeholder links for future modules (Clients, Projects, etc.) so the layout isn't empty?

4. **Token expiry handling**: Should the interceptor silently redirect to `/login` on 401, or show an explicit "session expired" toast/message first?

5. **Register page**: Is registration open to anyone, or should it require an invite/activation code? The backend register endpoint exists — clarify the intended access model.
