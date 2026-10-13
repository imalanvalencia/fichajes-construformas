# Feature: running header + footer on every budget PDF page

## Objective
Repeat a compact brand header (logo + budget number) and a company footer (contact line + `Página X de Y`) on every page of the budget PDF, so a 14-page budget stays navigable. Page 1 keeps its existing full brand header (no duplication).

## Why
`/tmp/opencode/budget-many-partidas.pdf` (150 partidas, 14 pages) showed that from page 2 on the reader loses all document context: no logo, no budget number, no company info, no page number.

## Scope (authorized)
- `backend/src/main/resources/templates/pdf/budget-pdf.html` — `@page` margin boxes + two `position: running()` blocks
- `backend/src/test/java/es/construformas/api/service/BudgetPdfServiceImplTest.java` — TDD RED first
- Out of scope: repeating the **items table column header** (separate, still-open defect), `budget-pdf-new.html`, frontend, company real data, commit/push decisions beyond the work-unit commit.

## Verified renderer recipe (spike, OpenHTMLtoPDF 1.0.10 + PDFBox)
Facts proven empirically — implement exactly this, do not re-invent:
1. `@page { @top-left { content: element(name); } @bottom-left { content: element(name); } }` repeats a full HTML block (including `<img>`) on every page.
2. The block must carry `position: running(name);` and an explicit `width` (header `180mm`, footer `140mm`) so it does not collide with `@bottom-right`.
3. Inline image sizing works inside a running block: `<img style="width: 34mm;">` (logo is 1828x432 px → ~8mm tall at 34mm wide).
4. `content: "..." counter(page) " de " counter(pages)` works in `@bottom-right` (counters verified: `Pagina 2 de 5`).
5. `@page :first { @top-left { content: none; } }` suppresses the running header on page 1 only.
6. `@page { margin: 26mm 15mm 24mm 15mm; }` gives room for both boxes without overlapping content.
7. **Do NOT** use `content: url(<png>)` in a margin box — the image renders at natural size and overflows the page. **Do NOT** wrap it in an `data:image/svg+xml` URI — it is silently dropped.

## Design contract (DESIGN.md, Structural Precision)
- Header: logo left (only when `companyLogoDataUri != null`, else company-name text), budget number right (`Presupuesto N.º {budget.id} — v{budget.version}`), `1px solid #ACB4B6` bottom rule, 8.5pt Poppins.
- Footer: company contact line built from `companyName/companyTaxId/companyAddress/companyPhone/companyEmail/companyWebsite` with `th:if` guards (mirrors the existing `.footer` block), 7.5pt, Steel Grey `#ACB4B6` top rule; `Página X de Y` right at 8pt.
- Sharp corners, 8px rhythm, Nero `#1C1C1D` text, no flexbox (`display: flex` must stay absent), Poppins for text.
- `text-transform: uppercase` breaks PDF text extraction — assert on untransformed strings in tests.

## Constraints
- STRICT TDD MODE IS ACTIVE. Test runner: `cd backend && ./mvnw test`. Change tests FIRST, observe RED, then implement, observe GREEN.
- Fat-jar safety: no `File` paths, classpath resources only.
- Keep `renderPdf` failure semantics and the empty-state/discount/IVA contracts untouched.
- Do not touch unrelated dirty files (`ProjectFinancialSummaryDTO.java`, `application.yml`, frontend assets).

## Checklist
- [x] T1: RED — new/updated tests for repeated header+footer+page counter fail before implementation
- [x] T2: GREEN — template implements the verified recipe; targeted tests pass
- [x] T3: Verification — full suite green + visual check of pages 1, 2, middle, last of a 150-partida PDF

## Progress / evidence
- RED (2026-10-13): `Tests run: 24, Failures: 2` — `templateDeclaresRunningHeaderFooterMarginBoxContract`
  (missing `margin: 26mm 15mm 24mm 15mm`) and `runningHeaderAndPageCounterRepeatFromPageTwoOnwards`
  (page 2 had no `Presupuesto N.º 42`).
