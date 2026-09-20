# Tasks: Frontend Implementation — Auth + Layout + Features

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1000–1300 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Frontend foundation & theme | PR 1 | `npx ng test` (frontend) | N/A — config files only | styles.css, index.html, environment files |
| 2 | Auth module (types + service + pages) | PR 2 | `npx ng test` | Login form → mock API | src/app/auth/ |
| 3 | App shell & routing | PR 3 | `npx ng test` | Navigate between routes in browser | src/app/layout/ + app.routes.ts |
| 4 | Design system + feature modules | PR 4 | `npx ng test` | Mock CRUD operations | src/app/shared/ + features/ |

## Phase 1: Frontend Foundation & Theme

- [x] 1.1 Create `src/environments/environment.ts` and `environment.development.ts` with `apiBaseUrl`
- [x] 1.2 Create `proxy.conf.json`: proxy `/api/*` → `localhost:8081`
- [x] 1.3 Update `angular.json`: add `proxyConfig` to serve target
- [x] 1.4 Update `src/index.html`: add Google Fonts link for Poppins (400-800) and JetBrains Mono (500)
- [x] 1.5 Update `src/styles.css`: add TailwindCSS 4.x `@theme` with brand colors (Nero, Construction Red, Cement Grey, Steel Grey), `--radius-default: 0px`, and font-family utilities
- [x] 1.6 Update `src/app/app.config.ts`: add `provideHttpClient(withFetch())`

## Phase 2: Auth Module

- [x] 2.1 Create `src/app/auth/types/auth.types.ts`: `LoginRequest` (`email?: string`, `nie?: string`, `password: string`), `RefreshRequest` (`refreshToken: string`), `AuthResponse` (`accessToken`, `refreshToken`, `email`, `roles: string[]`, `name`), `User` (id, name, email, nie, phone, roles, availability, active)
- [x] 2.2 Create `src/app/auth/services/auth.service.ts`: `login(LoginRequest)`, `refresh(refreshToken)`, `logout()` (call POST /api/auth/logout then clear storage), `getToken()`, `getRefreshToken()`, `getUser()`, `isAuthenticated()`, `isTokenExpired()`. Store access_token + refresh_token + user_data in localStorage
- [x] 2.3 Create `src/app/auth/interceptors/auth.interceptor.ts`: functional interceptor adding `Authorization: Bearer {token}` header, 401 handling with token refresh + queue lock, skip intercept for `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- [x] 2.4 Create `src/app/auth/guards/auth.guard.ts`: functional route guard, redirect to `/login` via UrlTree if no valid token
- [x] 2.5 Create `src/app/auth/pages/login/login.component.ts`: toggle between email and NIE input tabs, underline-style inputs (border-b, focus:border-accent), Poppins + JetBrains Mono fonts, error display for invalid credentials, navigate to `/` on success
- [x] 2.6 Create `src/app/auth/auth-layout.component.ts`: centered card layout on cement grey background, Construformas branding, router-outlet for child routes
- [x] 2.7 Update `src/app/app.config.ts`: add `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`

## Phase 3: App Shell & Routing

- [x] 3.1 Create `src/app/layout/shell/shell.component.ts`: sidebar + header + `<router-outlet>` wrapper
- [x] 3.2 Create `src/app/layout/shell/sidebar/sidebar.component.ts`: Nero bg, Construformas branding, nav links with active state
- [x] 3.3 Create `src/app/layout/shell/header/header.component.ts`: user name, role badges from `AuthResponse.roles`, logout button
- [x] 3.4 Update `src/app/app.routes.ts`: public routes (`/login`) + protected shell routes with `authGuard`
- [x] 3.5 Update `src/app/app.html`: replace boilerplate with `<router-outlet />`
- [x] 3.6 Update `src/app/app.ts`: simplify to root component only
- [x] 3.7 Placeholder components for all modules (dashboard, clients, projects, budgets, invoices, suppliers, payments, clock, users)

## Phase 4: Design System & Feature Modules

- [x] 4.1 Create `src/app/shared/components/button/button.component.ts`: primary/secondary/danger variants, sm/md/lg sizes, disabled state
- [x] 4.2 Create `src/app/shared/components/input/input.component.ts`: underline-only with floating label, focus state, two-way binding
- [x] 4.3 Create `src/app/shared/components/card/card.component.ts`: white bg, 1px steel border, 0px radius, ng-content projection
- [x] 4.4 Create `src/app/shared/components/badge/badge.component.ts`: status-based color mapping (ACTIVE, PENDING, INACTIVE, PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- [x] 4.5 Create `src/app/shared/components/metric-card/metric-card.component.ts`: large value + label + configurable color
- [x] 4.6 Update `src/app/features/dashboard/dashboard.component.ts`: welcome message, 4 metric cards, recent activity placeholder
- [x] 4.7 Create `src/app/features/clients/` module: types, service, DataTable with CRUD + search + modal form
- [x] 4.8 Create `src/app/features/projects/` module: types, service, DataTable with CRUD + financial summary + modal form

## Phase 5: Remaining Feature Modules

- [x] 5.1 Create `src/app/features/budgets/` module: types (Budget, BudgetItem, BudgetStatus, BudgetType), service (getAll, getById, getByProject, create, createNewVersion, approve, addItem, getItems, delete), DataTable with status badge, approve button, items list panel, metric cards, create/add-item modals
- [x] 5.2 Create `src/app/features/invoices/` module: types (Invoice, InvoiceItem, InvoiceStatus, RectifyingInvoice), service (getAll, getById, getByProject, create, update, issue, addItem, rectify, delete), DataTable with status badge, issue button, metric cards, create/edit modal with auto-calculated tax/total
- [x] 5.3 Create `src/app/features/suppliers/` module: types (Supplier), service (getAll, getById, search, create, update, delete), DataTable with search bar, status badge, create/edit modal
- [x] 5.4 Create `src/app/features/payments/` module: types (Payment, PaymentMethod, PaymentType), service (getAll, getById, getByProject, getMethods, create), DataTable with payment methods list, metric cards, create modal
- [x] 5.5 Create `src/app/features/clock/` module: types (ClockEntry, ClockType), service (getById, getByUser, register, delete), DataTable with user/date filters, entry/exit buttons, register modal with geolocation
- [x] 5.6 Create `src/app/features/users/` module: types (User, UserRole, UserAvailability), service (getAll, getById, getByRole, create, update, delete), DataTable with role filter, status/availability badges, create/edit modal
