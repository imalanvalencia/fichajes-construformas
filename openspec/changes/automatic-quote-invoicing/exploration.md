## Exploration: Automatic Quote Invoicing

### Current State
`POST /api/budgets/{id}/status?status=APPROVED` reaches `BudgetController.updateStatus`, which resolves the authenticated user and calls `BudgetService.approve`. That service records the approval and persists the budget, but has no invoice side effect. The Angular budget screen invokes the same endpoint through `BudgetService.approve`.

Invoices are independently created through `InvoiceController.create` and `InvoiceService.create`. An invoice requires a project, client, creator, and a unique invoice number. Invoice line items are persisted separately, and `recalculateTotals` calculates subtotal, VAT, and total from invoice items. Budget line items use the same commercial fields plus `zone`; budget totals include separately stored discounts. No database relationship or uniqueness constraint connects a budget to an invoice.

### Affected Areas
- `backend/src/main/java/es/construformas/api/controller/BudgetController.java` — approval endpoint and authenticated approver resolution.
- `backend/src/main/java/es/construformas/api/service/BudgetService.java` — transaction boundary for approval and the appropriate orchestration point.
- `backend/src/main/java/es/construformas/api/service/InvoiceService.java` — existing invoice/item persistence and total-calculation behavior to reuse or extract.
- `backend/src/main/java/es/construformas/api/model/Invoice.java` — needs traceability to its source budget if the feature must be idempotent and auditable.
- `backend/src/main/java/es/construformas/api/model/BudgetItem.java` and `backend/src/main/java/es/construformas/api/model/InvoiceItem.java` — source line items must be copied, not shared.
- `backend/src/main/resources/db/migration/V3__create_budgets_tables.sql` and `backend/src/main/resources/db/migration/V4__create_invoicing_tables.sql` — establish current schema constraints; a new forward Flyway migration will be needed rather than changing these historical migrations.
- `backend/src/test/java/es/construformas/api/service/BudgetServiceTest.java` and `backend/src/test/java/es/construformas/api/integration/InvoiceIntegrationTest.java` — nearest test suites; they do not cover budget-to-invoice generation today.
- `frontend/src/app/features/budgets/budget.service.ts` and `frontend/src/app/features/budgets/budgets.component.ts` — approval already calls the backend; no client-side invoice creation should be added.

### Approaches
1. **Transactional service orchestration with source linkage** — Have `BudgetService.approve` invoke a focused invoice-generation operation in the same transaction. Persist a draft invoice linked to the approved budget, copy all budget items, and calculate invoice totals.
   - Pros: keeps the business invariant server-side; preserves the existing approval API; supports atomic rollback; a unique source-budget constraint prevents duplicate invoices on repeated approval requests.
   - Cons: requires a forward migration, explicit invoice-number policy, and carefully defined discount/VAT mapping.
   - Effort: Medium.

2. **Frontend-triggered invoice creation after approval** — Keep approval unchanged and have Angular call the invoice API after a successful approval response.
   - Pros: lower initial backend coupling.
   - Cons: non-atomic; retries or navigation can create no invoice or duplicates; exposes invoice-number and total derivation to the client; violates the requirement that approval itself creates the invoice.
   - Effort: Medium.

3. **Asynchronous domain event/queue** — Publish an approval event and generate the invoice asynchronously.
   - Pros: decouples billing work and can support future integrations.
   - Cons: introduces eventual consistency, delivery/idempotency infrastructure, and operational complexity not present in this monolith.
   - Effort: High.

### Recommendation
Use transactional service orchestration with an explicit one-to-one source-budget link. Approval should create one **DRAFT** invoice in the same database transaction, using `budget.project.client` as the invoice client, the approving user as creator, copied item snapshots, and totals calculated from those invoice items. Add a unique `source_budget_id` foreign key on `invoices` (or an equivalent unique association) so repeated approval calls cannot generate duplicates. Keep the existing API response as the approved budget unless a later proposal identifies a UX need to return the created invoice identifier.

The proposal must decide the invoice-number strategy and discount treatment before implementation. Existing invoices require a non-null unique number, and budget discounts are stored outside budget items while invoice totals are item-based. A robust mapping is a copied negative discount line (or a documented invoice-level discount field), followed by the existing VAT calculation; this must match the intended tax semantics.

### Risks
- The existing budget schema migration has no `client_id`, while the JPA `Budget` mapping declares a non-null `client` association named `client _id`; `BudgetService.create` also does not set a client. The implementation should derive the invoice client from `budget.project.client` and separately verify/fix this model-schema inconsistency only if it blocks current runtime behavior.
- There is no current invoice-number generator. Reusing a blank value violates the invoice table's non-null unique constraint; concurrent approvals require a collision-safe number allocation rule.
- `BudgetService.approve` currently accepts approval from ADMIN and OPERATOR roles, whereas manual invoice creation is ADMIN-only. Product policy must confirm whether operator-initiated approval is allowed to create a draft invoice.
- Budget `finalAmount` includes discounts, but invoice `recalculateTotals` derives subtotal and VAT only from invoice items. Without an explicit mapping, generated totals can diverge from the approved budget.
- Existing approval has no guard against approving an already approved budget; source linkage plus a uniqueness constraint and a clear idempotency response are required.

### Ready for Proposal
Yes — the valid change name is `automatic-quote-invoicing`. Before the proposal, confirm: (1) draft versus issued initial invoice status, (2) collision-safe invoice-number format/owner, (3) how discounts and VAT should appear on the invoice, and (4) whether OPERATOR approvals may trigger billing.
