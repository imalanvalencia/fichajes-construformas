## Exploration: Frontend UI Abstraction

### Current State
The Angular 22 frontend already has an application-owned presentation layer under `frontend/src/app/components/shared`. `ButtonComponent` (27 callers) and `LinkComponent` translate application variants into Angular Material button directives; `CardComponent`, `BadgeComponent`, `MetricCardComponent`, and `TableComponent` are Tailwind-only primitives. `InputComponent` (13 callers) is also application-owned and implements the Structural Precision underline treatment using a native input.

The abstraction is incomplete. Native selects remain in user, project, payment, and filter screens; raw inputs remain in clock, login, clock-registration, budget editing, and the select-or-create flow; and `BudgetEditorComponent` owns a large collection of raw input/textarea markup. Several feature screens duplicate label, underline, error, disabled, and focus styling. Material is directly imported by the button/link adapters, shell sidenav, icons, user menu, and `NotificationService` snackbar adapter.

Visual language is coupled through duplicated Tailwind token classes and the Material theme. `app.css` owns Structural Precision tokens; `material-theme.scss` reproduces the same semantic values as `--mat-sys-*` variables; and `angular.json` loads the Material theme before global Tailwind styles. This preserves the brand today but creates two manually synchronized token representations. No shared UI primitive has direct covering tests; only `BudgetEditorComponent` has focused tests for its raw input interactions.

### Affected Areas
- `frontend/src/app/components/shared/input/input.component.ts` — strengthen the existing text-like field primitive rather than introduce a parallel component; its public value/error/disabled contract is the migration base.
- `frontend/src/app/components/shared/select-or-create/select-or-create.component.ts` — currently embeds select, text input, and raw action buttons; split its field composition onto application primitives.
- `frontend/src/app/components/shared/button/button.component.ts` and `link/link.component.ts` — preserve application-facing variants while isolating the Material implementation behind an adapter boundary.
- `frontend/src/app/components/budgets/budget-editor/budget-editor.component.ts` — highest-density raw-control migration slice; preserve computed totals, Enter-to-add, and quantity-clamping behavior.
- `frontend/src/app/components/{users,payments,projects}/**/*form*.component.ts` and `users-filters/users-filters.component.ts` — direct native select candidates with duplicated Structural Precision styling.
- `frontend/src/app/components/clock/clock-register-modal/clock-register-modal.component.ts` and `frontend/src/app/features/clock/clock.component.ts` — raw numeric inputs alongside existing `app-input` use; suitable for a focused conversion.
- `frontend/src/app/auth/pages/login/login.component.ts` — raw authentication fields and submit/tab buttons; migrate only after the primitive contract supports native form names, required state, and submit semantics.
- `frontend/src/app/shell/shell.component.ts`, `shell/{header,sidebar}/`, `components/header/user/user.componenent.ts`, and `services/notification.service.ts` — direct Material shell, icon, menu, and snackbar coupling; separate adapter work from form control migration.
- `frontend/src/app/app.css`, `frontend/src/material-theme.scss`, and `frontend/angular.json` — define the token bridge and style-load contract that must preserve the current visual language during any library switch.
- `frontend/src/app/components/budgets/budget-editor/budget-editor.component.spec.ts` and new primitive-focused specs — preserve existing interactive behavior and establish reusable accessibility/contract coverage.

### Approaches
1. **Incremental application-owned primitives with Material adapters** — Define stable application contracts for input, textarea, select, choice, icon action, menu, and notification; implement their current renderers with native controls or Material only inside shared components; migrate feature screens slice by slice.
   - Pros: Keeps feature templates library-agnostic, preserves Structural Precision visuals, limits regression scope, and makes a later library replacement localized to shared adapters.
   - Cons: Requires deliberate public contracts and temporary coexistence of legacy raw controls during migration.
   - Effort: Medium

2. **Standardize all forms directly on Angular Material controls** — Replace raw controls with `mat-form-field`, `matInput`, and Material select components, relying on `material-theme.scss` overrides.
   - Pros: Fastest initial consistency and built-in Material behaviors.
   - Cons: Expands Material selectors and APIs throughout feature screens, diverges from the underline-only brand treatment unless heavily overridden, and makes a future design-library switch expensive.
   - Effort: Medium

3. **Build a complete custom design system before migrating callers** — Deliver every primitive and compound control first, then perform a broad screen conversion.
   - Pros: Clean end state and one-time interface design.
   - Cons: Large unvalidated surface, high review risk, delayed value, and likely exceeds the 800-line review budget.
   - Effort: High

### Recommendation
Adopt Approach 1. Treat `components/shared` as the sole UI-vendor boundary: feature and auth screens may consume only application selectors/contracts, while Angular Material remains permitted only in shared adapters and, temporarily, shell infrastructure. Extend the existing `InputComponent` rather than replace it: support the needed native attributes and validation/accessibility contract, then add sibling `TextareaComponent` and `SelectComponent` with the same label, help/error, disabled, required, and value-change conventions. Keep compound behavior such as create-on-demand in `SelectOrCreateComponent`, composed from those primitives.

Retain `app.css` as the vendor-neutral design-token source. In a later design slice, make the Material theme consume a documented token bridge rather than independently curated hex values. Do not make Material's component API part of a feature-facing contract. Keep the current `ButtonComponent` and `LinkComponent` variants stable while their Material internals are isolated; icons, menu, sidenav, and snackbar should receive separate adapters so the form migration does not become a shell rewrite.

Suggested migration work units (each with primitive tests and migrated-caller tests) are: (1) define/test field contracts and expand `app-input`; (2) add select/textarea and convert project, payment, user, and clock modal fields; (3) compose `SelectOrCreateComponent` and migrate its consumers; (4) convert the budget editor as a dedicated interaction-preservation slice; (5) migrate login; (6) isolate remaining Material shell/notification/icon adapters. With `delivery_strategy=ask-always`, request confirmation before scheduling a chain if the task forecast exceeds 800 changed lines; the budget editor should be its own reviewable unit.

### Risks
- Changing form-control wrappers can break Angular template-driven bindings, numeric coercion, keyboard submission, browser validation, focus behavior, and test selectors; field contracts must explicitly cover them.
- `InputComponent` currently exposes string values, while callers manually coerce numeric values; a typed-value contract must avoid silently changing `0`, empty, or invalid-number semantics.
- Accessibility requirements are currently inconsistent: labels are visually connected through click handling but inputs lack explicit `id`/`for`, and select/textarea/error associations must be designed before reuse.
- Material styles can override local styles at equal specificity; its theme and app tokens must be regression-tested together to retain sharp corners, colors, and underline states.
- Button/link rendering must retain one reusable projected-content template with `@if`/`@else if`; multiple `ng-content` elements inside `@switch` break Angular content projection.
- The Material shell/menu/snackbar APIs are behaviorally different from native primitives and should not be replaced opportunistically during form migration.
- Shared primitives have no direct test coverage today; migration without first establishing contract tests would turn 13 input callers and 27 button callers into unprotected blast radius.

### Ready for Proposal
Yes — propose an incremental UI-boundary refactor that preserves the existing Structural Precision token language, creates application-owned field contracts, and explicitly excludes a wholesale design-library replacement. Tell the user that the future library switch becomes a shared-adapter and token-bridge change, not a feature-screen rewrite.
