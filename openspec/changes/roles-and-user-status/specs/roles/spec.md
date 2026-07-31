# Roles Specification

## Purpose

Define the many-to-many RBAC model replacing the flat role column. The system SHALL use a `roles` table, a `user_roles` join table, and seed ADMIN and OPERATOR roles on migration.

## Requirements

### Requirement: Roles Table Structure

The system SHALL create a `roles` table with columns: `id` (BIGINT PK AUTO_INCREMENT), `name` (VARCHAR UNIQUE NOT NULL), `description` (VARCHAR).

#### Scenario: Roles table exists with correct schema

- GIVEN the database migration has executed
- WHEN the `roles` table is queried
- THEN it contains columns id, name, and description

### Requirement: User Roles Join Table

The system SHALL create a `user_roles` join table with columns: `user_id` (BIGINT FK → users.id), `role_id` (BIGINT FK → roles.id). The combination MUST be unique.

#### Scenario: Many-to-many relationship

- GIVEN a user with id 1 and roles ADMIN and OPERATOR
- WHEN user_roles are queried for user_id = 1
- THEN two rows exist linking to the ADMIN and OPERATOR role records

### Requirement: Role Seeding

The system SHALL seed exactly two roles on migration: ADMIN and OPERATOR. MANAGER MAY exist in the enum as dead code but MUST NOT be seeded or enforced.

#### Scenario: Seeded roles exist

- GIVEN the database migration has executed
- WHEN the roles table is queried
- THEN exactly ADMIN and OPERATOR rows exist
- AND no MANAGER row exists

### Requirement: Role Migration from Flat Column

The system SHALL migrate existing `role` column values from the `users` table into the `user_roles` join table. The `role` column SHALL be dropped after migration.

#### Scenario: Existing user role migrated

- GIVEN a user with role = 'ADMIN' in the old flat column
- WHEN the migration executes
- THEN a user_roles row links that user to the ADMIN role
- AND the `role` column no longer exists on users

### Requirement: Role Assignment via User Management

The system SHALL allow ADMIN to assign roles when creating or updating users via `POST /api/users` and `PUT /api/users/{id}`. The request body SHALL accept a `roles` array of role names.

#### Scenario: ADMIN assigns roles on user creation

- GIVEN an ADMIN user
- WHEN the ADMIN calls POST /api/users with roles ["OPERATOR"]
- THEN the new user has the OPERATOR role in user_roles

#### Scenario: Non-ADMIN attempts role assignment

- GIVEN a user with role OPERATOR
- WHEN the user calls POST /api/users
- THEN the response is 403 Forbidden
