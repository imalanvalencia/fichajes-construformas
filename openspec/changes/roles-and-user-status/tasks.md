# Tasks: Roles and User Status System

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 450–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | DB foundation + entities + repos | PR 1 | `mvn test -Dtest=RoleRepositoryTest,RefreshTokenRepositoryTest` | Flyway migration on H2 | V9/V10 migrations + Role/UserAvailability/RefreshToken entities |
| 2 | Security layer (JWT, filter, config) | PR 2 | `mvn test -Dtest=JwtUtilTest,JwtAuthFilterTest` | Mock JWT tokens | JwtUtil, JwtAuthFilter, SecurityConfig, CustomUserDetailsService |
| 3 | Auth + User Mgmt + Availability + Controllers | PR 3 | `mvn test -Dtest=AuthControllerTest,UserControllerTest,AuthorizationIntegrationTest` | MockMvc with security | All controller @PreAuthorize, AuthController, UserService, availability endpoints |

## Phase 1: Database Foundation

- [x] 1.1 RED: Write `V9__roles_and_availability.sql` migration — CREATE `roles` (id, name, description), `user_roles` (user_id FK, role_id FK, UNIQUE), seed ADMIN+OPERATOR, INSERT INTO user_roles from existing role column, ALTER TABLE users DROP role, ADD availability VARCHAR(30) DEFAULT 'AVAILABLE', ADD current_project_id BIGINT FK projects(id) NULLABLE. Test: `mvn flyway:migrate -Dspring.profiles.active=test` on H2 runs cleanly
- [x] 1.2 GREEN: Verify V9 migration on H2 test profile — run existing `ApiApplicationTests` to confirm no regressions
- [x] 1.3 Create `Role.java` entity — `@Entity @Table(name="roles")` with id (BIGINT PK AUTO_INCREMENT), name (VARCHAR UNIQUE NOT NULL), description (VARCHAR). Lombok @Data, @NoArgsConstructor, @Builder
- [x] 1.4 Create `UserAvailability.java` enum — AVAILABLE, ON_SITE, PARTIALLY_AVAILABLE, UNAVAILABLE
- [x] 1.5 Modify `User.java` — Remove `private UserRole role` field. Add `@ManyToMany @JoinTable(name="user_roles", joinColumns=@JoinColumn(name="user_id"), inverseJoinColumns=@JoinColumn(name="role_id")) private Set<Role> roles`. Add `@Enumerated(EnumType.STRING) @Column(length=30) @Builder.Default private UserAvailability availability = UserAvailability.AVAILABLE`. Add `@ManyToOne @JoinColumn(name="current_project_id") private Project currentProject`
- [x] 1.6 Modify `UserRole.java` — Add `@Deprecated` annotation on MANAGER value only (keep dead code per spec)
- [x] 1.7 Create `RoleRepository.java` — `extends JpaRepository<Role, Long>` with `Optional<Role> findByName(String name)`
- [x] 1.8 Create `RefreshToken.java` entity — `@Entity @Table(name="refresh_tokens")` with id, user_id (BIGINT FK), token (VARCHAR UNIQUE), expiry (TIMESTAMP), revoked (BOOLEAN DEFAULT FALSE), created_at (TIMESTAMP). Add `@ManyToOne @JoinColumn(name="user_id") private User user`
- [x] 1.9 Create `RefreshTokenRepository.java` — `extends JpaRepository<RefreshToken, Long>` with `Optional<RefreshToken> findByToken(String token)`, `void deleteByUserId(Long userId)`, `@Query("DELETE FROM RefreshToken r WHERE r.expiry < :now OR r.revoked = true") int deleteExpiredOrRevoked(@Param("now") LocalDateTime now)`
- [x] 1.10 Create `V10__refresh_tokens.sql` migration — CREATE TABLE refresh_tokens (id BIGSERIAL PK, user_id BIGINT FK users(id), token VARCHAR(255) UNIQUE NOT NULL, expiry TIMESTAMP NOT NULL, revoked BOOLEAN DEFAULT FALSE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)
- [x] 1.11 RED: Write `RoleRepositoryTest` — test findByName("ADMIN") returns role, findByName("INVALID") returns empty. Test: `mvn test -Dtest=RoleRepositoryTest`
- [x] 1.12 RED: Write `RefreshTokenRepositoryTest` — test save, findByToken, deleteExpiredOrRevoked. Test: `mvn test -Dtest=RefreshTokenRepositoryTest`

