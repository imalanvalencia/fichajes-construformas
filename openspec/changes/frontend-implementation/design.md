# Design: Frontend Implementation — Foundation + Auth + Layout

## Technical Approach

Angular 22 standalone SPA with TailwindCSS 4.x design system, JWT auth (login/register/token refresh), and a protected app shell. Four slices: design system → auth module → app shell → backend DNI/NIE support. All components are standalone (no NgModules). Backend changes are minimal — the existing `nie` column already exists in the users table, so no new migration is needed.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Component style | Standalone components | NgModules | Angular 22 default; no module overhead; tree-shakeable |
| HTTP interceptor | Functional (`withInterceptors`) | Class-based | Angular 22 recommended; simpler DI; matches `app.config.ts` pattern |
| Token storage | localStorage (`access_token`, `refresh_token`) | HttpOnly cookies, sessionStorage | Spec requirement; backend returns tokens in body; session persistence across tabs |
| Login identifier | Backend accepts `email` OR `nie` (optional fields) | Frontend-only detection | Backend already has `nie` column (V1 migration); no new migration needed |
| Refresh tokens | Backend issues refresh token with 14-day expiry | Frontend-only expiry | Spec requirement for silent refresh; backend rotation prevents replay |
| Routing | Nested children under shell layout | Flat routes | Clean URL hierarchy; single auth guard per subtree |
| CSS reset | `@theme { --radius: 0px }` in TailwindCSS 4.x | Per-component `rounded-none` | Sharp corners globally enforced per DESIGN.md brand spec |

## Data Flow

### Auth Flow

    User ──→ Login Page ──→ AuthService.login() ──→ POST /api/auth/login
                                                            │
                                                      AuthResponse { token, email, role, name }
                                                            │
                                                      ┌─────▼─────┐
                                                      │ localStorage │
                                                      │ access_token │
                                                      │ refresh_token│
                                                      └─────┬─────┘
                                                            │
    ┌──────────────────────────────────────────────────────────┘
    │
    ▼
    Auth Interceptor ──→ Attaches Bearer header ──→ Backend API
         │
         ├── 401 ──→ Refresh flow ──→ Retry original request
         │
         └── 401 (refresh failed) ──→ Clear tokens ──→ Redirect /login

### App Shell Flow

    Router ──→ App (root) ──→ Routes:
                                 ├── /login        → LoginComponent (public)
                                 ├── /register     → RegisterComponent (public, ADMIN only)
                                 └── /             → ShellComponent (protected)
                                                      ├── SidebarComponent
                                                      ├── HeaderComponent
                                                      └── <router-outlet> → child routes

## File Changes

### Frontend (new)

