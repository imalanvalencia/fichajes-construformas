# Tasks: Frontend UI Abstraction

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 880 |
| 400-line budget risk | High |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Field contracts + tests | PR 1 | `ng test --include='**/shared/**/*.spec.ts'` | Render each primitive in isolation, assert DOM/accessibility | Revert shared/ changes; no callers affected |
| 2 | Form migration (5 forms) | PR 2 | `ng test --include='**/components/**/*.spec.ts'` | Render migrated forms, trigger inputs, assert unchanged behavior | Revert per-component template changes |
| 3 | SelectOrCreate + Budget + Login | PR 3 | `ng test --include='**/shared/select-or-create/**,**/budgets/**,**/auth/**'` | Render each migrated component, trigger interactions | Revert component internals |
| 4 | Documentation | PR 4 | Manual review | Verify token bridge docs are accurate | Delete docs file |

---

## Phase 1: Field Contracts Foundation

- [x] 1.1 Modify `shared/input/input.component.ts`: add CVA implementation, generic `<T>` type param (default `string`), `id`/`for`/`aria-describedby`/`aria-invalid`/`aria-required`, `helpText`/`errorMessage` inputs, `required`/`disabled` signals. Lines: ~80.
- [x] 1.2 Create `shared/select/select.component.ts`: CVA-based select with `options: Array<{value: T, label: string}>`, generic `<T>`, label, disabled, required, placeholder, helpText, errorMessage, accessibility. Lines: ~120.
- [x] 1.3 Create `shared/textarea/textarea.component.ts`: CVA-based textarea with `value: model<string>`, rows, label, disabled, required, helpText, errorMessage, accessibility. Lines: ~100.
- [x] 1.4 Modify `shared/index.ts`: export `SelectComponent` and `TextareaComponent`. Lines: ~5.

## Phase 2: Contract Tests

- [x] 2.1 Create `shared/input/input.component.spec.ts`: test value binding, disabled state, required validation, label `for` association, `aria-describedby` correctness, `aria-invalid` toggle, help/error text display. Lines: ~80.
- [x] 2.2 Create `shared/select/select.component.spec.ts`: test option selection, disabled prevents change, keyboard navigation, label/accessibility. Lines: ~80.
- [x] 2.3 Create `shared/textarea/textarea.component.spec.ts`: test value binding, rows attribute, help text association, error display, accessibility. Lines: ~70.

## Phase 3: Token Bridge

- [ ] 3.1 Modify `app.css`: add `--color-*` CSS custom properties for Material bridge (primary, accent, warn, background, surface, etc.). Lines: ~30.
- [ ] 3.2 Modify `material-theme.scss`: replace hex literals with `var(--color-*)` references. Lines: ~20.

## Phase 4: Form Migration

- [x] 4.1 Modify `components/users/user-form-modal/*.ts`: replace raw `<select>` with `<app-select>`, wire `[(ngModel)]` binding. Lines: ~40.
- [x] 4.2 Modify `components/projects/project-form-modal/*.ts`: replace raw `<select>` with `<app-select>`. Lines: ~40.
- [x] 4.3 Modify `components/users/users-filters/*.ts`: replace raw `<select>` with `<app-select>`. Lines: ~40.
- [x] 4.4 Modify `components/clock/clock-register-modal/*.ts`: replace raw `<input type="number">` with `<app-input type="number">`. Lines: ~40.
- [x] 4.5 Modify `features/clock/clock.component.ts`: replace raw filter `<input>` with `<app-input>`. Lines: ~30.

## Phase 5: Composite Components

- [ ] 5.1 Modify `shared/select-or-create/*.ts`: rewrite internals to compose `<app-select>` + `<app-input>` instead of raw elements. Lines: ~80.
- [ ] 5.2 Modify `components/budgets/budget-editor/*.ts`: replace raw inputs with `<app-input>`/`<app-textarea>`, preserve `updateFieldNumber` coercion and Enter-to-add. Lines: ~60.

## Phase 6: Auth Migration

- [ ] 6.1 Modify `auth/pages/login/*.ts`: replace raw fields with `<app-input>`, preserve `name` attributes for form submission and `required` semantics. Verify Angular forms submit behavior. Lines: ~40.

## Phase 7: Documentation

- [ ] 7.1 Create documentation for `NotificationService` as Material snackbar adapter; document token bridge ownership and style-load order. Lines: ~20.
