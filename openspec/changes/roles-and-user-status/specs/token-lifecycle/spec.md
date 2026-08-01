# Token Lifecycle Specification

## Purpose

Manage JWT access tokens and refresh tokens with rotation. The system SHALL issue both tokens on login, rotate the refresh token on every refresh request, and revoke on logout.

## Requirements

### Requirement: JWT Roles Claim

The system SHALL embed a `roles` array claim in the JWT payload. The claim SHALL contain the list of role names assigned to the user (e.g., `["ADMIN"]` or `["ADMIN", "OPERATOR"]`).

#### Scenario: JWT contains roles array

- GIVEN a user with roles ADMIN and OPERATOR
- WHEN a JWT is generated for that user
- THEN the token payload contains `"roles": ["ADMIN", "OPERATOR"]`

### Requirement: Login Returns Token Pair

The system SHALL return both `accessToken` and `refreshToken` in the `POST /api/auth/login` response body.

#### Scenario: Successful login

- GIVEN valid credentials (email or NIE + password)
- WHEN the user calls POST /api/auth/login
- THEN the response contains accessToken and refreshToken fields

#### Scenario: Invalid credentials

- GIVEN invalid credentials
- WHEN the user calls POST /api/auth/login
- THEN the response is 401 Unauthorized and no tokens are issued

### Requirement: Refresh Token Storage

The system SHALL store refresh tokens in a `refresh_tokens` table with columns: `id` (BIGINT PK), `user_id` (BIGINT FK), `token` (VARCHAR UNIQUE), `expiry` (TIMESTAMP), `revoked` (BOOLEAN DEFAULT FALSE), `created_at` (TIMESTAMP).

#### Scenario: Refresh token persisted on login

- GIVEN a successful login
- WHEN the refresh token is stored
- THEN a row exists in refresh_tokens with revoked = false and expiry = now + 14 days

### Requirement: Refresh Token Expiry

The system SHALL enforce a 14-day expiry on refresh tokens. Expired tokens MUST be rejected with 401 Unauthorized.

#### Scenario: Refresh with expired token

- GIVEN a refresh token expired 1 day ago
- WHEN the user calls POST /api/auth/refresh
- THEN the response is 401 Unauthorized

### Requirement: Token Rotation on Refresh

The system SHALL rotate refresh tokens on every `POST /api/auth/refresh` call. The old refresh token MUST be revoked, and a new access + refresh token pair MUST be issued.

#### Scenario: Successful refresh

- GIVEN a valid, non-expired, non-revoked refresh token
- WHEN the user calls POST /api/auth/refresh
- THEN the old refresh token is marked revoked
- AND the response contains a new accessToken and refreshToken

#### Scenario: Refresh with revoked token

- GIVEN a refresh token that was revoked after a previous refresh
- WHEN the user calls POST /api/auth/refresh
- THEN the response is 401 Unauthorized

### Requirement: Logout Revokes Refresh Token

The system SHALL revoke the refresh token on `POST /api/auth/logout`. The revoked token MUST NOT be reusable.

#### Scenario: Logout revokes token

- GIVEN an active refresh token
- WHEN the user calls POST /api/auth/logout
- THEN the refresh token is marked revoked in the database

#### Scenario: Post-logout refresh attempt

- GIVEN a refresh token revoked by logout
- WHEN the user calls POST /api/auth/refresh with that token
- THEN the response is 401 Unauthorized