## Phase 2: Security Layer

- [ ] 2.1 Modify `JwtUtil.java` — Change `generateToken(String email, String role)` to `generateToken(String email, List<String> roles)`. Change claim from `role` (single string) to `roles` (List). Add `public List<String> extractRoles(String token)`. Keep old `extractRole` as @Deprecated for backward compat
- [ ] 2.2 RED: Update `JwtUtilTest` — Add test: generateToken with roles ["ADMIN","OPERATOR"] → extractRoles returns list. Test: `mvn test -Dtest=JwtUtilTest`
- [ ] 2.3 Modify `JwtAuthFilter.java` — Replace `jwtUtil.extractRole(token)` with `jwtUtil.extractRoles(token)`. Create `List<SimpleGrantedAuthority>` by mapping each role to `"ROLE_" + role`. Set as authorities in UsernamePasswordAuthenticationToken
- [ ] 2.4 RED: Write `JwtAuthFilterTest` — Mock JwtUtil, verify filter creates multiple authorities from roles list, sets SecurityContext. Test: `mvn test -Dtest=JwtAuthFilterTest`
- [ ] 2.5 Modify `CustomUserDetailsService.java` — Replace `user.getRole().name()` with `user.getRoles().stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r.getName())).toList()`
- [ ] 2.6 Modify `SecurityConfig.java` — Add `@EnableMethodSecurity` annotation. Remove `.requestMatchers(HttpMethod.GET, "/api/**").permitAll()`. Keep only `/api/auth/login` and `/api/auth/refresh` as permitAll (need to adjust `/api/auth/**` to explicit paths)
- [ ] 2.7 Modify `LoginRequest.java` — Change `@Email @NotBlank` on email to `@NotBlank` (accept email OR nie). Add `private String nie` field
- [ ] 2.8 Modify `AuthResponse.java` — Replace `private String token` with `private String accessToken`. Add `private String refreshToken`. Replace `private String role` with `private List<String> roles`
- [ ] 2.9 Create `RefreshRequest.java` DTO — `@Data` with `@NotBlank private String refreshToken`

## Phase 3: Authorization on All Controllers

- [ ] 3.1 Add `@PreAuthorize("hasRole('ADMIN')")` on UserController: create, getAll, getByRole, update, delete. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById with OPERATOR-scoping check in service
- [ ] 3.2 Add `@PreAuthorize("hasRole('ADMIN')")` on ProjectController: create, update, delete. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getAll, getByClient, getFinancialSummary
- [ ] 3.3 Add `@PreAuthorize("hasRole('ADMIN')")` on BudgetController: create, createNewVersion, approve, addItem, addDiscount, delete. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getByProject, getItems
- [ ] 3.4 Add `@PreAuthorize("hasRole('ADMIN')")` on ClientController: create, update, delete. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getAll, search
- [ ] 3.5 Add `@PreAuthorize("hasRole('ADMIN')")` on SupplierController: create, update, delete. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getAll, search
- [ ] 3.6 Add `@PreAuthorize("hasRole('ADMIN')")` on InvoiceController: create, update, delete, issue, createRectifying. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getByProject, addItem
- [ ] 3.7 Add `@PreAuthorize("hasRole('ADMIN')")` on SupplierInvoiceController: create, updateStatus. Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on getById, getBySupplier, getByProject
- [ ] 3.8 Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on PaymentController: create, getById, getByProject, getPaymentMethods
- [ ] 3.9 Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on ClockEntryController: register, getById, getByUser, delete. ByUser requires OPERATOR-scoping
- [ ] 3.10 Add `@PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")` on ClockCorrectionController: requestCorrection, getPending, getByUser. Add `@PreAuthorize("hasRole('ADMIN')")` on approve, reject
- [ ] 3.11 RED: Write `AuthorizationIntegrationTest` — @WebMvcTest with mock ADMIN/OPERATOR users. Test: OPERATOR gets 403 on /api/users (getAll), 200 on /api/clock-entries/user/{ownId}. Unauthenticated GET returns 401. Test: `mvn test -Dtest=AuthorizationIntegrationTest`

## Phase 4: User Management & Auth Endpoints

