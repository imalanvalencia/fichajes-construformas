# Design: Roles and User Status System

## Technical Approach

Replace the flat `role VARCHAR` column on `users` with a proper many-to-many RBAC model via `roles` + `user_roles` tables. Enable `@EnableMethodSecurity` and add `@PreAuthorize` to every controller method. Update JWT to carry a `roles` array claim, and modify the auth filter to create multiple `ROLE_*` authorities. Add refresh token rotation with a `refresh_tokens` table. Add `availability` and `current_project_id` columns to `users` for field dispatch. Remove public registration.

**Note**: `AI-rules.md` states MariaDB, but `application.yml` and `pom.xml` use PostgreSQL. Design follows the actual running config (PostgreSQL).

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| Role storage | `roles` + `user_roles` join table | Single `role` column (current), role-permission table | Many-to-many supports future multi-role users; join table is standard RBAC |
| JWT claim shape | `roles: ["ADMIN", "OPERATOR"]` array | Single `role` string (current) | Supports multi-role without token format change |
| Authorization model | `@PreAuthorize` on every controller method | URL-pattern-only security in SecurityConfig | Method-level is explicit, testable, and granular; URL-only misses edge cases |
| OPERATOR scoping | Service-layer filter using `SecurityContextHolder` | Database-level row security, AOP aspect | Simple, follows existing patterns; OPERATOR gets `WHERE user_id = :current` |
| Refresh token storage | `refresh_tokens` table | Redis, stateless (opaque token) | PostgreSQL is already the stack; table is simple, auditable, and supports revocation |
| Availability FK | `current_project_id` nullable on `users` | Separate join table | Simple, no extra query; project must exist when set |
| MANAGER role | Dead code in enum, no rules | Remove entirely, implement now | Avoids re-migration in V2; zero cost to keep |
| Registration | Remove `POST /api/auth/register` entirely | Keep but add `@PreAuthorize` | ERP standard: ADMIN-only user creation; self-registration is a security liability |

## Data Flow

### Login Flow
```
POST /api/auth/login
  → AuthService.login()
    → UserRepository.findByEmail()
    → PasswordEncoder.matches()
    → JwtUtil.generateToken(email, roles)  // roles from user.getRoles()
    → RefreshTokenRepository.save(new refreshToken)
  ← { accessToken, refreshToken, email, roles[], name }
```

### Authenticated Request Flow
```
Request with Bearer token
  → JwtAuthFilter.doFilterInternal()
    → JwtUtil.extractEmail() + extractRoles()  // returns List<String>
    → Create SimpleGrantedAuthority for each role
    → Set SecurityContext
  → Controller method
    → @PreAuthorize("hasRole('ADMIN')") check
    → Service layer (OPERATOR scoping:注入 SecurityContext user)
```

### Refresh Flow
```
POST /api/auth/refresh
  → AuthService.refresh(refreshToken)
    → RefreshTokenRepository.findByToken()
    → Validate expiry + not revoked
    → Revoke old token
    → Issue new access + refresh token pair
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/main/resources/db/migration/V9__roles_and_availability.sql` | Create | `roles`, `user_roles` tables; migrate `role` column; add `availability`, `current_project_id` to users |
| `backend/src/main/resources/db/migration/V10__refresh_tokens.sql` | Create | `refresh_tokens` table (id, user_id, token, expiry, revoked, created_at) |
| `backend/src/main/java/es/construformas/api/model/Role.java` | Create | JPA entity for `roles` table (id, name) |
| `backend/src/main/java/es/construformas/api/model/UserRole.java` | Modify | Keep enum, add `@Deprecated` on MANAGER only |
| `backend/src/main/java/es/construformas/api/model/User.java` | Modify | Remove `role` field; add `@ManyToMany Set<Role> roles`; add `availability`, `current_project_id` |
| `backend/src/main/java/es/construformas/api/model/UserAvailability.java` | Create | Enum: `AVAILABLE`, `ON_SITE`, `PARTIALLY_AVAILABLE`, `UNAVAILABLE` |
| `backend/src/main/java/es/construformas/api/model/RefreshToken.java` | Create | JPA entity for `refresh_tokens` |
| `backend/src/main/java/es/construformas/api/repository/RoleRepository.java` | Create | `findByName(String)` + seed helper |
| `backend/src/main/java/es/construformas/api/repository/RefreshTokenRepository.java` | Create | `findByToken()`, `deleteByUser()`, cleanup queries |
| `backend/src/main/java/es/construformas/api/security/JwtUtil.java` | Modify | `generateToken(email, List<String> roles)`, `extractRoles(token)` returning `List<String>` |
| `backend/src/main/java/es/construformas/api/security/JwtAuthFilter.java` | Modify | Extract roles list, create multiple `ROLE_*` authorities |
| `backend/src/main/java/es/construformas/api/security/CustomUserDetailsService.java` | Modify | Load roles from join table (`user.getRoles()`) |
| `backend/src/main/java/es/construformas/api/config/SecurityConfig.java` | Modify | Remove `GET /api/**` permitAll; add `@EnableMethodSecurity` |
| `backend/src/main/java/es/construformas/api/controller/AuthController.java` | Modify | Remove `/register`; add `/refresh`, `/logout` |
| `backend/src/main/java/es/construformas/api/service/AuthService.java` | Modify | Multi-role token, refresh rotation, logout revocation |
| `backend/src/main/java/es/construformas/api/dto/AuthResponse.java` | Modify | Add `refreshToken`, `roles` fields |
| `backend/src/main/java/es/construformas/api/dto/RefreshRequest.java` | Create | DTO for refresh endpoint |
| `backend/src/main/java/es/construformas/api/controller/UserController.java` | Modify | Add `@PreAuthorize("hasRole('ADMIN')")`; accept role assignments |
| `backend/src/main/java/es/construformas/api/service/UserService.java` | Modify | Role assignment, availability management, OPERATOR scoping |
| All 11 controllers | Modify | Add `@PreAuthorize` annotations on every method |

