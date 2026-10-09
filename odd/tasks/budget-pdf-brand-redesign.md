# Feature: Brand redesign of budget PDF (Structural Precision)

## Objective
Restyle `budget-pdf.html` following `frontend/DESIGN.md` ("Technical Minimalism" / blueprint aesthetic), drop the duplicated company name next to the logo (logo already carries name + isotipo + eslogan), and make company contact/legal data injectable from config.

## Why
Current PDF design is bland ("soso"); brand direction exists but the PDF ignores it. Company data must be editable without touching code.

## Scope (authorized)
- `backend/src/main/resources/templates/pdf/budget-pdf.html` — full visual redesign
- `backend/src/main/resources/fonts/poppins/` — Poppins TTFs (Regular, SemiBold, Bold) + OFL license, downloaded from google/fonts GitHub raw (user authorized: "Solo Poppins")
- `backend/src/main/java/.../BudgetPdfServiceImpl.java` — embed Poppins via `PdfRendererBuilder.useFont(...)` (classpath-safe InputStream supplier, NOT java.io.File)
- `backend/src/main/java/.../CompanyProperties.java` + `application.yml` — new fields: phone, email, website (placeholders until user supplies real data)
- `backend/src/test/.../BudgetPdfServiceImplTest.java`, `CompanyPropertiesBindingTest.java` — TDD
- Out of scope: JetBrains Mono (declined), frontend changes, real company data (user will provide later), commit/push.

## Design contract (from DESIGN.md, PDF-adapted)
- Colors: Nero `#1C1C1D`, Construction Red `#E22D2D` (sparingly: totals/critical), Cement Grey `#E1E5E7`, Steel Grey `#ACB4B6` (dividers 1px).
- Sharp corners only (border-radius 0 everywhere). 8px spacing rhythm.
- Tables for ALL layout — OpenHTMLtoPDF ignores flexbox (existing `.header`/`.info-row`/`.totals-wrap` flex declarations are dead code → replace with tables).
- Table headers: all-caps, Nero background, white text; rows separated by 1px Steel Grey; NO zebra striping.
- Typography: Poppins (titles/body) embedded; numeric columns stay Helvetica (user choice: solo Poppins).
- Logo: single `<img>`, no company-name text beside it; initials fallback kept.
- Company legal/contact info: footer zone injected from `CompanyProperties` (CIF, dirección, teléfono, email, web).

## Constraints
- Strict TDD: change tests FIRST (observe RED), then implement.
- Tests asserting `<img` / `logo-placeholder` / data-URI behavior must keep passing or be updated RED-first if contracts change.
- Fat-jar safety: font loading must work from classpath inside packaged JAR (no `File` paths).
- Do not touch unrelated dirty files (ProjectFinancialSummaryDTO, frontend assets).
- Keep `renderPdf` failure semantics (throw IllegalStateException) — but font resource missing should degrade gracefully to Helvetica, not crash.

## Checklist
- [x] T1: RED — observed: 4 template/font test failures + compilation error for missing CompanyProperties getters
- [x] T2: GREEN — Poppins Regular/SemiBold/Bold + OFL downloaded (verified TrueType), embedded via FSSupplier<InputStream> (fat-jar-safe, graceful Helvetica fallback), CompanyProperties +phone/email/website, template table-only redesign (0 flexbox), footer contact zone, company-name block beside logo removed
- [x] T3: Verification — targeted 24/24 green (parent spot-check EXIT=0); full suite 250/250 green; 0 css-parse flex warnings; preview regenerated at /tmp/opencode/budget-preview.pdf
- [ ] T4: Work-unit commit on `dev`

## Verification
- `cd backend && ./mvnw -q test -Dtest='BudgetPdfServiceImplTest,CompanyPropertiesBindingTest'`
- Full: `cd backend && ./mvnw test`
- Visual: regenerate `/tmp/opencode/budget-preview.pdf` (mirror font registration in generator)

## Progress / evidence
- Verified useFont overload: `BaseRendererBuilder.useFont(FSSupplier<InputStream>, String, Integer, FontStyle, boolean)`; supplier returns fresh stream per render from cached bytes.
- Gotchas: `text-transform: uppercase` alters PDF text extraction (tests rely on untransformed cells); subset=true keeps ToUnicode working; sample-data terms spill to page 2 (content, not layout).
- Design mapping: table.header (4px Nero heavy rule), table.info-row, nested totals table; red only on grand total/negatives; Cement zone rows; Steel 1px dividers; sharp 0px corners; 8px rhythm.

## Next step
- T4: commit (only feature files; user's unrelated dirty files excluded)
