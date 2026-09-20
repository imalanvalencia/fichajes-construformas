# Design: Frontend UI Abstraction

## Technical Approach

Extend the existing `components/shared` adapter boundary with stable `ControlValueAccessor`-based field primitives (`app-input`, `app-select`, `app-textarea`). Material stays confined to shared adapters only; feature/auth templates consume application selectors. Token ownership stays in `app.css` with a CSS-custom-property bridge to `material-theme.scss`. Migration is slice-by-slice with rollback at each boundary.

## Architecture Decisions

| Decision | Options | Tradeoff | Choice |
|----------|---------|----------|--------|
| Field binding strategy | CVA vs `model()` signal | CVA integrates with Angular forms; `model()` is simpler but skips reactive/touched/dirty | CVA — forms compatibility is required by spec |
| Accessibility association | Explicit `id`/`for`/`aria-describedby` vs implicit label wrapping | Explicit IDs are verbose but reliable across all AT; implicit is fragile with portals/dynamic content | Explicit `id`/`for` pairs |
| Typed values | Generic `InputComponent<T>` vs string-only with caller coercion | Generic avoids silent `0` vs `""` ambiguity; string-only is simpler but pushes coercion to 13+ callers | Generic typed contract with `value: T` model |
| Token bridge | CSS custom properties from `app.css` consumed by `material-theme.scss` vs duplicated hex values | Single-source eliminates manual sync; duplication risks drift | CSS custom properties — `--mat-sys-*` mapped from `--color-*` |
| Vendor confinement | Adapter-per-component vs global Material module import | Per-component keeps blast radius small; global import leaks Material everywhere | Adapter-per-component (already established by ButtonComponent) |

## Data Flow

```
Feature Template ──→ app-select ──→ SelectComponent (CVA)
       │                              │
       │ (no Material import)         ├── native <select> renderer
       │                              └── Material <mat-select> renderer (future adapter)
       │
       └──→ app-input ──→ InputComponent (CVA)
                              │
                              ├── native <input> renderer (current)
                              └── Material <mat-input> renderer (future adapter)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `shared/input/input.component.ts` | Modify | Add CVA, typed generic `<T>`, `id`/`for`/`aria-*`, `helpText`, `required` |
| `shared/select/select.component.ts` | Create | CVA-based select with label, options, disabled, required, accessibility |
| `shared/textarea/textarea.component.ts` | Create | CVA-based textarea with label, rows, help/error, accessibility |
| `shared/input/input.component.spec.ts` | Create | Contract tests: value binding, disabled, required, accessibility |
| `shared/select/select.component.spec.ts` | Create | Contract tests: option selection, disabled, keyboard, accessibility |
| `shared/textarea/textarea.component.spec.ts` | Create | Contract tests: value, rows, help text, accessibility |
| `shared/index.ts` | Modify | Export new select and textarea |
| `app.css` | Modify | Add `--color-*` CSS custom properties for Material bridge |
| `material-theme.scss` | Modify | Replace hex literals with `var(--color-*)` references |
| `components/users/user-form-modal/*.ts` | Modify | Replace raw `<select>` with `<app-select>` |
| `components/projects/project-form-modal/*.ts` | Modify | Replace raw `<select>` with `<app-select>` |
| `components/users/users-filters/*.ts` | Modify | Replace raw `<select>` with `<app-select>` |
| `components/clock/clock-register-modal/*.ts` | Modify | Replace raw `<input type="number">` with `<app-input>` |
| `features/clock/clock.component.ts` | Modify | Replace raw filter `<input>` with `<app-input>` |
| `shared/select-or-create/*.ts` | Modify | Compose from `<app-select>` + `<app-input>` primitives |
| `components/budgets/budget-editor/*.ts` | Modify | Replace raw inputs with `<app-input>`/`<app-textarea>` |
| `auth/pages/login/*.ts` | Modify | Replace raw fields with `<app-input>`, preserve `name`/`required`/submit |

## Interfaces / Contracts

```typescript
// Field base contract — all primitives implement this shape
interface FieldConfig {
  label: string;
  helpText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string; // auto-generated if omitted
}

// InputComponent<T> — generic typed value
// Inputs: label, type, value (model<T>), disabled, required, helpText, errorMessage, placeholder, name, id
// Outputs: valueChange<T>

// SelectComponent<T> — generic typed option value
// Inputs: label, options (Array<{value: T, label: string}>), value (model<T>), disabled, required, placeholder, helpText, errorMessage, name, id
// Outputs: valueChange<T>

// TextareaComponent — string value (textareas are always string)
// Inputs: label, value (model<string>), rows, disabled, required, helpText, errorMessage, placeholder, name, id
// Outputs: valueChange<string>

// Accessibility pattern (all primitives):
// <label [for]="fieldId">{{ label }}</label>
// <input [id]="fieldId" [attr.aria-describedby]="describedBy" [attr.aria-invalid]="!!errorMessage" [attr.aria-required]="required">
// <div [id]="helpId" *ngIf="helpText">...</div>  (help or error, mutually exclusive via describedBy)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Contract (per primitive) | Value binding, disabled, required, label association, error display, help text, aria attributes | TestBed + Angular Testing Library; render, interact, assert DOM |
| Accessibility | `id`/`for` pairing, `aria-describedby` points to correct element, `aria-invalid` toggles, `role` where needed | DOM assertion in contract tests |
| Migrated-caller | Each migrated form retains same `ngModel`/binding behavior, submit still fires, numeric coercion unchanged | Render caller component, trigger inputs, assert output emissions |
| Visual regression | Underline states, focus color, error color, disabled opacity match current tokens | Snapshot or visual diff against current rendered output |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

**Slice 1 — Field contracts + tests**: Extend `InputComponent` with CVA/typed/accessibility; create `SelectComponent`, `TextareaComponent`; write contract tests. **Rollback**: revert shared/ changes; no callers affected yet.

**Slice 2 — Form migration**: Convert project/payment/user/filter/clock forms from raw `<select>`/`<input>` to `<app-select>`/`<app-input>`. **Rollback**: revert per-component template changes.

**Slice 3 — SelectOrCreate composition**: Rewrite `SelectOrCreateComponent` internals to use `<app-select>` + `<app-input>`. **Rollback**: revert component internals.

**Slice 4 — Budget editor**: Replace raw inputs in budget editor with `<app-input>`/`<app-textarea>`. Preserve `updateFieldNumber` coercion, Enter-to-add, quantity clamping. **Rollback**: revert budget-editor template.

**Slice 5 — Login**: Replace raw auth fields with `<app-input>`, preserve `name` attributes for form submission and `required` semantics. **Rollback**: revert login template.

**Slice 6 — Shell/notification adapters**: Document `NotificationService` as Material snackbar adapter; no feature-template changes needed. Deferred to separate PR.

Each slice is independently reviewable and revertable. Slices 1-5 are ordered dependencies; slice 6 is independent.

## Open Questions

- [ ] Should `InputComponent<T>` default to `string` or require explicit generic parameter? (Recommend: default to `string`, callers opt into `<number>` explicitly)
- [ ] Budget editor uses `updateFieldNumber` with manual `+value` coercion — should the typed contract absorb this, or keep caller-side coercion for transparency?
- [ ] Login form currently uses `[(ngModel)]` without `name` attributes on tab-switched fields — verify Angular forms still submits correctly after migration
