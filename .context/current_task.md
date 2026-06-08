# Current Task Tracking

## Current Objective

Setting up the basic Spring Boot V1 backend architecture and verifying local database connection.

## Micro-Steps

- [x] Download Spring Boot project from Spring Initializr.
- [x] Fix package naming: `es.constuformas.api` → `es.construformas.api` and Spring Boot version references (3.x → 4.x).
- [x] Configure AI tooling: `.cursorrules`, `AI-rules.md`, `.opencode/agents/`, `opencode.json`, root `.gitignore`.
- [x] Configure `application.yml` with local MariaDB database credentials.
- [x] Create `Usuario`, `Obra`, and `Fichaje` JPA entities.
- [x] Run the application to verify Hibernate auto-creates the tables.
- [x] Configure Flyway for database migrations (V1-V3 scripts, pom.xml dependencies, ddl-auto: validate).
- [x] Create JPA Repositories: `UserRepository`, `ProjectRepository`, `ClockEntryRepository`.
- [x] Add custom query methods (e.g., `findByEmail`, `findByProjectId`).
- [x] Create a `data.sql` seed script for initial admin user.
- [x] Create Service layer: `UserService`, `ProjectService`, `ClockEntryService`.
- [x] Add DTOs for request/response (e.g., `UserDTO`, `ClockEntryDTO`).
- [x] Create REST controllers: `UserController`, `ProjectController`, `ClockEntryController`.
- [x] Translate all code to English (class names, fields, table names).
- [x] Fix Flyway compatibility with MariaDB 12.x (added flyway-mysql).
- [x] Drop old Spanish tables, re-run migrations with English names.
- [x] Add global exception handler (`@ControllerAdvice`).
- [x] Configure CORS for frontend integration.
- [x] Add Swagger/OpenAPI documentation.
- [x] Add Spring Security with JWT authentication.
- [x] Create auth endpoints: `/auth/login`, `/auth/register`.
- [x] Add password hashing with BCrypt.
- [x] Add Haversine distance validation for clock-in location.
- [x] Create missing clock-out flow (manual correction request).

## Frontend Architecture (Angular 22 + Tailwind v4)

- [x] Initialize Angular 22 project with Tailwind CSS v4.
- [x] Create folder structure: `core/` (services, interceptors, guards), `shared/`, `features/`.
- [x] Create `AuthService` with Angular Signals for reactive state management.
- [x] Create `AuthInterceptor` to attach Bearer token to HTTP requests.
- [x] Create `AuthGuard` to protect dashboard routes.
- [x] Create `LoginComponent` with template-driven form (email + password).
- [x] Create `DashboardComponent` placeholder with user info and logout.
- [x] Configure `app.config.ts` with `provideHttpClient(withInterceptors(...))`.
- [x] Configure `app.routes.ts` with lazy-loaded routes and auth guard.
- [x] Apply DESIGN.md theme tokens to Tailwind (colors, typography, spacing).
- [x] Create shared UI components (buttons, inputs, cards) following Structural Precision.
- [x] Add proxy configuration for backend API calls in development.
- [ ] Implement real-time clock-in/clock-out feature.
  - [x] Add userId to AuthResponse (backend + frontend models + AuthService).
  - [x] Create clock.models.ts (Project, ClockEntryRequest, ClockEntry) and ClockEntryService.
  - [x] Create ClockEntryComponent with project selector, geolocation, and clock-in/out button.
- [ ] Add project selection and geolocation validation.
- [x] Add clock entry history for current day.

## Blockers / Notes

- Flyway migrations created: V1 (usuarios), V2 (obras), V3 (fichajes).
- `ddl-auto` changed from `update` to `validate` — Flyway now owns schema management.
- `baseline-on-migrate: false` set because this is a fresh DB with no prior data.
- Repositories go in `backend/src/main/java/es/construformas/api/repository/`.
- Backend API: `POST /api/auth/login` with `{email, password}` → `{token, email, role}`.
- Frontend uses lazy-loaded standalone components with Angular Signals.
