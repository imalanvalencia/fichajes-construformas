# Feature: clock (fichajes) repair and re-enable

File locator: odd/tasks/clock-rework.md (repo: /home/alan/dev/erp-construformas)
Branch: dev. Test runner: backend `cd backend && mvn test` (JUnit + MockMvc, Strict TDD), frontend `cd frontend && pnpm test`, e2e `cd frontend && pnpm test:e2e`.
Delivery strategy: ask-on-risk (raise when authored changed lines exceed ~400).

## Objective

Repair the existing clock (fichajes) feature instead of rebuilding it: align the
frontend/backend contract, derive identity and location automatically, move the UI onto
the current design system, and switch the route and sidebar entry back on.

## Specs

### S1 — Flat clock-entry contract

The API must speak one flat shape in both directions: `id`, `userId`, `userName`,
`projectId`, `projectName`, `clockType`, `userLatitude`, `userLongitude`, `timestamp`,
`notes`. `POST /api/clock-entries` accepts that shape; `GET /api/clock-entries/{id}` and
`GET /api/clock-entries/user/{userId}` return that shape, so the table's
`entry.userName` / `entry.projectName` columns resolve. The existing unused
`ClockEntryDTO` is the starting point but its `latitude`/`longitude` fields must be
renamed to `userLatitude`/`userLongitude` to match the entity and the frontend
`ClockEntry` type (`frontend/src/app/features/clock/types/clock.types.ts`).

Acceptance: a POST with a flat body returns 201 with a flat body; a GET returns flat
bodies carrying `userName` and `projectName`; no nested `user`/`project` objects leak
into any response. Check: `ClockEntryControllerTest`.

### S2 — Identity comes from the authenticated session

Verbatim from the user's chosen scope: "Usuario desde el JWT (nadie escribe su ID)".

The authenticated caller's identity decides whose fichaje is recorded: the service
resolves the user from the authenticated principal (JWT subject = email) and does not
trust a client-supplied `userId`. A body `userId` different from the authenticated user
is rejected unless the caller holds `ROLE_ADMIN` (admin may clock on behalf of someone
else). `AuthResponse` gains the user's `id` so the frontend can scope "my entries" and
my corrections without guessing.

Acceptance: OPERATOR posting `userId` of another user gets 403/400; OPERATOR posting
their own (or no) `userId` succeeds; ADMIN posting another user's `userId` succeeds.
`AuthResponse` serializes `id`. Check: `ClockEntryControllerTest`, `AuthServiceTest`.

### S3 — Geolocation validation is preserved

Existing behavior must keep holding: `HaversineUtil.isWithinRadius(...)` rejects a
fichaje outside `project.allowedRadiusMeters` with
`"User is outside the allowed radius for this project"` (`ClockEntryService.java:33-38`).
No fichaje may be recorded with fabricated coordinates.

Acceptance: unchanged `ClockEntryServiceTest` radius cases still pass; the frontend never
submits `0,0` as a fallback when geolocation is denied.

### S4 — Frontend derives user, location and project

Verbatim from the user's chosen scope: "geolocalización automática del navegador,
selector real de proyectos".

The register modal must not ask for "Usuario ID" or "Proyecto ID" as free-typed numbers
nor for manual lat/long: the current user comes from `AuthService.getUser()`, the project
comes from `ProjectService.getAll()` rendered as a selector, and the coordinates come
from `navigator.geolocation`. Denying permission produces a visible error and no request.

Acceptance: no numeric "Usuario ID"/"Proyecto ID"/"Latitud"/"Longitud" inputs remain in
the modal; permission denial blocks submission with an error message. Check:
`clock.component.spec.ts`.

### S5 — UI follows the current design-system idiom

The clock screens use the same idiom as the users module (`UsersComponent`): signals
`input()`/`output()`, `app-card`, `app-input`, `app-select`, `app-button`, shared table,
and `NotificationService` for feedback instead of `confirm()`/silent `subscribe`.
`[value]`/`(valueChange)` on `app-input`/`app-select` IS the current idiom and stays.

Acceptance: delete confirmation and every register/load outcome surface through
`NotificationService` (success/error), API errors are never swallowed by an empty
`subscribe`, and rendered state (`showModal`) is a signal like `UsersComponent`.