- [ ] 4.1 Modify `AuthService.java` — Remove `register()` method. Update `login()` to: support email OR nie lookup, generate multi-role JWT, create + save RefreshToken, return AuthResponse with accessToken + refreshToken + roles. Add `refresh(String refreshToken)` method: find token, validate expiry/not revoked, revoke old, issue new pair. Add `logout(String refreshToken)` method: find and revoke token
- [ ] 4.2 Modify `AuthController.java` — Remove `/register` endpoint. Add `@PostMapping("/refresh")` calling authService.refresh(). Add `@PostMapping("/logout")` calling authService.logout()
- [ ] 4.3 Modify `UserService.java` — Add `assignRoles(Long userId, List<String> roleNames)` method. Add `getAvailability(Long userId)` and `updateAvailability(Long userId, UserAvailability availability, Long projectId)` methods. Add OPERATOR-scoping: `findByUserIdForOperator(Long userId, Long currentUserId)` — returns user only if ids match
- [ ] 4.4 Modify `UserController.java` — Update create to accept roles field. Add `@GetMapping("/{id}/availability")` and `@PutMapping("/{id}/availability")` endpoints. Remove getByRole (deprecated after many-to-many migration)
- [ ] 4.5 Update existing `UserControllerTest` — Adapt for removed register, new roles field, availability endpoints. Test: `mvn test -Dtest=UserControllerTest`
- [ ] 4.6 Update existing `AuthControllerTest` — Remove register test, add refresh/logout tests, adapt for new AuthResponse shape. Test: `mvn test -Dtest=AuthControllerTest`
- [ ] 4.7 RED: Write `AuthServiceTest` — Test login returns token pair, refresh rotates tokens, logout revokes token. Test: `mvn test -Dtest=AuthServiceTest`

## Phase 5: Refresh Token Cleanup

- [ ] 5.1 Add `@Scheduled(fixedRate = 604800000)` method in `AuthService` or new `TokenCleanupService` — calls `refreshTokenRepository.deleteExpiredOrRevoked(LocalDateTime.now())`. Add `@EnableScheduling` to application class if not present
- [ ] 5.2 RED: Write test for cleanup — seed expired + revoked tokens, run cleanup, assert deleted. Test: `mvn test -Dtest=TokenCleanupServiceTest`

## Phase 6: Integration Testing & Verification

- [ ] 6.1 Verify all existing tests still pass after changes — `mvn test` (full suite)
- [ ] 6.2 Verify V9/V10 migrations run cleanly on H2 test profile
- [ ] 6.3 Verify login → refresh → logout cycle works end-to-end via MockMvc
- [ ] 6.4 Verify OPERATOR scoping: OPERATOR can only see own clock entries, own profile, own availability
- [ ] 6.5 Verify unauthenticated requests to protected GET endpoints return 401
- [ ] 6.6 Verify POST /api/auth/register returns 404

## Relevant Files

### New Files
- `backend/src/main/resources/db/migration/V9__roles_and_availability.sql`
- `backend/src/main/resources/db/migration/V10__refresh_tokens.sql`
- `backend/src/main/java/es/construformas/api/model/Role.java`
- `backend/src/main/java/es/construformas/api/model/UserAvailability.java`
- `backend/src/main/java/es/construformas/api/model/RefreshToken.java`
- `backend/src/main/java/es/construformas/api/repository/RoleRepository.java`
- `backend/src/main/java/es/construformas/api/repository/RefreshTokenRepository.java`
- `backend/src/main/java/es/construformas/api/dto/RefreshRequest.java`

### Modified Files
- `backend/src/main/java/es/construformas/api/model/User.java`
- `backend/src/main/java/es/construformas/api/model/UserRole.java`
- `backend/src/main/java/es/construformas/api/security/JwtUtil.java`
- `backend/src/main/java/es/construformas/api/security/JwtAuthFilter.java`
- `backend/src/main/java/es/construformas/api/security/CustomUserDetailsService.java`
- `backend/src/main/java/es/construformas/api/config/SecurityConfig.java`
- `backend/src/main/java/es/construformas/api/controller/AuthController.java`
- `backend/src/main/java/es/construformas/api/controller/UserController.java`
- `backend/src/main/java/es/construformas/api/service/AuthService.java`
- `backend/src/main/java/es/construformas/api/service/UserService.java`
- `backend/src/main/java/es/construformas/api/dto/AuthResponse.java`
- `backend/src/main/java/es/construformas/api/dto/LoginRequest.java`
- All 11 controllers (annotation-only changes)
