# Backend Auth — DNI/NIE Support Specification

## Purpose

Backend modifications to support DNI/NIE as an alternative login identifier alongside email, enabling the dual-identifier auth flow requested for Construformas.

## Requirements

### Requirement: DNI/NIE Field in Users Table

The system SHALL add a `dni_nie` column (VARCHAR(20), UNIQUE, nullable) to the `users` table via V9 migration. The column SHALL store Spanish DNI or NIE identifiers.

#### Scenario: Migration adds column successfully

- GIVEN the V9 migration is applied
- WHEN the users table is queried
- THEN the `dni_nie` column exists with UNIQUE constraint

#### Scenario: Existing users have null DNI/NIE

- GIVEN users exist before V9 migration
- WHEN the migration runs
- THEN existing rows have `dni_nie = NULL`

### Requirement: User Entity Update

The system SHALL update the User entity to include the `dni_nie` field. The field SHALL be optional (nullable) to support existing users.

#### Scenario: New user with DNI/NIE

- GIVEN a new user is created with DNI/NIE value "12345678Z"
- WHEN the user is persisted
- THEN `dni_nie` is stored in the database

### Requirement: Dual-Identifier Login

The system SHALL modify `AuthController.login()` to accept either `email` or `dni_nie` in the login request body. The system SHALL resolve the identifier type automatically (email format detection or DNI/NIE pattern).

#### Scenario: Login with email

- GIVEN the login request body contains `email` and `password`
- WHEN the login endpoint is called
- THEN the system authenticates by email lookup

#### Scenario: Login with DNI/NIE

- GIVEN the login request body contains `dni_nie` and `password`
- WHEN the login endpoint is called
- THEN the system authenticates by DNI/NIE lookup

#### Scenario: Neither email nor DNI/NIE provided

- GIVEN the login request body has no `email` and no `dni_nie`
- WHEN the login endpoint is called
- THEN the system returns 400 with validation error

### Requirement: Registration with DNI/NIE

The system SHALL update the register endpoint to accept `dni_nie` as an optional field in the registration DTO. If provided, it MUST be unique across all users.

#### Scenario: Register with DNI/NIE

- GIVEN a registration request includes `dni_nie: "12345678Z"`
- WHEN the registration endpoint is called
- THEN the user is created with `dni_nie` stored

#### Scenario: Duplicate DNI/NIE rejected

- GIVEN a user with DNI/NIE "12345678Z" already exists
- WHEN a new registration includes `dni_nie: "12345678Z"`
- THEN the system returns 409 Conflict

### Requirement: Refresh Token Logic

The system SHALL implement refresh token rotation. On each token refresh, the old refresh token SHALL be invalidated and a new pair (access + refresh) SHALL be issued. Refresh tokens SHALL expire after 14 days.

#### Scenario: Successful token refresh

- GIVEN a valid refresh token
- WHEN the refresh endpoint is called
- THEN a new access token and refresh token are returned, old refresh token invalidated

#### Scenario: Expired refresh token rejected

- GIVEN a refresh token older than 14 days
- WHEN the refresh endpoint is called
- THEN the system returns 401 and the token is not reused

### Requirement: Login DTO Update

The system SHALL provide a `LoginDto` that accepts: `email` (optional), `dni_nie` (optional), `password` (required). At least one of `email` or `dni_nie` MUST be present.

#### Scenario: Valid login DTO with email

- GIVEN a LoginDto with email and password
- WHEN validated
- THEN validation passes

#### Scenario: Invalid login DTO missing both identifiers

- GIVEN a LoginDto with only password
- WHEN validated
- THEN validation fails with descriptive error
