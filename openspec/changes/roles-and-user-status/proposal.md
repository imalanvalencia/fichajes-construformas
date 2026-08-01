# Proposal: Roles and User Status System

## Intent

The current system has a single-role VARCHAR column with zero method-level authorization and fully open GET endpoints. Any unauthenticated user can read all projects, clients, budgets, and clock entries via public GET endpoints. Additionally, anyone can self-register as OPERATOR. This change replaces the flat role column with a proper many-to-many RBAC model, enforces authorization on every endpoint, scopes OPERATOR access to own data only, restricts user creation to ADMIN, adds an availability/dispatch system for field operators, and implements refresh token rotation.

## Business Context

- **Security gap**: All `GET /api/**` endpoints are public (SecurityConfig line 47). No `@PreAuthorize` anywhere in the codebase. Unauthenticated users can enumerate projects, clients, budgets, clock entries.
- **Operational need**: ADMIN must control who joins the system. Public registration (`POST /api/auth/register`) is a risk.
- **Field dispatch**: No way to know which operators are available, on-site, or unavailable. ADMINs currently have no visibility into operator status.
- **Token lifecycle**: Only access tokens exist (24h expiry). No refresh mechanism — users must re-login when token expires. Planned in frontend-implementation spec but never built.

## Scope

### In Scope
1. **Roles table (many-to-many)** — `roles` table + `user_roles` join table, migrate existing `role` column, drop column, seed ADMIN/OPERATOR
2. **Method-level authorization** — `@EnableMethodSecurity`, `@PreAuthorize` on ALL controller endpoints
3. **OPERATOR data scoping** — OPERATOR sees only own data across ALL modules (clock entries, corrections, profile)
4. **Registration restriction** — Remove `POST /api/auth/register`. Only `POST /api/users` (ADMIN-only)
5. **JWT multi-role** — Token carries roles list, filter creates multiple authorities
6. **User availability** — `UserAvailability` enum (AVAILABLE, ON_SITE, PARTIALLY_AVAILABLE, UNAVAILABLE), `availability` + `current_project_id` columns on users, API endpoints
7. **Refresh token** — `refresh_tokens` table, `POST /api/auth/refresh` endpoint, 14-day expiry, rotation on refresh, token revocation on logout

### Out of Scope (V2)
- MANAGER role implementation (kept as dead code in enum, no authorization rules)
- Role permission granularity (role-permission table)
- Audit logging of authorization decisions
- Availability notifications or real-time dispatch

## Approach

**Database**: New Flyway migration creates `roles`, `user_roles`, and `refresh_tokens` tables, migrates existing `role` column data to join table, drops `role` column, adds `availability` and `current_project_id` to users. Seeds ADMIN and OPERATOR roles.

**Security layer**: Add `@EnableMethodSecurity` to the app config. Change `JwtUtil.generateToken()` to accept `List<String> roles` instead of single `String role`. Update `JwtAuthFilter` to extract roles list and create multiple `ROLE_*` authorities. Update `CustomUserDetailsService` to load all roles from the join table. Update `SecurityConfig` to remove `GET /api/**` from `permitAll` — only `/api/auth/login` and `/api/auth/refresh` remain public.

**Refresh tokens**: New `refresh_tokens` table (id, user_id, token, expiry, revoked, created_at). `POST /api/auth/login` returns both access + refresh tokens. `POST /api/auth/refresh` validates refresh token, rotates it (revoke old, issue new pair), returns new access + refresh. `POST /api/auth/logout` revokes refresh token. Refresh token expiry: 14 days.

