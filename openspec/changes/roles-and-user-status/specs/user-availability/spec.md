# User Availability Specification

## Purpose

Provide visibility into field operator status. The system SHALL track each operator's availability state and current project assignment via an enum and two columns on the users table.

## Requirements

### Requirement: UserAvailability Enum

The system SHALL define a `UserAvailability` enum with exactly four values: `AVAILABLE`, `ON_SITE`, `PARTIALLY_AVAILABLE`, `UNAVAILABLE`.

#### Scenario: Valid enum values

- GIVEN the UserAvailability enum is defined
- WHEN the enum values are listed
- THEN exactly AVAILABLE, ON_SITE, PARTIALLY_AVAILABLE, and UNAVAILABLE exist

### Requirement: Availability Column on Users

The system SHALL add an `availability` column (VARCHAR, nullable, default AVAILABLE) to the `users` table.

#### Scenario: New user has default availability

- GIVEN a new user is created
- WHEN the user record is queried
- THEN the availability field equals AVAILABLE

### Requirement: Current Project Assignment

The system SHALL add a `current_project_id` column (BIGINT FK → projects.id, nullable) to the `users` table. When set, the referenced project MUST exist.

#### Scenario: Operator assigned to project

- GIVEN an operator with current_project_id = 5
- WHEN the user record is queried
- THEN current_project_id is 5

#### Scenario: Operator with no project

- GIVEN an operator with current_project_id = NULL
- WHEN the user record is queried
- THEN availability is AVAILABLE or UNAVAILABLE (not ON_SITE)

### Requirement: Get Availability Endpoint

The system SHALL expose `GET /api/users/{id}/availability` returning the user's current availability and current_project_id.

#### Scenario: ADMIN queries any user's availability

- GIVEN an ADMIN user
- WHEN the ADMIN calls GET /api/users/3/availability
- THEN the response contains the availability and current_project_id of user 3

#### Scenario: OPERATOR queries own availability

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls GET /api/users/7/availability
- THEN the response contains their own availability

#### Scenario: OPERATOR queries other user's availability

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls GET /api/users/3/availability
- THEN the response is 403 Forbidden

### Requirement: Update Availability Endpoint

The system SHALL expose `PUT /api/users/{id}/availability` accepting availability and optional current_project_id.

#### Scenario: ADMIN updates any user's availability

- GIVEN an ADMIN user
- WHEN the ADMIN calls PUT /api/users/3/availability with body {"availability": "ON_SITE", "current_project_id": 5}
- THEN user 3's availability is ON_SITE and current_project_id is 5

#### Scenario: OPERATOR updates own availability

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls PUT /api/users/7/availability with body {"availability": "UNAVAILABLE"}
- THEN user 7's availability is UNAVAILABLE

#### Scenario: OPERATOR updates other user's availability

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls PUT /api/users/3/availability
- THEN the response is 403 Forbidden
