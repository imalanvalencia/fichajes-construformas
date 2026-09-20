# Automatic Quote Invoicing Specification

## Purpose

Define atomic, traceable automatic draft invoicing when an ADMIN approves a budget, and protected removal of that budget.

## Requirements

### Requirement: Atomic ADMIN Approval and Draft Creation

Only an ADMIN MUST be able to approve a budget that is not already approved. A successful approval MUST atomically create exactly one linked automatic invoice in `DRAFT` status; the source budget MUST NOT be linked to more than one automatic invoice.

#### Scenario: ADMIN approves an eligible budget

- GIVEN an ADMIN and a budget that is not approved
- WHEN the ADMIN approves the budget
- THEN the budget is approved and exactly one linked automatic `DRAFT` invoice exists

#### Scenario: Approval is repeated or unauthorized

- GIVEN a budget is already approved, or the actor is not an ADMIN
- WHEN the actor requests approval
- THEN the request is rejected and no additional invoice is created

#### Scenario: Invoice creation fails

- GIVEN an ADMIN approves an eligible budget
- WHEN automatic invoice creation cannot complete
- THEN the approval and every related write, including invoice-number allocation, are rolled back

### Requirement: Annual Invoice Number and Financial Snapshot

An automatic invoice MUST receive a unique, annual sequential number under concurrent approvals. It MUST copy the budget's project client, approval date, payment terms, and item snapshots. Each discount MUST be represented as a negative VAT-bearing line, and invoice totals MUST include those lines.

#### Scenario: Concurrent approvals in one year

- GIVEN eligible budgets are approved concurrently in the same calendar year
- WHEN their automatic invoices are created
- THEN each invoice has a distinct sequential number for that year

#### Scenario: Invoice preserves commercial values

- GIVEN an approved budget with items, payment terms, and a discount
- WHEN its automatic invoice is created
- THEN it contains copied values, immutable item snapshots, and a negative VAT-bearing discount line in its totals

### Requirement: Confirmed Protected Removal

Only an ADMIN MUST be able to remove an approved budget after explicit frontend confirmation. The system MUST logically remove the budget and its linked automatic `DRAFT` invoice atomically, hiding both from normal lists. It MUST NOT delete, void, or modify an `ISSUED` or `PAID` invoice.

#### Scenario: ADMIN confirms removal of an approved budget

- GIVEN an ADMIN views an approved budget with its automatic `DRAFT` invoice
- WHEN the ADMIN confirms removal
- THEN the budget and draft invoice are logically removed in one transaction

#### Scenario: Removal is unconfirmed or targets an issued invoice

- GIVEN removal lacks confirmation, or the linked invoice is `ISSUED` or `PAID`
- WHEN an ADMIN requests removal
- THEN no protected document is changed and the issued or paid invoice remains intact

### Requirement: Immutable Visible Lifecycle History

The system MUST append visible lifecycle events for approval, automatic invoice creation, and confirmed removal. Every event MUST record its actor, timestamp, and linked budget and invoice identifiers. Historical events MUST be immutable and remain visible after logical removal.

#### Scenario: Lifecycle is displayed after removal

- GIVEN an approved budget and its automatic invoice were logically removed
- WHEN an authorized user views their lifecycle history
- THEN approval, creation, and removal events are visible with their recorded metadata

#### Scenario: A history event is altered

- GIVEN an existing lifecycle event
- WHEN any actor attempts to modify or delete it
- THEN the attempt is rejected and the recorded event remains unchanged