**Authorization**: Add `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints (user CRUD, project management, budget/invoice/supplier operations). Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on shared endpoints (clock entries, corrections, profile). For OPERATOR-scoped endpoints, implement a service-layer filter that restricts queries to `WHERE user_id = :authenticatedUserId`.

**User management**: Remove `POST /api/auth/register` from `AuthController`. Enhance `POST /api/users` in `UserController` to accept role assignments. Only ADMIN can call it.

**Availability**: Add `UserAvailability` enum. Add `availability` and `current_project_id` columns. Add GET/PUT `/api/users/{id}/availability` endpoints.

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| MANAGER role | Keep as dead code, don't remove | Avoids re-migration later when V2 needs it |
| GET endpoint protection | ALL require auth except login/refresh | Exploration confirmed zero endpoints have auth; this closes the biggest security hole |
| OPERATOR scoping | ALL modules (not just clock entries) | Consistent security model — OPERATOR never sees other users' data |
| Registration | Remove public endpoint entirely | ADMIN-only user creation is standard for ERP; self-registration is a security liability |
| JWT claim shape | `roles: ["ADMIN", "OPERATOR"]` array | Supports future multi-role users without token format changes |
| Availability FK | `current_project_id` on users (nullable) | Simple, no join table needed; project must exist when set |
| Refresh token expiry | 14 days | Balances security (not too long) with UX (not too frequent re-login) |
| Refresh rotation | Rotate on every refresh | Standard security practice — compromised token has limited window |

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking change for existing JWTs during migration | Deploy backend + frontend together; force re-login after migration |
| Data migration fails on existing role values | Validate all existing role values are ADMIN or OPERATOR before migration |
| OPERATOR scoping breaks shared queries | Comprehensive test coverage on every repository query with authenticated user filter |
| Frontend breaks when GET endpoints require auth | Update HTTP interceptors to always send JWT before deploying backend |
| Refresh token table grows unbounded | Cleanup job or scheduled task to delete revoked/expired tokens older than 30 days |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `V9__roles_and_availability.sql` | New | Roles table, join table, availability columns, data migration |
| `V10__refresh_tokens.sql` | New | Refresh tokens table |
| `UserRole.java` | Modified | Keep enum but mark as deprecated (replaced by Role entity) |
| `Role.java` | New | JPA entity for roles table |
| `User.java` | Modified | Remove `role` field, add `Set<Role> roles`, add availability fields |
| `RoleRepository.java` | New | CRUD for roles |
| `RefreshToken.java` | New | JPA entity for refresh tokens |
| `RefreshTokenRepository.java` | New | Token lookup and cleanup |
| `JwtUtil.java` | Modified | Multi-role token generation, refresh token support |
| `JwtAuthFilter.java` | Modified | Extract roles list |
| `CustomUserDetailsService.java` | Modified | Load from join table |
| `SecurityConfig.java` | Modified | Remove GET permitAll, add @EnableMethodSecurity |
| `AuthController.java` | Modified | Remove register, add refresh/logout endpoints |
| `AuthService.java` | Modified | Multi-role token, refresh flow, logout |
| `AuthResponse.java` | Modified | Add refreshToken field |
| `LoginRequest.java` | Modified | Accept email OR nie |
| `UserController.java` | Modified | Admin-only, role assignment |
| `UserService.java` | Modified | Role assignment, availability management |
| `All controllers` | Modified | Add @PreAuthorize annotations |

## Success Criteria

- [ ] Zero unauthenticated GET endpoints (only `/api/auth/login` and `/api/auth/refresh` are public)
- [ ] `@PreAuthorize` present on every controller method
- [ ] OPERATOR can only query their own data across all modules
- [ ] `POST /api/auth/register` returns 404 or 405
- [ ] `POST /api/users` requires ADMIN role; OPERATOR gets 403
- [ ] JWT contains `roles` array claim
- [ ] Existing ADMIN user migrated to join table, role column dropped
- [ ] Availability endpoints functional: set, update, query
- [ ] Refresh token rotation works: old token revoked, new pair issued
- [ ] Logout revokes refresh token (cannot reuse after logout)
- [ ] Expired refresh token returns 401 (not 500)

## Rollback Plan

Revert the migration by re-adding `role` column (populated from join table), dropping `roles`/`user_roles`/`refresh_tokens` tables, and removing `availability` columns. Rollback code changes via git revert. Frontend must re-deploy with the reverted backend.