### S6 — Route and sidebar re-enabled

`frontend/src/app/app.routes.ts:38` (`// { path: 'clock', component: ClockComponent }`)
and the sidebar entry (`// { icon: 'home', label: 'Fichajes', route: '/clock' }`) become
live. The sidebar item is visible to ADMIN and OPERATOR (the API's own
`@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` scope) and uses a real clock icon
instead of the placeholder `home`.

Acceptance: `/clock` renders for an authenticated OPERATOR and ADMIN; the entry is
absent for roles outside that scope.

### S7 — Corrections screen for ADMIN

Verbatim from the user's chosen scope: "pantalla de aprobación de correcciones para
ADMIN". The existing `GET /api/clock-corrections/pending`,
`PUT /{id}/approve` and `PUT /{id}/reject` (ADMIN only) get a UI: a list of pending
corrections with reason, corrected time and original fichaje, plus approve/reject
actions. `ClockCorrectionDTO` must be flat (no nested `user`/`project`/`reviewedBy`
entities) for the same reason as S1.

Contract notes: `PUT /{id}/approve` and `PUT /{id}/reject` take no `reviewerId` parameter —
the reviewer is the authenticated ADMIN; correction creation derives its target user with
S2's rule; a client may not set `status` on creation (the service assigns `PENDING`).

Acceptance: ADMIN sees pending corrections and can approve and reject them; OPERATOR
sees no approve/reject controls. Check: `ClockCorrectionControllerTest`,
corrections component spec.

## Tasks

| ID | Specs | Route | Status | Evidence |
|----|-------|-------|--------|----------|
| T1 | S1, S3 | inline | done | `ClockEntryControllerTest` 5/5; full backend suite 270/0 |
| T2 | S2 | inline | done | `ClockEntryServiceTest` 11/11, `AuthServiceTest` 8/8; full backend suite 270/0 |
| T3 | S7 | inline | done | `ClockCorrectionControllerTest` 5/5, `ClockCorrectionServiceTest` 5/5; full backend suite 271/0 |
| T4 | S4, S5 | inline | done | `clock.component.spec.ts` 9/9; frontend suite 174 passed, 2 pre-existing `budget-editor` failures verified at baseline; commit c3461dd |
| T5 | S7 | inline | done | `clock-corrections.component.spec.ts` 7/7; frontend suite 182 passed, 2 pre-existing `budget-editor` failures |
| T6 | S6 | inline | done | `app.routes.spec.ts` 1/1, `sidebar.component.spec.ts` 3/3 (RED observed 4F); frontend suite 186 passed, 2 pre-existing `budget-editor` failures |
| T7 | S1-S7 | inline | done | final verification: backend `Tests run: 271, Failures: 0`; frontend 186 passed, 2 pre-existing `budget-editor` failures |

Route evidence: delegation to `gentle-ai-explore`/`gentle-ai-worker` failed at launch
with a provider error ("OpenCode's free tier can only be used from within OpenCode"), so
every task runs inline in the parent session.

## Known environmental failures

- `frontend/src/app/components/budgets/budget-editor/budget-editor.component.spec.ts` has 2
  failing tests ("defaults and clamps a new item quantity to one" and a related DOM assertion).
  Verified pre-existing: running that spec with every clock change stashed
  (`git stash push -u -- <clock paths>`) fails identically, so it is not caused by this feature.

## Log

L1 (2026-10-13) — User's original request verbatim: "vamos a implementar los fichajes nuevamente"

L2 (2026-10-13) — Scope answer 1, verbatim: "Reparar y reactivar (Recomendado)" (repair and
re-enable rather than rebuild from scratch).

L3 (2026-10-13) — Scope answer 2, verbatim: "Reparación de fondo (Recomendado)", whose option
text was: "Usuario desde el JWT (nadie escribe su ID), geolocalización automática del
navegador, selector real de proyectos, DTO alineado en backend, UI con el sistema de
diseño actual, ruta + sidebar activos, y pantalla de aprobación de correcciones para ADMIN."

