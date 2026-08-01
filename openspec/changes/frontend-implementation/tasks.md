# Tasks: Frontend Implementation — Foundation + Auth + Layout

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1400–1800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Backend auth enhancements | PR 1 | `mvn test -pl backend` | Real Spring context with H2 | backend/ only — frontend untouched |
| 2 | Frontend foundation & theme | PR 2 | `npx vitest run` (frontend) | N/A — no runtime harness needed for config files | styles.css, index.html, environment files |
| 3 | Auth module (service + pages) | PR 3 | `npx vitest run -- --reporter=verbose src/app/core/auth` | Login form → mock API | src/app/core/auth/ + features/auth/ |
| 4 | App shell & routing | PR 4 | `npx vitest run` | Navigate between routes in browser | src/app/layout/ + app.routes.ts |
| 5 | Feature modules (clients + projects) | PR 5 | `npx vitest run` | Mock CRUD operations | src/app/features/clients/ + projects/ |

## Phase 1: Backend Auth Enhancements

- [ ] 1.1 Verify `nie` column exists in users table (check V1 migration or existing DDL); create V9 migration only if missing
- [ ] 1.2 Update `LoginRequest.java`: make `email` optional, add optional `nie` field
- [ ] 1.3 Update `AuthResponse.java`: add `refreshToken` field
- [ ] 1.4 Update `AuthService.java`: login by email OR nie (detect by `@` presence); add `generateRefreshToken()` and `refreshToken()` methods
- [ ] 1.5 Update `JwtUtil.java`: add `generateRefreshToken()` with 14-day expiry config
- [ ] 1.6 Update `AuthController.java`: add `POST /api/auth/refresh` endpoint
- [ ] 1.7 Update `SecurityConfig.java`: permit `/api/auth/refresh` without auth
- [ ] 1.8 Update `application.yml`: add `jwt.refresh-expiration: 1209600000`
- [ ] 1.9 Update `RegisterRequest.java`: validate ADMIN role on backend (check caller has ADMIN role before creating user)

## Phase 2: Frontend Foundation & Theme

- [ ] 2.1 Create `src/environments/environment.ts` and `environment.prod.ts` with `apiBaseUrl`
- [ ] 2.2 Create `proxy.conf.json`: proxy `/api/*` → `localhost:8081`
- [ ] 2.3 Update `angular.json`: add `proxyConfig` to serve target
- [ ] 2.4 Update `src/index.html`: add Google Fonts link for Poppins (400,500,600,700) and JetBrains Mono (400)
- [ ] 2.5 Update `src/styles.css`: add TailwindCSS 4.x `@theme` with brand colors (Nero, Construction Red, Cement Grey, Steel Grey, Background White), `--radius: 0px`, and font-family utilities

## Phase 3: Auth Module

- [ ] 3.1 Create `src/app/core/auth/auth.types.ts`: AuthResponse, LoginRequest, RegisterRequest, User interfaces
- [ ] 3.2 Create `src/app/core/auth/auth.service.ts`: login(), register(), logout(), getToken(), getUser(), isAuthenticated(), decodeToken()
- [ ] 3.3 Create `src/app/core/auth/auth.interceptor.ts`: functional interceptor with Bearer header, 401 refresh with queue lock, skip login/register endpoints
- [ ] 3.4 Create `src/app/core/auth/auth.guard.ts`: functional route guard, redirect to /login if no valid token
- [ ] 3.5 Create `src/app/features/auth/login/login.component.ts`: email/nie toggle, underline inputs, brand button, error display
- [ ] 3.6 Create `src/app/features/auth/register/register.component.ts`: admin-only form with name, email, nie, password fields

## Phase 4: App Shell & Routing

- [ ] 4.1 Create `src/app/layout/shell/shell.component.ts`: sidebar + header + `<router-outlet>` wrapper
- [ ] 4.2 Create `src/app/layout/shell/sidebar/sidebar.component.ts`: Nero bg, Construformas branding, nav links with active state
- [ ] 4.3 Create `src/app/layout/shell/header/header.component.ts`: user name, role, logout button
- [ ] 4.4 Update `src/app/app.routes.ts`: public routes (/login, /register) + protected shell routes with auth guard
- [ ] 4.5 Update `src/app/app.config.ts`: add `provideHttpClient(withInterceptors([authInterceptor]))`
- [ ] 4.6 Update `src/app/app.html`: replace boilerplate with `<router-outlet />`
- [ ] 4.7 Update `src/app/app.ts`: simplify to root component only

## Phase 5: Feature Modules & Design System Components

- [ ] 5.1 Create `src/app/shared/design-system/button/button.component.ts`: primary/secondary/ghost variants
- [ ] 5.2 Create `src/app/shared/design-system/input/input.component.ts`: underline-only with focus state
- [ ] 5.3 Create `src/app/shared/design-system/card/card.component.ts`: white bg, 0px radius, subtle shadow
- [ ] 5.4 Create `src/app/shared/design-system/badge/badge.component.ts`: active/inactive/pending/error statuses
- [ ] 5.5 Create `src/app/shared/design-system/metric-card/metric-card.component.ts`: label + value + trend
- [ ] 5.6 Create `src/app/features/dashboard/dashboard.component.ts`: placeholder with metric cards
- [ ] 5.7 Create `src/app/features/clients/` module: list, create, edit components with DataTable
- [ ] 5.8 Create `src/app/features/projects/` module: list, create, edit components with financial summary
