# Design: Automatic Quote Invoicing

## Technical Approach

Extend the existing `BudgetController -> BudgetService` approval path. One Spring transaction will validate ADMIN authorization and eligibility, allocate an annual number in PostgreSQL, persist a linked draft invoice and immutable line snapshots, recalculate totals, approve the budget, and append lifecycle events. This implements all requirements in `specs/automatic-quote-invoicing/spec.md` without changing manual invoicing.

## Architecture Decisions

| Decision | Options / trade-off | Choice and rationale |
|---|---|---|
| Orchestration | Frontend/asynchronous job vs service transaction | `BudgetService` transactional orchestration; the existing controller already delegates approval there, and synchronous rollback prevents partial approval. |
| Number allocation | `MAX()+1` vs database counter | PostgreSQL atomic upsert on `invoice_year_sequences`; `MAX()+1` races. Store `year` and `last_value`; format as existing `INV-YYYY-NNN` convention. |
| Source relationship | Infer by project vs unique FK | Nullable `invoices.source_budget_id` with a unique constraint. It identifies automatic invoices unambiguously while leaving manual invoices unchanged. |
| Removal/audit | Hard delete / mutable log vs soft delete / append-only log | Add deletion metadata to budget/invoice and `document_lifecycle_events`. PostgreSQL trigger rejects event update/delete; source data and history survive removal. |

## Data Flow

```
ADMIN UI -> POST /api/budgets/{id}/status?status=APPROVED
  -> BudgetService @Transactional
  -> lock/upsert yearly counter -> Invoice + InvoiceItem snapshots
  -> Budget(APPROVED) + APPROVED/INVOICE_CREATED events -> commit

ADMIN UI confirmation -> DELETE /api/budgets/{id}?confirmed=true
  -> transactional draft-link/status check -> set deletedAt/deletedBy
  -> BUDGET_REMOVED event -> commit
```

The service loads current budget items and discounts. It copies each item into an `InvoiceItem`; each `BudgetDiscount` becomes a negative-price invoice item using the invoice VAT rate. It derives subtotal, tax, and total from copied lines, copies project client, `approvedAt` as issue context, and payment terms to notes/terms. Any persistence, counter, or event failure propagates and rolls back the entire transaction.

## File Changes

| File | Action | Description |
|---|---|---|
| `backend/src/main/resources/db/migration/V12__automatic_quote_invoicing.sql` | Create | Forward schema: source FK/unique index, soft-delete metadata/indexes, annual counter, lifecycle event table and immutability trigger. |
| `backend/src/main/java/es/construformas/api/model/{Budget,Invoice}.java` | Modify | Map source and deletion fields. |
| `backend/src/main/java/es/construformas/api/model/{InvoiceItem,DocumentLifecycleEvent,InvoiceYearSequence}.java` | Create/Modify | Snapshot metadata where needed, immutable event, and counter entity. |
| `backend/src/main/java/es/construformas/api/repository/{Budget,Invoice,DocumentLifecycleEvent,InvoiceYearSequence}Repository.java` | Modify/Create | Exclude soft-deleted records; linked-invoice/event reads and locked/atomic number allocation. |
| `backend/src/main/java/es/construformas/api/service/{Budget,Invoice}Service.java` | Modify | Approval/removal orchestration, snapshot construction, totals, and events. |
| `backend/src/main/java/es/construformas/api/controller/BudgetController.java` | Modify | ADMIN-only approval; require `confirmed=true` for approved-budget removal; add authorized history read. |
| `frontend/src/app/features/budgets/{budgets.component.ts,services/budget.service.ts,types/budget.types.ts}` | Modify | Confirmation request, success/error feedback, and lifecycle DTO/service. |
| `frontend/src/app/components/budgets/` | Modify/Create | Show approval-created invoice and persistent lifecycle history; refresh signals from mutation response/list reload. |
| `backend/src/test/java/es/construformas/api/{service,integration,controller}/...` | Modify/Create | Service, MockMvc, migration/repository, and PostgreSQL concurrency coverage. |
| `frontend/src/app/features/budgets/**/*.spec.ts` | Create | Confirmation and lifecycle rendering/service tests. |

## Interfaces / Contracts

```java
DELETE /api/budgets/{id}?confirmed=true  // ADMIN; false/missing => rejection
GET /api/budgets/{id}/lifecycle          // authorized document viewer

Invoice { Long sourceBudgetId; LocalDateTime deletedAt; User deletedBy; }
Budget  { LocalDateTime deletedAt; User deletedBy; }
DocumentLifecycleEvent { EventType type; Budget budget; Invoice invoice;
                         User actor; LocalDateTime occurredAt; }
```

Approval remains `POST /api/budgets/{id}/status?status=APPROVED`, but its guard becomes `hasRole('ADMIN')`; actor identity is always resolved from `SecurityContext`, never a client-provided user id. Normal budget/invoice list and lookup repository methods filter `deletedAt IS NULL`; lifecycle queries deliberately do not.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (RED first) | ADMIN/repeat rejection, copied lines/discount VAT/totals, rollback propagation, draft-only soft removal | Mockito `BudgetServiceTest`; verify no partial writes. |
| Integration (RED first) | Flyway schema, MockMvc authorization/confirmation/history, soft-delete list exclusion and issued/paid protection | Spring Boot + MockMvc; use authenticated ADMIN/OPERATOR fixtures. |
| PostgreSQL integration (RED first) | simultaneous approvals allocate distinct contiguous annual values; event trigger rejects mutation | Testcontainers PostgreSQL, parallel transactions; H2 cannot prove PostgreSQL upsert/trigger semantics. |
| Frontend unit (RED first) | cancelled confirmation sends no request; confirmed removal refreshes; history is rendered | Angular TestBed/Vitest with `HttpTestingController`. |

## Threat Matrix

| Boundary | Applicability | Design response / RED tests |
|---|---|---|
| Documentation-like paths | N/A — HTTP API does not classify or execute files. | None. |
| Git repository selection | N/A — no VCS command/path selection. | None. |
| Commit state | N/A — no commit operation. | None. |
| Push state | N/A — no push operation. | None. |
| PR commands | N/A — no PR command composition. | None. |

## Migration / Rollout

Ship one additive Flyway migration; existing documents retain null source/deletion fields and are visible. Deploy backend and migration before the frontend. Rollback disables the new orchestration but never removes counters, source links, or events. No historical backfill is required.

## Open Questions

- [ ] Confirm whether the statutory invoice-number prefix/padding must differ from the established `INV-YYYY-NNN` format.
