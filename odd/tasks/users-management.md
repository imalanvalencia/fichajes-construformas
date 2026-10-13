# Feature: user management system (backend contract fix + frontend Users module)

Objective: make the user-management module actually work end to end against the post-RBAC
backend, and expose it in the app. The frontend components already follow the current
architecture; the gap is a stale contract, not stale scaffolding.

Branch: `dev` (repo convention — direct conventional commits, no PR flow).
Test runners: backend `cd backend && ./mvnw test`; frontend `cd frontend && pnpm test`.
Strict TDD is active: RED observed before GREEN on every behavior change.

## Log

- L1 — user, verbatim: `vamos con el sistema de gestion de usuarios`
- L2 — user decision, verbatim: scope chosen was `Frontend: módulo Users completo (Recomendado)`,
  described as: "Reescribir features/users con la arquitectura actual (signals + app-* components +
  RBAC real): tabla, filtros, modal de alta/edición con roles many-to-many y availability, y
  descomentar la ruta. El backend ya lo soporta."
- L3 — user decision, verbatim, on the backend scope question `Hasta dónde toco el backend?`:
  `Sí, arreglar el backend primero (Recomendado)`, described as: "Arreglar el leak de password
  (@JsonIgnore o DTO de respuesta), que update() honre roles/availability/email, scoping OPERATOR
  en getById, y 404 en vez de 500. Sin esto el frontend queda construido sobre un contrato
  inseguro y roto."
- L4 — mapping evidence (source-verified, session 2026-10-13):
  - `backend/src/main/java/es/construformas/api/model/User.java` has no `@JsonIgnore` on
    `password`; there is zero `@JsonIgnore` usage anywhere in the `model` package, and
    `UserController` returns the raw entity — so `GET /api/users` ships every BCrypt hash.
  - `User.role` is `@Deprecated @Transient` (column dropped in V9) and serializes as `null`;
    the real data is `Set<Role> roles` (EAGER many-to-many, `Role` = `{id,name,description}`).
  - `UserService.update()` reads only `name/phone/nie/roles/active`; it ignores `email`,
    `password` and `availability`.
  - `UserAvailability` = `AVAILABLE|ON_SITE|PARTIALLY_AVAILABLE|UNAVAILABLE`; the UI offers
    `AVAILABLE|ON_LEAVE|INACTIVE`.
  - `UserService.findById()` throws `IllegalArgumentException` → HTTP 400 (not 500, not 404;
    corrected below in the Log after reading `GlobalExceptionHandler`).
  - `UserController.getById` is `hasAnyRole('ADMIN','OPERATOR')` with no ownership check.
  - `UserRepository.findByRole(UserRole)` is `@Deprecated` and derives from the transient field.
  - `spring.jpa.open-in-view: true`, so the LAZY `currentProject` serializes.
  - Frontend already uses signals + `app-*` components; the sidebar already exposes
    `Usuarios` with `adminOnly: true`, gated by `roles.includes('ROLE_ADMIN')`
    (`frontend/src/app/shell/sidebar/sidebar.component.ts:60`); the route is commented out at
    `frontend/src/app/app.routes.ts:39`.

## Specs

### S1 — No credential material in any user response
`GET /api/users`, `GET /api/users/{id}`, `POST /api/users` and `PUT /api/users/{id}` MUST NOT
include the `password` field in the JSON response body. Acceptance: a test asserts the serialized
user payload contains no `password` key while `password` still reaches `create()`/`update()` as a
request field. No other response field may disappear.

### S2 — `PUT /api/users/{id}` honours the fields it accepts
`update()` MUST apply `email`, `roles` and `availability` in addition to the fields it already
applies (`name`, `phone`, `nie`, `active`). Omitted fields keep their current value. Changing
`email` to an address already used by another user MUST fail rather than silently overwrite.
Acceptance: a test proves an ADMIN can change a user's roles, email and availability in one call
and that the persisted user reflects all three.

### S3 — OPERATOR can only read its own record; unknown ids are 404
`GET /api/users/{id}` MUST allow an OPERATOR only when the requested id equals the authenticated
user's id, returning 403 otherwise. An unknown id MUST return 404, not 500. Acceptance: tests
assert OPERATOR + own id → 200, OPERATOR + other id → 403, authenticated + unknown id → 404,
ADMIN + any existing id → 200.

### S4 — Frontend `User` type matches the post-RBAC contract
`frontend/src/app/features/users/types/user.types.ts` MUST declare `roles: Role[]` where
`Role = { id: number; name: string; description?: string }`, and MUST declare
`availability` as `'AVAILABLE' | 'ON_SITE' | 'PARTIALLY_AVAILABLE' | 'UNAVAILABLE'`. The single
`role: UserRole` field MUST be removed. No `MANAGER` option is offered: only the `ADMIN` and
`OPERATOR` rows seeded by `V9__roles_and_availability.sql` exist.

### S5 — Availability is edited through its own endpoint with real values
The UI MUST persist availability via `PUT /api/users/{id}/availability` and MUST offer exactly the
four backend values with Spanish labels: Disponible / En sitio / Parcialmente disponible /
No disponible. Acceptance: a test asserts that selecting "En sitio" issues the availability call
and the table then shows it.

### S6 — Roles are edited as the many-to-many set they are
The modal MUST edit `roles` (multi-select over ADMIN/OPERATOR), not the removed single `role`.
Saving MUST send `roles: [{id, name, description}]`. The table MUST render a badge per role from
`user.roles` instead of `user.role`, so the Rol column is never blank. Acceptance: a test asserts a
user with ADMIN+OPERATOR renders two badges, and that saving with OPERATOR-only persists that set.