| File | Action | Description |
|------|--------|-------------|
| `src/app/core/auth/auth.service.ts` | Create | Login, register, JWT decode, token storage, user signal |
| `src/app/core/auth/auth.interceptor.ts` | Create | Functional interceptor: attach Bearer, handle 401 refresh |
| `src/app/core/auth/auth.guard.ts` | Create | Functional route guard: redirect to /login if unauthenticated |
| `src/app/core/auth/auth.types.ts` | Create | Interfaces: AuthResponse, LoginRequest, RegisterRequest, User |
| `src/app/core/auth/auth.spec.ts` | Create | Unit tests for AuthService |
| `src/app/features/auth/login/login.component.ts` | Create | Login page: email/DNI toggle, underline inputs, brand styling |
| `src/app/features/auth/register/register.component.ts` | Create | Admin-only registration form |
| `src/app/layout/shell/shell.component.ts` | Create | Sidebar + header + router-outlet wrapper |
| `src/app/layout/shell/sidebar/sidebar.component.ts` | Create | Nero sidebar with nav links, Construction Red active state |
| `src/app/layout/shell/header/header.component.ts` | Create | User info display + logout button |
| `src/app/shared/design-system/button/button.component.ts` | Create | Button variants: primary, secondary, ghost |
| `src/app/shared/design-system/input/input.component.ts` | Create | Underline-only input with focus state |
| `src/app/shared/design-system/card/card.component.ts` | Create | White card, 0px radius, subtle shadow |
| `src/app/shared/design-system/badge/badge.component.ts` | Create | Status badges: active, inactive, pending, error |
| `src/app/shared/design-system/metric-card/metric-card.component.ts` | Create | Label + value + trend indicator |
| `src/environments/environment.ts` | Create | API_BASE_URL for dev |
| `src/environments/environment.prod.ts` | Create | API_BASE_URL for prod |
| `proxy.conf.json` | Create | Dev proxy /api/* → localhost:8081 |

### Frontend (modified)

| File | Action | Description |
|------|--------|-------------|
| `src/styles.css` | Modify | TailwindCSS 4.x `@theme` with brand colors, fonts, sharp corners |
| `src/index.html` | Modify | Add Google Fonts link (Poppins, JetBrains Mono) |
| `src/app/app.config.ts` | Modify | Add `provideHttpClient(withInterceptors([authInterceptor]))` |
| `src/app/app.routes.ts` | Modify | Route config: public + protected shell routes |
| `src/app/app.html` | Modify | Replace boilerplate with `<router-outlet />` |
| `src/app/app.ts` | Modify | Simplify to shell-only wrapper |
| `angular.json` | Modify | Add `proxyConfig` to serve config |

### Backend (modified)

| File | Action | Description |
|------|--------|-------------|
| `LoginRequest.java` | Modify | Make `email` optional, add optional `nie` field |
| `AuthResponse.java` | Modify | Add `refreshToken` field |
| `AuthService.java` | Modify | Login by email OR nie; refresh token generation |
| `AuthController.java` | Modify | Add `/refresh` endpoint |
| `JwtUtil.java` | Modify | Add `generateRefreshToken()` with 14-day expiry |
| `application.yml` | Modify | Add `jwt.refresh-expiration: 1209600000` (14 days) |
| `SecurityConfig.java` | Modify | Permit `/api/auth/refresh` without auth |

## Interfaces / Contracts

### Frontend Types

```typescript
interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  role: string;
  name: string;
}

interface LoginRequest {
  email?: string;
  nie?: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  nie?: string;
  password: string;
}

interface User {
  email: string;
  name: string;
  role: string;
}
```

### Backend API Changes

```
POST /api/auth/login
  Body: { email?: string, nie?: string, password: string }
  Response: { token, refreshToken, email, role, name }

POST /api/auth/refresh
  Body: { refreshToken: string }
  Response: { token, refreshToken, email, role, name }

POST /api/auth/register
  Body: { name, email, nie?, password }
  Response: { token, refreshToken, email, role, name }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AuthService (login, decode, logout, token storage) | Vitest + HttpClientTestingModule |
| Unit | Auth interceptor (header attachment, 401 handling) | Vitest with mock HTTP handler |
| Unit | Auth guard (redirect logic) | Vitest with mock Router/ActivatedRouteSnapshot |
| Unit | Design system components (render variants) | Angular Testing Library |
| Integration | Login flow end-to-end (form → API → redirect) | Vitest with HttpClient mock |
| E2E | Full auth flow with real backend | Deferred to future slice |

## Threat Matrix

| Boundary | Applicability | Design Response |
|----------|--------------|-----------------|
| Client-side routing | **Applicable** — SPA route protection via auth guard; protected routes must not render without valid token | Auth guard checks `localStorage` token and validates expiry; unauthenticated → redirect to `/login` |
| HTTP header injection | **Applicable** — Interceptor attaches `Authorization: Bearer` header; must skip login/register endpoints | Interceptor excludes `/api/auth/login` and `/api/auth/register` from header attachment |
| Token refresh race condition | **Applicable** — Multiple concurrent 401s could trigger parallel refresh attempts | Implement refresh lock: queue pending requests while refresh is in-flight; single refresh call, replay on completion |
| localStorage XSS | **Applicable** — Tokens stored in localStorage are accessible to any JS on the page | Mitigated by Angular's built-in XSS protection; no `innerHTML`; tokens only sent via HTTP interceptor header |

## Migration / Rollout

No database migration required. The `nie` column already exists in the `users` table (V1 migration). Backend changes are additive (new endpoint, optional fields). Frontend changes are entirely new files + config modifications. Rollback: revert to `main` HEAD.

## Open Questions

- [ ] Should the register endpoint require ADMIN role enforcement on the backend, or is frontend-only guard sufficient for the first slice?
- [ ] Backend `AuthResponse` currently lacks `refreshToken` — confirm the backend team will add this field before frontend integration.
- [ ] The backend `nie` field already exists — should we rename it to `dni_nie` for clarity, or keep the existing column name?
