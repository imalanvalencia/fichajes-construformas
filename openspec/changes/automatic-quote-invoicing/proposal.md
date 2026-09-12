# Proposal: Automatic Quote Invoicing

## Intent

Make ADMIN approval of a budget atomically create its traceable draft invoice, preventing duplicate billing and preserving a visible record when the approved budget is later removed.

## Scope

### In Scope
- Allow ADMIN only to approve a non-approved budget and create one linked `DRAFT` invoice in the same transaction.
- Allocate a concurrency-safe annual sequential invoice number; copy project client, approval date, payment terms, item snapshots, and discounts as negative VAT-bearing lines.
- Reject repeated approval and roll back approval if invoice creation fails.
- Let ADMIN confirm removal of an approved budget; logically remove it and only its linked automatic `DRAFT` invoice in one transaction.
- Add an append-only, visible lifecycle history for approval, automatic invoice creation, and confirmed removal, including actor, timestamp, and linked document identifiers.
- Require a frontend confirmation before the approved-budget removal request.

### Out of Scope
- Deleting, voiding, or modifying `ISSUED`/`PAID` invoices; issued invoices remain intact.
- A platform-wide audit framework, arbitrary deletion reasons, legal document archival, or retrospective history for existing records.
- Frontend-generated invoices, asynchronous processing, or changes to manual invoicing.

## Capabilities

### New Capabilities
- `automatic-quote-invoicing`: Atomic ADMIN budget approval, linked draft invoice generation, protected removal, and document lifecycle history.

### Modified Capabilities
None — no baseline OpenSpec capabilities exist.

## Approach

Orchestrate approval, invoice-number allocation, copied invoice lines, totals, source-budget uniqueness, and history writes in one backend transaction. Use a forward Flyway migration for the one-to-one source link, annual sequence coordination, logical-deletion state, and append-only audit events. Expose history with the document workflow; removal hides documents from normal lists but retains their lifecycle records.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/.../BudgetService.java` | Modified | Atomic approval/removal orchestration. |
| `backend/.../InvoiceService.java` | Modified | Generated draft and totals support. |
| `backend/.../model/{Budget,Invoice}.java` | Modified | Source link and logical deletion. |
| `backend/.../db/migration/` | New | Links, sequence, and audit history schema. |
| `frontend/src/app/features/budgets/` | Modified | Approval/removal feedback and confirmation. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Concurrent number collision | Med | Database-backed annual allocation and uniqueness. |
| Tax totals diverge | Med | Negative discount lines and transactional total recalculation. |
| Audit grows unbounded | Low | Scope events to this lifecycle; retain immutable records. |

## Rollback Plan

Disable automatic approval orchestration and retain all migrated history/source data; restore the prior approval path only after reconciling affected drafts. Do not hard-delete audit records or issued invoices.

## Dependencies

- Existing Spring transactions, PostgreSQL/Flyway, and ADMIN authorization.

## Success Criteria

- [ ] Each successful ADMIN approval yields exactly one linked `DRAFT` invoice with correct totals and copied terms.
- [ ] Repeats, failures, and concurrent approvals cannot duplicate invoices or commit partial approval.
- [ ] Confirmed ADMIN removal preserves a visible approval/removal history and affects no issued invoice.
