# User Management Specification

## Purpose

Restrict user CRUD operations to ADMIN role and support role assignment in user payloads. OPERATOR MAY only view their own profile.

## Requirements

### Requirement: ADMIN-Only User Creation

The system SHALL require ADMIN role for `POST /api/users`. Non-ADMIN users MUST receive 403 Forbidden.

#### Scenario: ADMIN creates user

- GIVEN an ADMIN user
- WHEN the ADMIN calls POST /api/users with valid body including roles
- THEN the user is created and the response is 201 Created

#### Scenario: OPERATOR attempts user creation

- GIVEN an OPERATOR user
- WHEN the OPERATOR calls POST /api/users
- THEN the response is 403 Forbidden

### Requirement: ADMIN-Only User Update

The system SHALL require ADMIN role for `PUT /api/users/{id}`. OPERATOR MUST NOT update other users.

#### Scenario: ADMIN updates user

- GIVEN an ADMIN user
- WHEN the ADMIN calls PUT /api/users/3 with valid body
- THEN user 3 is updated and the response is 200 OK

#### Scenario: OPERATOR attempts update

- GIVEN an OPERATOR user
- WHEN the OPERATOR calls PUT /api/users/3
- THEN the response is 403 Forbidden

### Requirement: ADMIN-Only User Deletion

The system SHALL require ADMIN role for `DELETE /api/users/{id}`. Soft or hard delete behavior is implementation-defined.

#### Scenario: ADMIN deletes user

- GIVEN an ADMIN user
- WHEN the ADMIN calls DELETE /api/users/3
- THEN user 3 is removed or soft-deleted and the response is 200 OK or 204 No Content

#### Scenario: OPERATOR attempts deletion

- GIVEN an OPERATOR user
- WHEN the OPERATOR calls DELETE /api/users/3
- THEN the response is 403 Forbidden

### Requirement: Role Field in User Requests

The system SHALL accept a `roles` field (array of role name strings) in `POST /api/users` and `PUT /api/users/{id}` request bodies. Roles MUST be validated against the roles table.

#### Scenario: Create user with roles

- GIVEN an ADMIN user
- WHEN the ADMIN calls POST /api/users with roles ["OPERATOR"]
- THEN the new user is linked to the OPERATOR role in user_roles

#### Scenario: Invalid role name

- GIVEN an ADMIN user
- WHEN the ADMIN calls POST /api/users with roles ["INVALID_ROLE"]
- THEN the response is 400 Bad Request

### Requirement: OPERATOR Profile Access

The system SHALL allow OPERATOR to GET their own profile via `GET /api/users/{id}` where id matches the authenticated user's id. OPERATOR MUST NOT view other users' profiles.

#### Scenario: OPERATOR views own profile

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls GET /api/users/7
- THEN the response contains their profile data

#### Scenario: OPERATOR views other user's profile

- GIVEN an OPERATOR user with id = 7
- WHEN the OPERATOR calls GET /api/users/3
- THEN the response is 403 Forbidden