L4 (2026-10-13) — Baseline evidence: backend V7 migration, `ClockEntryController` /
`ClockCorrectionController` with RBAC, Haversine validation and service/controller tests all
exist; frontend route and sidebar entries are commented out (`app.routes.ts:38`,
`sidebar.component.ts:59`) and the frontend sends flat `userId`/`projectId` while the JPA
entity expects nested `user`/`project`. `ClockEntryDTO` exists but is unused and names
fields `latitude`/`longitude`. Assumption recorded as assumption: resolving identity from the
JWT subject (email) is preferred over trusting a body `userId`.

L5 (2026-10-13) — T1+T2 implemented under strict TDD. RED first: 3 controller assertions failed
on `$.userId`/`$.userName`, then a compile failure on `AuthResponse.getId()`. GREEN after
introducing `ClockEntryMapper` (flat wire contract in/out), resolving the target user from the
authenticated caller (`SecurityUtils.getCurrentUser`), denying OPERATOR cross-user clock-ins with
`AccessDeniedException`, and adding `id` to `AuthResponse`. Backend suite after the change:
`Tests run: 270, Failures: 0, Errors: 0`.

L6 (2026-10-13) — Spec correction, not a scope change: S5's original acceptance line ("no
`[value]`/`(valueChange)` bindings remain") was wrong — inspecting `user-form-modal.component.ts`
shows `[value]`/`(valueChange)` IS the current idiom of `app-input`/`app-select`. S5's acceptance
criteria were rewritten to the real gaps: `NotificationService` feedback instead of `confirm()` and
silent `subscribe`, and rendered state as signals like `UsersComponent`.

L7 (2026-10-13) — T3 (corrections) implemented under strict TDD, RED on the `approve`/`reject`
signature compile error, GREEN after: `ClockCorrectionDTO` wired end to end with a new
`ClockCorrectionMapper`, so no `user`/`project`/`originalEntry`/`reviewedBy` entity leaks into a
correction response; the reviewer is now resolved from the authenticated session instead of the
`reviewerId` query parameter (that parameter was removed from both endpoints); `requestCorrection`
resolves its target user with the same `SecurityUtils.resolveTargetUser` rule as clock-ins (S2's
principle applied to a sibling endpoint, recorded here as an assumption-driven extension rather
than a new requirement); and the client can no longer set a correction's `status`, which
previously let any caller submit `APPROVED` and self-approve. Full backend suite after T3:
`Tests run: 271, Failures: 0, Errors: 0`.

L8 (2026-10-13) — Delivery: the user chose "PRs encadenados (feature-branch-chain)". Structure:
`feat/clock-rework-01-entry-contract` (T1+T2, 258 changed lines), child
`feat/clock-rework-02-corrections-contract` (T3). Remaining slices: T4 frontend rework, then
T5+T6 (corrections UI + route/sidebar). No push and no PR have been created yet.

L9 (2026-10-13) — Slice #2 review (RDD): `gentle-ai review assess` returned `risk: high`
(hot path, security lens territory) and presented the candidate consent envelope; the user
declined it (`consent: declined_this_candidate`), so T3's commit ships under ordinary
repository policy with no review receipt. Decline is candidate-scoped and does not disable
RDD for later slices.

L10 (2026-10-13) — T4 (frontend rework) implemented under strict TDD. RED first: 8 assertions
failed in `clock.component.spec.ts`. GREEN after: new `GeolocationService`
(`frontend/src/app/features/clock/services/geolocation.service.ts`) wrapping the browser
geolocation API (S4), `ClockComponent` reworked with a real project selector loaded from the
active projects endpoint and no typed user ID or coordinate inputs (S4), flat
`clock.types.ts` DTOs matching the backend mapper, and `AuthResponse.id` made optional.
`clock.component.spec.ts` 9/9. Full frontend suite: 174 passed with 2 pre-existing
`budget-editor.component.spec.ts` failures, verified as baseline by re-running that spec with
every clock change stashed. Untracked files left out of this slice (parallel PDF work):
`ProjectFinancialSummaryDTO.java`, `budget-pdf-new.html`, `favicon.ico`.

