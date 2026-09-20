# Application UI Boundary Specification

## Purpose

Define vendor-neutral field contracts so migrated forms retain behavior without a UI vendor.

## Requirements

### Requirement: Application-Owned Field Contracts

The system MUST provide `app-input`, `app-select`, and `app-textarea` contracts for labels, value changes, state, help/error text, and native attributes.

#### Scenario: Text field interaction
- GIVEN a migrated form renders an `app-input` with a label and initial value
- WHEN the user changes its value
- THEN the form receives the changed value and the associated label remains available

#### Scenario: Disabled select
- GIVEN an `app-select` is disabled
- WHEN the user attempts keyboard or pointer interaction
- THEN its value MUST NOT change

### Requirement: Accessible Field Semantics

Each field contract MUST expose an accessible name and MUST associate rendered help or error text with its control. Required and disabled state MUST be conveyed programmatically.

#### Scenario: Validation error association
- GIVEN a required `app-textarea` has an error message
- WHEN assistive technology reads the control
- THEN it receives the label, required state, and error text association

#### Scenario: Help without error
- GIVEN a field has help text but no validation error
- WHEN the field is focused
- THEN its help association remains available without announcing an error state

### Requirement: Form-Semantics Compatibility

Migrated controls MUST preserve current names, required/type semantics, binding, disabled, keyboard, and submit behavior. An empty numeric field MUST remain invalid and MUST NOT be coerced to a valid number.

#### Scenario: Empty required numeric value
- GIVEN a migrated required numeric field is cleared
- WHEN the form is validated or submitted
- THEN the form remains invalid and its existing error/submit outcome is preserved

#### Scenario: Login submission
- GIVEN the migrated login form has valid named required credentials
- WHEN the user submits it using the existing keyboard or submit control
- THEN the existing authentication submission behavior is invoked once

### Requirement: Vendor Boundary Policy

Migrated feature and authentication templates MUST use application-owned controls and MUST NOT directly depend on Material APIs. Vendor controls MAY be used only within shared adapters.

#### Scenario: Migrated feature form
- GIVEN a migration unit is complete
- WHEN its feature or auth template is inspected
- THEN field, button, and link interactions use application controls

#### Scenario: Adapter rendering
- GIVEN a shared application control is rendered
- WHEN a vendor implementation is selected
- THEN vendor-specific rendering remains contained by the shared adapter

### Requirement: Structural Precision Token Bridge

The system MUST retain `app.css` as the Structural Precision token source and MUST document vendor token mappings and style-load order.

#### Scenario: Token bridge reference
- GIVEN a maintainer reviews the shared UI documentation
- WHEN locating styling ownership
- THEN they can identify token source, vendor mappings, and style-load contract

#### Scenario: Vendor replacement boundary
- GIVEN the rendering vendor changes
- WHEN equivalent shared adapters and token mappings are supplied
- THEN migrated feature templates require no vendor-API rewrite

### Requirement: Incremental Migration and Verification

Legacy controls MUST remain permitted outside the active unit. Each completed unit MUST have primitive and migrated-caller verification for applicable value, validation, accessibility, disabled, and submit behavior.

#### Scenario: Deferred legacy form
- GIVEN a form is outside the active unit
- WHEN another unit is completed
- THEN the deferred form MAY retain its legacy controls unchanged

#### Scenario: Completed migration test suite
- GIVEN a migration unit is declared complete
- WHEN its focused verification runs
- THEN it proves the specified primitive and caller behaviors without changing business rules

### Requirement: Migration Exclusions

This change MUST NOT alter business rules, totals, quantity clamping, authentication behavior, or unrelated shell, navigation, icon, snackbar, or vendor-replacement work.

#### Scenario: Budget editor preservation
- GIVEN the budget editor is migrated
- WHEN users change quantities or totals
- THEN the pre-existing calculation and clamping outcomes are preserved
