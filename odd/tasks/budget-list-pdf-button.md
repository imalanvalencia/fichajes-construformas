# Feature: budget-list-pdf-button

## Objective
Add a "PDF" action button to the budgets list so a budget PDF can be generated and downloaded without opening the editor.

## Problem / Why
Today the only entry point for `GET /api/budgets/{id}/pdf` is `budget-editor.component.ts` (`onDownloadPdf`, button label "Previsualizar PDF"). The user must navigate into `/budgets/{id}/editor` just to export a document they already see in the list.

## Scope
- Frontend only. No API/contract change: `GET /api/budgets/{id}/pdf` already exists (`BudgetService.downloadBudgetPdf`).
- `budgets-table.component.ts`: new `onDownloadPdf` output + "PDF" button in the Acciones column, rendered only when `status !== 'DRAFT'` (user decision: drafts are not exportable yet).
- `budgets.component.ts`: bind the output, call the service, save the blob, notify on error.
- Extract the blob→anchor download logic currently inlined in `budget-editor.component.ts` into one shared helper and reuse it in both places (no copy-paste of DOM code).

## Constraints
- Strict TDD ON (source: AGENTS.md `strict-tdd-mode`, `openspec/config.yaml` `strict_tdd: true`); runner: `pnpm test -- --watch=false` (workdir `frontend/`, builder `@angular/build:unit-test` / vitest).
- Conventional Commits, no AI attribution. Work-unit commit at the end.
- UI copy in Spanish (matches the existing list); code/comments/identifiers in English.
- Do NOT stage pre-existing dirty files: `frontend/playwright-report/index.html`, `odd/tasks/budget-client-drift.md`.
- Delivery: branch `dev` (default branch is `main`, so no extra feature branch). Forecast < 400 authored lines → single work unit, no chain question.

## Tasks
- [x] T1 RED: failing specs first — (a) `budgets-table`: renders a "PDF" button per row and emits `onDownloadPdf` with the budget id; (b) `budgets.component`: `downloadPdf(id)` calls `downloadBudgetPdf`, saves the blob as `presupuesto-<id>.pdf`, and notifies on error.
- [x] T2: shared helper `downloadBlob(blob, filename)` (new util under `features/budgets/utils/`); refactor `budget-editor.component.ts` `onDownloadPdf` to use it (behaviour unchanged).
- [x] T3: wire `budgets-table.component.ts` output + button and `budgets.component.ts` handler.
- [x] T4 GREEN: `pnpm test --watch=false` in `frontend/` → 159 passed / 2 failed, both pre-existing (`budget-editor` Enter + clamp tests, failing at baseline too); `pnpm build` → success.
- [x] T5: work-unit commit `feat(budgets): add PDF download button to budgets list`.

## Acceptance criteria
- From `/budgets`, clicking "PDF" downloads `presupuesto-<id>.pdf` without navigating to the editor.
- Failed generation shows `No se pudo generar el PDF del presupuesto.` and does not leave a dangling object URL.
- Existing "Previsualizar PDF" in the editor behaves exactly as before.

## Route declaration
Delegated direct (writer trigger: 3+ non-trivial files). Exploration inline via CodeGraph.

## Progress
- 2026-10-06: doc created after exploration (CodeGraph: budgets list, editor download, BudgetService).
- 2026-10-06: T1–T5 COMPLETE. RED evidence: 5 new assertion failures observed before implementation (`downloadPdf` ×2 in `budgets.component.spec.ts`, PDF-button render/position/emission ×3 in the new `budgets-table.component.spec.ts`); suite baseline already had 2 pre-existing failures (`budget-editor` Enter + clamp). GREEN: `pnpm test --watch=false` = 161 tests / 159 passed / 2 failed (the same 2 pre-existing), `pnpm build` = success. Work-unit commit `8c75120` (7 files, +234/−9 = 243 authored lines → under the 400-line delivery budget, single work unit).
- 2026-10-06: post-commit RDD assess (`--base-ref d4be204 --committed-only --agent opencode`) → risk `medium`, `review_due: true`, reason `slice_budget_reached` (33 files / 1225 lines accumulated since the last acknowledged boundary). Consent envelope relayed to the user; **outcome: `declined` for this candidate** (candidate-scoped — no review record, RDD stays enabled, ordinary repository policy owns delivery).
- 2026-10-07: scope refinement by the user — the PDF button is wrapped in `@if (budget.status !== 'DRAFT')`, so drafts no longer expose the export. The 3 `budgets-table` tests were updated to encode that rule (PDF on APPROVED/SUPERSEDED, absent on DRAFT, still the first action button). Suite: 161 tests / 159 passed / 2 failed (the same 2 pre-existing `budget-editor` failures); Prettier clean on both touched files. Work-unit commit `b8a3b5e`.
- 2026-10-07: post-commit RDD assess (`--base-ref 70ed2fd --committed-only`) → risk `medium`, `review_due: false`, reason `under_budget` (53 lines of ~400). Pending stays in the slice for later commits.
