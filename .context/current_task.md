# Current Task Tracking

## Current Objective

Implement core clock-in/out features for construction workers.

## Micro-Steps

### Backend
- [x] Spring Boot V1 architecture with MariaDB
- [x] JPA entities (User, Project, ClockEntry)
- [x] Flyway migrations (V1-V3)
- [x] Repositories with custom queries
- [x] Service layer (UserService, ProjectService, ClockEntryService)
- [x] DTOs for request/response
- [x] REST controllers (Auth, User, Project, ClockEntry)
- [x] Global exception handler
- [x] CORS configuration
- [x] Swagger/OpenAPI documentation
- [x] Spring Security with JWT
- [x] Auth endpoints (login, register)
- [x] Password hashing with BCrypt
- [x] Haversine distance validation
- [x] Clock-out flow with correction request

### Frontend (Angular 22 + Tailwind v4)
- [x] Project initialization with Tailwind CSS v4
- [x] Folder structure (core/, shared/, features/)
- [x] AuthService with Angular Signals
- [x] AuthInterceptor for Bearer token
- [x] AuthGuard for dashboard routes
- [x] LoginComponent with template-driven form
- [x] DashboardComponent with user info
- [x] App config with interceptors
- [x] Lazy-loaded routes with auth guard
- [x] Theme tokens applied
- [x] Shared UI components
- [x] Proxy configuration for API
- [x] userId in AuthResponse
- [x] ClockEntryService (HTTP client)
- [x] ClockEntryComponent (project selector + geolocation)
- [x] ClockHistoryComponent (daily history)

### Admin Panel
- [x] Admin guard (role-based access)
- [x] Admin routing with lazy-loaded routes
- [x] User management (list, create, edit, deactivate)
- [x] Project management (list, create, edit)

## Blockers / Notes

- Flyway migrations created: V1 (usuarios), V2 (obras), V3 (fichajes), V4 (clock_corrections).
- `ddl-auto` changed from `update` to `validate` — Flyway now owns schema management.
- `baseline-on-migrate: false` set because this is a fresh DB with no prior data.
- Repositories go in `backend/src/main/java/es/construformas/api/repository/`.
- Backend API: `POST /api/auth/login` with `{email, password}` → `{token, userId, email, role}`.
- Frontend uses lazy-loaded standalone components with Angular Signals.

### Dev Profile
- Run with: `SPRING_PROFILES_ACTIVE=dev` or `--spring.profiles.active=dev`
- Dev profile disables Flyway, uses `ddl-auto: update`
- `data-dev.sql` seeds test users and projects
- All test users password: `admin123`
- Test emails: `alan@construformas.com` (ADMIN), `juan@construformas.com` (OPERATOR)
