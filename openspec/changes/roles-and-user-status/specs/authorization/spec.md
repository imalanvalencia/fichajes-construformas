# Authorization Specification

## Purpose

Enforce role-based access control on every endpoint via Spring Security method-level annotations. The system MUST use `@EnableMethodSecurity` and `@PreAuthorize` to restrict access by role.

## Requirements

### Requirement: Method-Level Security Activation

The system SHALL activate method-level security via `@EnableMethodSecurity` on the application configuration class. Every controller method MUST have an explicit `@PreAuthorize` annotation.

#### Scenario: Annotation present on controller methods

- GIVEN the application context loads
- WHEN any controller method is invoked
- THEN Spring enforces the `@PreAuthorize` expression before execution
- AND methods without annotations MUST be treated as unauthorized (deny by default)

### Requirement: ADMIN Full Access

The system SHALL grant ADMIN role unrestricted access to all endpoints.

#### Scenario: ADMIN accesses any endpoint

- GIVEN a user with role ADMIN
- WHEN the user calls any authenticated endpoint
- THEN the request is processed normally

### Requirement: OPERATOR Data Scoping

The system SHALL restrict OPERATOR role to own data only. OPERATOR MUST NOT access other users' data across any module.

#### Scenario: OPERATOR accesses own data

- GIVEN a user with role OPERATOR
- WHEN the user requests their own profile or clock entries
- THEN the request succeeds

#### Scenario: OPERATOR accesses other user's data

- GIVEN a user with role OPERATOR
- WHEN the user requests another user's profile or clock entries
- THEN the response is 403 Forbidden

### Requirement: Public Endpoint Restriction

The system SHALL make only `/api/auth/login` and `/api/auth/refresh` publicly accessible. All other `/api/**` endpoints MUST require authentication.

#### Scenario: Authenticated GET request to protected endpoint

- GIVEN a valid JWT in the Authorization header
- WHEN the user calls any GET endpoint except login/refresh
- THEN the request is processed with role-based authorization

#### Scenario: Unauthenticated GET request to protected endpoint

- GIVEN no JWT in the request
- WHEN the user calls any GET endpoint except login/refresh
- THEN the response is 401 Unauthorized

### Requirement: Registration Endpoint Removal

The system SHALL NOT expose `POST /api/auth/register`. User creation MUST only occur via `POST /api/users` with ADMIN authorization.

#### Scenario: Attempt to call removed register endpoint

- GIVEN any user (authenticated or not)
- WHEN the user calls POST /api/auth/register
- THEN the response is 404 Not Found
