# Tasks: Automatic Quote Invoicing

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 900–1,150 |
| 400-line budget risk | High |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 persistence → PR 2 transactional workflow → PR 3 API and UI |
| Delivery strategy | force-chained |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal and boundary | Likely PR / dependency | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Persistence contract only: V12, entities, repositories, PostgreSQL tests; no approval behavior. | PR 1 (est. 300–400); base = feature/tracker branch. | `mvn test -Dtest=AutomaticQuoteInvoicingPostgresIT` | Testcontainers PostgreSQL: parallel allocation and immutable-event trigger. | Revert V12 and lifecycle/sequence/entity/repository changes together. |
| 2 | Transactional backend approval/removal and service tests; depends on PR 1. | PR 2 (est. 300–400); base = PR 1 branch. | `mvn test -Dtest=BudgetServiceTest` | Authenticated ADMIN approves, then confirms draft removal in a Spring test. | Revert `BudgetService`/`InvoiceService` orchestration and its tests only. |
| 3 | Secured HTTP contract and budget UI with controller/frontend tests; depends on PR 2. | PR 3 (est. 300–350); base = PR 2 branch. | `mvn test -Dtest=BudgetControllerTest` + `pnpm test -- --run` | Local ADMIN approval, confirmation, list refresh, and lifecycle display. | Revert controller and budget API/UI/history changes only; retain backend workflow. |

### Chain Boundaries

- PR 1 starts from the tracker branch and ends with schema-backed persistence contracts; exclude service, controller, and UI changes.
- PR 2 starts from PR 1 and ends with all-or-nothing domain behavior; exclude HTTP and frontend wiring.
- PR 3 starts from PR 2 and ends with user-visible API/UI flow. Retarget/rebase any polluted child diff before review.

## Phase 1: Persistence Foundation

- [x] 1.1 RED: add `AutomaticQuoteInvoicingPostgresIT` for Flyway schema, unique `source_budget_id`, concurrent annual numbers, and event update/delete trigger rejection.
- [x] 1.2 GREEN: create `backend/src/main/resources/db/migration/V12__automatic_quote_invoicing.sql`; add source link, soft-delete fields/indexes, annual sequence, lifecycle table, and immutable trigger.
- [x] 1.3 GREEN: add `DocumentLifecycleEvent`, `InvoiceYearSequence`, mappings in `Budget`/`Invoice`, and repositories that filter deleted documents but retain lifecycle reads.

## Phase 2: Atomic Backend Workflow

- [x] 2.1 RED: extend `BudgetServiceTest` for ADMIN eligibility/repeat rejection and invoice-save failure rolling back budget, counter, invoice, and events.
- [x] 2.2 RED: cover copied project/client/terms/items, negative VAT discount lines, totals, and draft-only confirmed soft removal; issued/paid remains unchanged.
- [x] 2.3 GREEN: update `BudgetService.java` and `InvoiceService.java` to transact approval, allocate `INV-YYYY-NNN`, snapshot lines, calculate totals, and append events.
- [x] 2.4 GREEN: implement confirmed approved-budget soft removal and lifecycle retrieval in `BudgetService.java` and related repositories.

## Phase 3: Secured API Contract

- [x] 3.1 RED: extend `BudgetControllerTest` for ADMIN-only approval, missing/false `confirmed`, issued/paid protection, and authorized lifecycle history after removal.
- [x] 3.2 GREEN: update `BudgetController.java` to resolve actor from `SecurityContext`, require ADMIN approval/removal, accept `confirmed=true`, and expose `GET /{id}/lifecycle`.

## Phase 4: Budget UI and Verification

- [x] 4.1 RED: create budget service/component specs: cancelled removal sends no DELETE; confirmed removal sends `confirmed=true`, refreshes state, and renders lifecycle metadata.
- [x] 4.2 GREEN: update `budget.service.ts`, `budget.types.ts`, `budgets.component.ts`, and budget components to confirm removal, show success/error and linked invoice/history.
- [x] 4.3 Run `mvn test`, PostgreSQL Testcontainers tests, `pnpm test -- --run`, and `pnpm build`; record results and resolve the invoice-prefix/padding question before release.