- GREEN (2026-10-13): `Tests run: 24, Failures: 0` → full suite `Tests run: 252, Failures: 0, BUILD SUCCESS`.
- Gotcha found: a `<td>` mixing static text with `<span th:text>` splits into multiple PDF text runs drawn
  out of logical order (`Presupuesto N.º  — v42 1` in extraction). A single `th:text` expression on the cell
  keeps the run contiguous.
- Visual check (2026-10-13): 150-partida PDF renders `pages=15`; PNGs at `/tmp/opencode/mp-p{1,2,7,14,15}.png`
  confirm full brand header on page 1 (no duplication), running header + contact footer + `Página N de 15`
  on pages 2+, including middle and last page.
- Follow-up: **not pre-existing** — `git show HEAD:…/budget-pdf.html:35` proves HEAD ships a valid `.negative {`
  ruleset; the missing `{` was introduced by this work unit's own edit, not by earlier work. Fixed by the parent
  in the same unit (see "Parent corrections" below) instead of being deferred.

## Verification
- `cd backend && ./mvnw -q test -Dtest='BudgetPdfServiceImplTest'`
- `cd backend && ./mvnw test`
- Regenerate the multi-page preview (refresh copied resources first):
  - `cd backend && ./mvnw -q -o resources:resources`
  - `cd backend && java -cp "/tmp/opencode/classes:target/classes:$(cat /tmp/opencode/cp.txt)" BigBudgetPdfPreview 150 /tmp/opencode/budget-many-partidas.pdf`
  - `cd backend && java -cp "/tmp/opencode/classes:$(cat /tmp/opencode/cp.txt)" PngExport /tmp/opencode/budget-many-partidas.pdf /tmp/opencode/mp 1 2 7 14`

## Route declaration
- T1/T2/T3: **delegated** (writer trigger: 2 non-trivial files — template + test). Parent supplied the verified spike recipe as context.

## Spike results (parent, 2026-10-13)
- `@page` margin boxes, `element()`, `counter(page)/counter(pages)`, `@page :first` and `content: none` all verified
  working against OpenHTMLtoPDF 1.0.10; visual proof at `/tmp/opencode/spike-p2.png`.

## Parent corrections (2026-10-13, after the delegated unit returned)
1. **CSS regression restored** — the unit deleted the opening brace of `.negative`, which made OpenHTMLtoPDF log
   `css-parse WARNING … Skipping ruleset` and silently drop the Construction Red accent. Restored `.negative {`
   and added `templateKeepsNegativeAmountRulesetParseable` (RED → GREEN) so the ruleset cannot silently break again.
2. **Running footer rebuilt as one compact run** — the six-`<td>` footer forced each field into a narrow column and
   wrapped mid-token (`clientes@construformas.` / `es`). Replaced with a single `th:text` joined line and added
   `runningFooterKeepsCompanyContactFieldsOnOneLine` (RED → GREEN) asserting the email and web tokens extract intact.
3. Re-verified end-to-end: targeted `BudgetPdfServiceImplTest` green, full suite `Tests run: 254, Failures: 0`,
   zero `css-parse` warnings, 150 partidas → `pages=15`, visual check of pages 1, 2 and 15
   (`/tmp/opencode/mp-p{1,2,15}.png`): page 1 keeps the full brand header with no duplicated running header;
   pages 2+ carry logo + `Presupuesto N.º X — vY`, the contact line and `Página N de 15`.
4. Review gate: `gentle-ai review mode status` = `receipt-driven development: on`; `gentle-ai review assess` →
   `Risk: medium`, `Changed paths: 5`, `Changed lines: 198`, `review due: no (under_budget)`.

## Still open (out of scope for this unit)
- The items table column header (`N.º / DESCRIPCIÓN / ZONA / …`) still renders only on page 1 — OpenHTMLtoPDF does
  not honour `display: table-header-group` across page breaks. Needs its own unit (explicit chunking or a PDFBox stamping pass).
