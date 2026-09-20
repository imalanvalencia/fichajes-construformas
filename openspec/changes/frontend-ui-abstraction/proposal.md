# Proposal: Frontend UI Abstraction

## Intent

Create an application-owned UI boundary so feature and auth templates use stable `app-*` contracts rather than native controls or Angular Material APIs. This removes duplicated field behavior while preserving the Structural Precision language and makes a future vendor replacement an adapter/token-bridge change, not a screen rewrite.

## Scope

### In Scope
- Extend `app-input`; add aligned application-owned select and textarea contracts for label, help/error, disabled, required, native attributes, accessibility, and value changes.
- Preserve `app-button`/`app-link` application-facing variants while retaining Material only behind shared adapters.
- Incrementally migrate forms: project/payment/user/filter and clock fields; `SelectOrCreate`; budget editor; then login, with primitive and migrated-caller tests.
- Retain `app.css` as the vendor-neutral Structural Precision token source and document the Material token bridge/style-load contract.

### Out of Scope
- Wholesale Angular Material replacement or a complete design system.
- Opportunistic shell, sidenav, menu, icon, or snackbar rewrite.
- Changes to form business rules, computed totals, quantity clamping, or authentication behavior.

## Capabilities

### New Capabilities
- `application-ui-boundary`: Vendor-neutral shared field contracts and rules preventing feature/auth templates from depending on Material APIs.

### Modified Capabilities
None — no existing OpenSpec capability specifications exist.

## Approach

Treat `frontend/src/app/components/shared` as the UI-vendor boundary. Native controls or Material may render only inside shared adapters; feature/auth templates consume application selectors. Establish tested field contracts before each migration. Preserve temporary legacy controls outside the active migration unit. Keep the budget editor independently reviewable; with `delivery_strategy=ask-always`, request confirmation before any delivery chain forecast over 800 changed lines.

## Migration Units

1. Contract-test and extend `InputComponent`; add select/textarea.
2. Migrate project, payment, user, filter, and clock-modal controls.
3. Compose `SelectOrCreateComponent` from primitives.
4. Migrate budget editor while preserving interactions.
5. Migrate login after form-name, required, and submit semantics are covered.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `frontend/src/app/components/shared/` | Modified/New | UI contracts and adapters |
| `frontend/src/app/components/budgets/budget-editor/` | Modified | Dedicated form-control migration |
| `frontend/src/app/auth/pages/login/` | Modified | Final auth-form migration |
| `frontend/src/app/app.css`, `material-theme.scss` | Modified | Token bridge contract |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Binding, numeric, submit, or focus regression | Medium | Contract and caller tests; preserve coercion semantics |
| Lost label/error associations | Medium | Require explicit accessible associations |
| Material style conflict | Medium | Visual regression checks against current tokens |

## Rollback Plan

Revert the completed migration unit and its adapter changes together; legacy controls remain available until their unit is validated. Do not alter shell infrastructure.

## Dependencies

- Angular 22 forms and existing Structural Precision tokens.
- Product confirmation for any migration chain exceeding the 800-line review budget.

## Success Criteria

- [ ] Feature and auth templates in migrated units use application-owned controls only.
- [ ] Fields retain validation, accessibility, disabled, keyboard, numeric, and submit behavior.
- [ ] Structural Precision focus, error, and underline states remain intact.
- [ ] Replacing Material is confined to shared adapters and the token bridge.