### S7 — The module is reachable and correctly gated
The `/users` route MUST be enabled in `frontend/src/app/app.routes.ts`, and the sidebar `Usuarios`
entry MUST remain visible to ADMIN only. Acceptance: `pnpm test` green and `pnpm build` succeeds
with the route enabled.

### S8 — Verification
Both full suites pass: `cd backend && ./mvnw test` and `cd frontend && pnpm test`, plus
`pnpm build`.

### S9 — Role catalog endpoint (added during T3, see Log)
`GET /api/roles` MUST return the role catalog (`{id, name, description}`) to an ADMIN and 403 to
an OPERATOR. Rationale: `roles` is a many-to-many entity set, so the UI needs real role ids to
build the payload; without this endpoint the multi-select would have to guess ids, which fails
whenever no user currently holds a role (e.g. nobody is ADMIN yet, so nobody could be promoted).

## Assumptions (flagged, not silent)
- A1 — Role editing is multi-select because the backend is many-to-many by design (V9 junction
  table, JWT `roles` claim, sidebar `roles.includes`). This follows the existing architecture
  rather than introducing a new product rule.
- A2 — The frontend role filter becomes client-side over `roles[]`. The server endpoint
  `GET /api/users/role/{role}` is backed by a `@Deprecated` derived query on a `@Transient`
  field; whether that endpoint still works at all is verified separately (T1) and reported.
  Removing that endpoint is NOT in scope — it is a public contract others may consume.

## Tasks
- [x] T1 Backend, RED: write failing tests for S1, S2, S3 (no `password` key in payloads;
      update applies email/roles/availability; OPERATOR scoping; 404 for unknown id).
      RED observed: 9 failures + 2 errors over 28 tests. Evidence:
      `UserControllerTest.createShouldNotLeakPassword:72 Expected no value at JSON path
      "$.password" but found: 'raw-secret'`.
- [x] T2 Backend, GREEN: implement S1, S2, S3. Target classes GREEN 28/28, then full backend
      suite GREEN 264/264 (`./mvnw test`, BUILD SUCCESS).
- [x] T6 Backend, roles catalog (S9): RED `RoleControllerTest` (ADMIN 200, OPERATOR 403), then
      GREEN — `RoleController` + `RoleService` exposing `GET /api/roles`.
- [x] T3 Frontend, RED: rewrite `user.types.ts`, `user.service.ts`, `users-table`,
      `user-form-modal`, `users-filters`, `users.component` for S4, S5, S6; tests for each.
      RED observed as TS2305/TS2561 compile failures (`Role` not exported, `roles` not in `User`).
- [x] T4 Frontend, GREEN: enable the route (S7); make the test suite and build pass. Result:
      165 passed / 2 failed — both failures are in `budget-editor.component.spec.ts` and were
      proven pre-existing by re-running the suite with my changes stashed (159 passed, same 2
      failed). `ng build` succeeds.
- [x] T5 Verification (S8): backend `./mvnw test` 266/266 green; frontend `ng test` 165 passed /
      2 failed (both pre-existing in `budget-editor.component.spec.ts`, proven by stash);
      `ng build` succeeds. Three work-unit commits on `dev`: `29bd6d1` (API contract fixes),
      `5d8e3c3` (role catalog), `ca10575` (frontend module).

## Log (running)
- 2026-10-13 — feature doc created on `dev`. Forecast ~750 authored lines (>400). Delivery
  strategy recorded: `ask-on-risk`, same as the previous feature — this repo has no PR flow, so
  the budget crossing is handled by the native RDD review, not by stacked PRs. Push stays the
  human's decision.
- 2026-10-13 — correction to L4: unknown-user ids did NOT return 500. `GlobalExceptionHandler`
  maps `IllegalArgumentException` to **400**, so "User not found" was a 400, not a 404 and not a
  500. Verified in `GlobalExceptionHandler.java:37-46` before implementing.
- 2026-10-13 — T1/T2 done. `User.password` now carries `@JsonProperty(access = WRITE_ONLY)`
  rather than `@JsonIgnore`, so request bodies still accept it while responses never include it.
  `User.role` (the `@Deprecated @Transient` phantom that always serializes as `null`) was left
  untouched on purpose: removing it changes a public response contract nobody asked to change.
  Flagged for the user instead.
- 2026-10-13 — scope addition, decided and disclosed: added `GET /api/roles` (S9) plus
  `RoleService`/`RoleControllerTest`. The many-to-many `roles` payload needs real role ids and
  the frontend had no way to obtain them; guessing ids (V9 seeds ADMIN then OPERATOR) breaks as
  soon as no user currently holds a role. Additive endpoint, not a new requirement.
- 2026-10-13 — scope addition, decided and disclosed: added `app-checkbox` to
  `components/shared/`. S6 requires a multi-select for roles and the design system had no
  checkbox primitive; `app-select` is single-value only. Built as an application-owned
  ControlValueAccessor matching the other `app-*` primitives, per the frontend-ui-abstraction
  contract, rather than dropping a raw native control into the modal.
- 2026-10-13 — pre-existing failure documented, not fixed (out of scope):
  `budget-editor.component.spec.ts` has 2 failing tests. Proven pre-existing by stashing my
  changes and re-running: 159 passed / 2 failed before, 165 passed / 2 failed after.
- 2026-10-13 — pre-existing condition documented: `ng build` reports the initial bundle over its
  750 kB budget (897.50 kB before this feature, 909.56 kB after — about 12 kB added by the
  users module). Not caused by this change; not addressed here.
