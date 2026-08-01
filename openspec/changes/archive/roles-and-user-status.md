# Change Archive: roles-and-user-status

## Status
**completed**

## Summary
Implemented RBAC (Role-Based Access Control) with many-to-many user-role relationships, user availability tracking, and refresh token rotation for the Construformas ERP.

## Key Changes
- **roles** table with many-to-many `user_roles` junction table
- **refresh_tokens** table with 14-day expiry and rotation
- **users** table: added `availability` (VARCHAR(30)) and `current_project_id` (BIGINT FK)
- **Security**: `@EnableMethodSecurity` + `@PreAuthorize` on all endpoints
- **ADMIN**: full access to all endpoints
- **OPERATOR**: access to own data only (clock entries, corrections, profile)
- **Registration**: ADMIN-only via `POST /api/users`
- **JWT**: carries roles array claim instead of single role

## Files Changed
- `backend/src/main/java/es/construformas/api/dto/AuthResponse.java`
- `backend/src/main/java/es/construformas/api/security/JwtUtil.java`
- `backend/src/main/java/es/construformas/api/security/SecurityConfig.java`
- `backend/src/main/java/es/construformas/api/security/JwtAuthenticationFilter.java`
- `backend/src/main/java/es/construformas/api/controller/AuthController.java`
- `backend/src/main/java/es/construformas/api/controller/UserController.java`
- `backend/src/main/java/es/construformas/api/service/AuthService.java`
- `backend/src/main/java/es/construformas/api/service/UserService.java`
- `backend/src/main/java/es/construformas/api/repository/RefreshTokenRepository.java`
- `backend/src/main/java/es/construformas/api/repository/RoleRepository.java`
- `backend/src/main/resources/db/migration/V5__add_roles_and_refresh_tokens.sql`

## Tests
173/173 passing

## PR
https://github.com/imalanvalencia/fichajes-construformas/pull/1

## Date
2026-08-01
