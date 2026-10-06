# Feature: health uptime + lifecycle logging

## Objective
Make `GET /health` report application uptime/started time (details in `/health/internal`), expose the `/startup` timeline endpoint, and log availability/shutdown transitions (option A from the plan).

## Problem / Why
Health only reports component statuses. Uptime and start time live only in metrics (`process.uptime`, `process.start.time`), which the user did not know how to access. There is no visibility of when the service went up or was asked to stop without reading raw metrics or raw logs.

## Scope
### In
- `ApplicationLifecycleListener`: logs on `ApplicationReadyEvent`, `AvailabilityChangeEvent`, `ContextClosedEvent`; holds `readyAt`.
- `UptimeHealthIndicator`: component `applicationUptime` with details `startedAt`, `readyAt`, `uptimeSeconds`, `readiness`, `liveness`.
- `application.yml`: expose `startup` endpoint.
- Tests (strict TDD, RED first): unit tests for both beans + `HealthEndpointTest` assertions + `/startup` auth tests.

### Out
- Option B (file marker for unclean shutdown), DB history table, Prometheus/percentiles.
- CORS/proxy coverage for `/health`, anonymous→401 fix, any security changes beyond current state.
- Making health details public (details stay in `/health/internal`; public `/health` shows only component status).

## Constraints
- Strict TDD: RED → GREEN. Test runner: `./mvnw test` (backend module).
- Log strings and code artifacts in English (Language Domain Contract).
- Never stage: `frontend/playwright-report/index.html`, `odd/tasks/budget-client-drift.md`.
- RDD: slice base `30dddf4` (279 lines). After these commits (~250-280 more) expect `review_due: true` (`slice_budget_reached`); native preflight + consent is the user's decision — never skip, never auto-approve.
- Delivery: direct conventional commits on `dev` (no PR flow in this repo); push stays the human's decision.
- Delivery strategy recorded: `ask-on-risk` — no PR chain applies here; the budget crossing is handled by the native RDD review, not by stacked PRs.

## Tasks
- [x] T1 Write failing tests first: `health/UptimeHealthIndicatorTest`, `health/ApplicationLifecycleListenerTest`, and `HealthEndpointTest` additions (public `applicationUptime` status without details, internal details keys, `/startup` 403/200). Run tests → RED observed.
- [x] T2 Implement `ApplicationLifecycleListener` (ready/availability/closed events, logs, `readyAt`).
- [x] T3 Implement `UptimeHealthIndicator` + `application.yml` exposure `health,metrics,startup` → suite GREEN.
- [x] T4 Full verification: `./mvnw test` (237 tests, 0 failures).
- [x] T5 Two work-unit commits on `dev` (`feat(health): ...`, `feat(lifecycle): ...`), then `gentle-ai review assess --cwd /home/alan/dev/erp-construformas --agent opencode --base-ref 30dddf4 --committed-only --json`.

## Acceptance criteria
- `GET /health` (anonymous): `components.applicationUptime.status = UP`, no `details` key.
- `GET /health/internal` (token): details contain `startedAt`, `readyAt`, `uptimeSeconds`, `readiness`, `liveness`.
- `GET /metrics/process.uptime` and `/metrics/process.start.time` still serve (already registered by Micrometer).
- `GET /startup`: 403 anonymous, 200 authenticated.
- After container redeploy, `docker logs erp-backend` contains lifecycle lines (ready, availability, shutdown on SIGTERM).
- Full test suite green.

## Route / delegation evidence
- T1-T4 delegated to one writer: mapping trigger (4+ files to understand + implement), writer trigger (2+ non-trivial files). Skill injected: `work-unit-commits`.
- T5: parent orchestrator (assess + consent relay is parent-owned).

## Progress
- T1 RED: HealthEndpointTest — `Missing property in path $['components']['applicationUptime']`; `/startup` authenticated → 500 (`No static resource startup`). Unit tests compile-RED: `cannot find symbol: class ApplicationLifecycleListener` / `class UptimeHealthIndicator`.
- T2/T3 GREEN: focused suite `Tests run: 22, Failures: 0`; full suite `Tests run: 237, Failures: 0`.
- Boot 4 discovery: `HealthIndicator` moved to `org.springframework.boot.health.contributor.HealthIndicator`; `AvailabilityChangeEvent` only carries the new state (listener tracks previous); `/startup` requires `BufferingApplicationStartup` on the context — wired via `BufferingApplicationStartupInitializer` (spring.factories) + `ApiApplication.main()`; exposure `health,metrics,startup`.
- Commits: see `git log --oneline -3` after T5.