## Interfaces / Contracts

### AuthResponse (updated)
```java
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private List<String> roles;  // was: String role
    private String name;
}
```

### Role Entity
```java
@Entity @Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String name;  // "ADMIN", "OPERATOR"
}
```

### @PreAuthorize Rules
| Controller | Method | Annotation |
|-----------|--------|-----------|
| `UserController.create` | POST | `hasRole('ADMIN')` |
| `UserController.getAll` | GET | `hasRole('ADMIN')` |
| `ProjectController.create/update/delete` | POST/PUT/DELETE | `hasRole('ADMIN')` |
| `BudgetController.create/approve` | POST | `hasRole('ADMIN')` |
| `ClockEntryController.register` | POST | `hasAnyRole('ADMIN','OPERATOR')` |
| `ClockEntryController.getByUser` | GET | `hasAnyRole('ADMIN','OPERATOR')` + OPERATOR filter |
| `ClockCorrectionController.requestCorrection` | POST | `hasAnyRole('ADMIN','OPERATOR')` |
| `ClockCorrectionController.approve/reject` | PUT | `hasRole('ADMIN')` |
| All other GET endpoints | GET | `hasAnyRole('ADMIN','OPERATOR')` |
| `AuthController.login/refresh` | POST | `permitAll` (no annotation) |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `JwtUtil` multi-role generation/extraction | Direct unit test, mock keys |
| Unit | `JwtAuthFilter` creates multiple authorities | Mock JwtUtil, assert SecurityContext |
| Unit | `AuthService` refresh rotation logic | Mock repositories, verify revoke + create |
| Integration | Flyway migration V9/V10 runs cleanly | `@SpringBootTest` with H2 + migration |
| Integration | `@PreAuthorize` blocks unauthorized access | `@WebMvcTest` with mock security, test 403 |
| Integration | OPERATOR scoping returns only own data | `@SpringBootTest`, seed data, assert query results |
| Integration | Login returns access + refresh tokens | `@WebMvcTest` AuthController, mock service |
| Integration | Refresh rotates tokens correctly | `@WebMvcTest`, mock service |
| E2E | Full login → refresh → logout cycle | Manual / future automation |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

**V9 Migration** (single transaction):
1. Create `roles` table, seed ADMIN + OPERATOR
2. Create `user_roles` join table
3. `INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u JOIN roles r ON u.role = r.name`
4. Drop `role` column from `users`
5. Add `availability VARCHAR(30) DEFAULT 'AVAILABLE'` and `current_project_id BIGINT REFERENCES projects(id)` to `users`

**V10 Migration**: Create `refresh_tokens` table.

**Deployment**: Backend + frontend must deploy together. All existing JWTs become invalid after migration — users must re-login. Frontend HTTP interceptor must send JWT on all requests before backend deploys.

**Rollback**: Re-add `role` column (populated from join table), drop new tables, remove availability columns. Git revert code changes.

## Open Questions

- [ ] Should `GET /api/payments/methods` require auth? It returns static config data (payment method names). Current design says yes (all GET requires auth).
- [ ] OPERATOR scoping for `ClockEntryController.getByUser` — should OPERATOR be restricted to only their own userId, or should the endpoint accept any userId (relying on `@PreAuthorize` to restrict access)?
- [ ] Should the refresh token cleanup be a scheduled `@Scheduled` task or left to manual DB maintenance?
