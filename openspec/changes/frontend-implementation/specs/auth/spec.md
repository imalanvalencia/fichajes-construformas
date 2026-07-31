# Auth Specification

## Purpose

JWT-based authentication module: login, registration, token lifecycle, HTTP interception, and route protection for the Construformas ERP frontend.

## Requirements

### Requirement: Login Page

The system SHALL provide a login page accepting either (email + password) or (DNI/NIE + password). The user MUST be able to choose which identifier to use. Login SHALL call `POST /api/auth/login` with the selected identifier.

#### Scenario: Login with email and password

- GIVEN the user is on the login page
- WHEN the user enters a valid email and password and submits
- THEN the system calls the login API and stores the returned JWT

#### Scenario: Login with DNI/NIE and password

- GIVEN the user is on the login page
- WHEN the user enters a valid DNI/NIE and password and submits
- THEN the system calls the login API and stores the returned JWT

#### Scenario: Login fails with invalid credentials

- GIVEN the user is on the login page
- WHEN the user enters invalid credentials
- THEN the system displays an error message and does NOT store a token

### Requirement: Registration Page

The system SHALL provide a registration page accessible ONLY to authenticated ADMIN users. Registration SHALL collect: full name, email, DNI/NIE, and password. Registration SHALL call `POST /api/auth/register`.

#### Scenario: Admin creates a new user

- GIVEN an authenticated ADMIN user navigates to the register page
- WHEN the admin fills in all required fields and submits
- THEN the system calls the register API and displays success confirmation

#### Scenario: Non-admin user cannot access registration

- GIVEN a non-admin user or unauthenticated visitor
- WHEN they navigate to `/register`
- THEN the system redirects to the login page or home

### Requirement: Token Storage

The system SHALL store JWT access tokens and refresh tokens in localStorage. The access token SHALL be stored under key `access_token`. The refresh token SHALL be stored under key `refresh_token`.

#### Scenario: Token persists after login

- GIVEN a successful login
- WHEN the user closes and reopens the browser
- THEN the access token remains in localStorage

#### Scenario: Logout clears tokens

- GIVEN the user is authenticated
- WHEN the user clicks logout
- THEN both `access_token` and `refresh_token` are removed from localStorage

### Requirement: Auth Interceptor

The system SHALL attach the `Authorization: Bearer <token>` header to all outgoing HTTP requests except the login and register endpoints.

#### Scenario: Authenticated request includes token

- GIVEN the user has a stored access token
- WHEN any HTTP request is made (except login/register)
- THEN the request includes `Authorization: Bearer <token>` header

#### Scenario: Unauthenticated request omits token

- GIVEN no access token is stored
- WHEN an HTTP request is made
- THEN no Authorization header is attached

### Requirement: Token Refresh

The system SHALL implement silent token refresh. When a request returns 401, the interceptor SHALL attempt to refresh using the stored refresh token before redirecting to login.

#### Scenario: Successful token refresh

- GIVEN the access token is expired but refresh token is valid
- WHEN a 401 response is received
- THEN the interceptor refreshes the token, retries the original request, and the user sees no interruption

#### Scenario: Refresh token expired

- GIVEN both access and refresh tokens are expired
- WHEN a 401 response is received
- THEN the system clears all tokens and redirects to `/login`

### Requirement: Route Guard

The system SHALL protect all routes under the shell layout with an auth guard. Unauthenticated users SHALL be redirected to `/login`.

#### Scenario: Authenticated user accesses protected route

- GIVEN the user has a valid access token
- WHEN they navigate to any protected route
- THEN the route loads normally

#### Scenario: Unauthenticated user accesses protected route

- GIVEN no access token is stored
- WHEN the user navigates to a protected route
- THEN the system redirects to `/login`

### Requirement: JWT Decode

The system SHALL decode JWT tokens to extract user information (email, name, role, DNI/NIE) for display in the UI. Decode SHALL validate token structure and expiry.

#### Scenario: Valid token decoded successfully

- GIVEN a valid JWT is stored
- WHEN the auth service decodes it
- THEN user profile fields are available (email, name, role)

#### Scenario: Malformed token is cleared

- GIVEN a stored token is malformed or cannot be decoded
- WHEN the auth service attempts to decode it
- THEN the token is cleared and the user is redirected to login