L11 (2026-10-14) — T5 (S7 corrections approval UI) implemented under strict TDD. RED first:
the spec did not compile (missing component and service). GREEN after: new
`ClockCorrectionService` (`/api/clock-corrections` with `getPending`/`approve`/`reject`, no
`reviewerId` ever sent) and `ClockCorrectionsComponent`, an ADMIN-only pending-corrections
table (reason, corrected time, original fichaje badge, Aprobar/Rechazar) rendered from
signals with `NotificationService` feedback. The panel is gated by an `isAdmin` signal input
on `ClockComponent` (`auth.hasRole('ADMIN')`), so an OPERATOR never renders the controls nor
triggers the ADMIN-only pending endpoint. `clock-corrections.component.spec.ts` 7/7 (6 ADMIN
+ 1 OPERATOR gating), `clock.component.spec.ts` 10/10 including a new OPERATOR gating test.
Full frontend suite: 182 passed, 2 pre-existing `budget-editor` failures unchanged. Design
note: `reject` sends an empty body because the backend endpoint takes no observation
parameter — recording one would be a new requirement, not part of S7.

L12 (2026-10-14) — T6 (S6 route + sidebar) implemented under strict TDD. RED first: 4
assertions failed (clock route commented out; no "Fichajes" nav item for any role). GREEN
after: `app.routes.ts` line 38 uncommented (`{ path: 'clock', component: ClockComponent }`
inside the authenticated shell), and the sidebar entry re-enabled as
`{ icon: 'schedule', label: 'Fichajes', route: '/clock', roles: ['ADMIN', 'OPERATOR'] }` —
a real clock icon instead of the `home` placeholder. NavItem gained an optional `roles`
filter applied through `AuthService.hasRole`, so an ADMIN or OPERATOR sees the entry while
roles outside the API's `hasAnyRole('ADMIN','OPERATOR')` scope do not; the existing
`adminOnly` filter is untouched. New specs: `app.routes.spec.ts` 1/1,
`sidebar.component.spec.ts` 3/3. Full frontend suite: 186 passed, the same 2 pre-existing
`budget-editor` failures. Observation (not a change): `visibleNavItems` still gates the
`adminOnly` "Usuarios" entry with `roles.includes('ROLE_ADMIN')` while login responses
return unprefixed `ADMIN` — pre-existing, outside S6's scope, left alone.

L13 (2026-10-14) — T7 (final verification): backend `./mvnw -o test` → `Tests run: 271,
Failures: 0, Errors: 0, Skipped: 0`, BUILD SUCCESS; frontend `ng test` → 186 passed with
only the 2 documented pre-existing `budget-editor` failures. All specs S1-S7 are covered by
their checks. RDD assess on the work-unit commits: `3f26020`→`bdef49d` and
`bdef49d`→`70ee0d5` both returned `medium / under_budget` — no review due, boundaries
advanced. Slice #2 (`02b6b4d`) was `high` with consent declined (L9). Remaining: push +
feature-branch-chain PRs, which are the user's decision.

L14 (2026-10-16) — Delivery: the four branches were pushed and the chain was structured as
six PRs (draft tracker + five children) to honor the chained-pr 400-line review budget.
Branch `feat/clock-rework-03-frontend-rework` was split by task boundary into
`...-03-clock-screen` (T4), `...-04-corrections-ui` (T5) and `...-05-route-sidebar`
(T6+T7) without rewriting any commit (same SHAs); the old remote name was deleted as part
of the rename, and the unrelated PDF files remain untouched. PRs: #3 tracker (draft,
`feat/clock-rework` → `dev`, 151), #4 (T1+T2, 258 → #3), #5 (T3, 274 → #4), #6 (T4, 442 →
#5), #7 (T5, 327 → #6), #8 (T6+T7, 114 + this entry → #7). PR #6 (T4) exceeds the
400-line budget by 42 lines: T4 is a single TDD unit whose 179-line spec ships with the
code it verifies, and the only splits would ship an untested intermediate commit or
separate tests from their unit, so `size:exception` is recommended and pending maintainer
acceptance.

L15 (2026-10-16) — User's decision verbatim: "SI ALO ACEPTO" — the maintainer accepts the
`size:exception` for PR #6 (T4, 442/400 authored changed lines, +42), so that slice ships
unsplit with its 179-line spec kept alongside the code it verifies. Exception recorded;
chain fully delivered.
