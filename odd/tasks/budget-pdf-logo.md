# Feature: Render company logo in budget PDF

## Objective
Replace the initials placeholder in `budget-pdf.html` with the real Construformas logo, rendered reliably by OpenHTMLtoPDF.

## Why
The user added brand assets to `frontend/public/` and wants the budget PDF to use them. Backend PDF rendering cannot call the frontend at runtime.

## Scope (authorized)
- `backend/src/main/resources/static/images/logo-horizontal.png` (copied asset)
- `backend/src/main/resources/application.yml` (`app.pdf.company.logo-path`)
- `backend/src/main/resources/templates/pdf/budget-pdf.html` (img + fallback)
- `backend/src/main/java/es/construformas/api/service/BudgetPdfServiceImpl.java` (classpath → data URI)
- Backend tests for the above

Out of scope: SVG support (would require `openhtmltopdf-svg-support` dependency), frontend changes, commit/push/PR (user decisions).

## Constraints & decisions
- **PNG, not SVG**: current deps (`openhtmltopdf-pdfbox` 1.0.10) have no SVG renderer; verified in local m2 jars.
- **Data URI, not `classpath:` src**: OpenHTMLtoPDF's default resolver passes `data:` through but rejects Spring's `classpath:` scheme; `withHtmlContent(html, null)` has no base URI.
- **Duplicate asset across frontend/backend is correct**: two separate runtimes/deploy artifacts, each owns its static assets.
- **Strict TDD mode**: ON (session config). Test runner: `./mvnw test` from `backend/`.
- Do not touch unrelated dirty files (`ProjectFinancialSummaryDTO.java`); build on top of the user's current uncommitted `budget-pdf.html` edits.
- Route: delegated direct (writer trigger: 2+ non-trivial files).

## Checklist
- [x] T1: RED — failing tests observed (template `<img>` assertion failed; helper symbol compilation error) before implementation
- [x] T2: GREEN — PNG copied (md5 identical to source), `logo-path` updated, `resolveLogoDataUri()` implemented (null-safe), `<img th:if>` + `th:unless` initials fallback in template
- [x] T3: Verification — targeted: `Tests run: 17, Failures: 0` (BudgetPdfServiceImplTest + CompanyPropertiesBindingTest); full suite: `Tests run: 243, Failures: 0, Errors: 0` / BUILD SUCCESS; parent spot-check re-ran targeted command → EXIT=0
- [x] T4: Work-unit commit `17e4b5f` on `dev` — `feat(budget-pdf): render company logo from classpath as data URI` (6 files, 213+/5-; unrelated dirty files excluded)

## Review assessment (RDD)
- `gentle-ai review assess --base-ref origin/dev --committed-only` (untracked-scope=exclude): risk `medium`, `review_due: false`, reason `under_budget` → review stays pending in this slice until the ~400-line budget is reached.

## Acceptance criteria
- Budget PDF header shows `logo-horizontal.png` via `<img src="data:image/png;base64,...">`.
- Missing logo resource → graceful fallback to the initials placeholder (no PDF generation failure).
- Targeted backend tests pass.

## Verification
- `cd backend && ./mvnw -q test -Dtest='BudgetPdfServiceImplTest,CompanyPropertiesBindingTest'`
- Parent spot-check: re-run one reported command before delivery.

## Progress / evidence
- Writer: delegated direct (`general`), strict TDD RED→GREEN observed.
- Gotcha: Thymeleaf 3.1.5 has NO `th:else` (silently dropped); used `th:unless`.
- Gotcha (pre-existing): OpenHTMLtoPDF ignores flexbox (`.header` stacks vertically in PDF); visual check of header layout recommended — out of scope here.
- End-to-end test asserts the PDF embeds a `PDImageXObject` for the logo (non-vacuity: 0 images without logo).

## Next step
- T4: commit (only feature files; leave user's unrelated dirty files uncommitted)
