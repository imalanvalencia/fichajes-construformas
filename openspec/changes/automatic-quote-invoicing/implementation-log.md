# Apply Progress: Automatic Quote Invoicing

## Delivery Boundary

- Strategy: feature-branch-chain
- Work unit: PR 1 — persistence contract
- Base: tracker branch
- Scope: migration, entities, repositories, and PostgreSQL persistence tests only
- Excluded: approval/removal services, controllers, and frontend UI

## Implementation State

PR 1 is complete. The PostgreSQL Testcontainers harness passed against Docker Desktop after upgrading the Testcontainers dependency to the supported 2.0.3 artifact set and correcting the test helper's generated-key statement creation.

### Completed Tasks

- [x] 1.1 RED: `AutomaticQuoteInvoicingPostgresIT` covers source-budget uniqueness, concurrent annual allocation, and lifecycle-event immutability.
- [x] 1.2 GREEN: V12 migration adds the persistence schema and immutability trigger.
- [x] 1.3 GREEN: entities and repositories map the contract and filter soft-deleted normal reads.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 1.1 | `backend/src/test/java/es/construformas/api/integration/AutomaticQuoteInvoicingPostgresIT.java` | PostgreSQL integration | N/A (new) | PASS — initially failed to compile because Testcontainers was absent | PASS — `./mvnw test -Dtest=AutomaticQuoteInvoicingPostgresIT`: 3 tests, 0 failures, 0 errors | PASS — unique source link, concurrent allocation, and update/delete rejection are separate scenarios | PASS — deterministic user fixture replaced an extension-dependent UUID expression; generated-key statement helper corrected for PostgreSQL JDBC |
| 1.2 | `backend/src/test/java/es/construformas/api/integration/AutomaticQuoteInvoicingPostgresIT.java` | PostgreSQL integration | N/A (new migration) | PASS — test preceded V12 | PASS — Flyway applied V1–V12 successfully in PostgreSQL 16.14 | PASS — three migration contract scenarios | PASS — Testcontainers 2.0.3 dependency uses current Docker API support without changing migration behavior |
| 1.3 | `backend/src/test/java/es/construformas/api/repository/AutomaticQuoteInvoicingRepositoryTest.java` | JPA repository | N/A (new mappings/repositories) | PASS — initially failed to compile because lifecycle types/repository were absent | PASS — `./mvnw test -Dtest=AutomaticQuoteInvoicingRepositoryTest`: 2 tests, 0 failures, 0 errors | PASS — soft-delete/lifecycle-read behavior plus yearly sequence persistence | PASS — quoted `year` mapping preserves H2 compatibility without changing PostgreSQL column naming |

## Work Unit Evidence

| Evidence | Result |
|---|---|
| Focused test command and exact result | `cd backend && ./mvnw test -Dtest=AutomaticQuoteInvoicingPostgresIT` — PASS; 3 tests, 0 failures, 0 errors, 0 skipped; PostgreSQL 16.14 container; Flyway V1–V12 applied. |
| Supporting repository verification | `cd backend && ./mvnw test -Dtest=AutomaticQuoteInvoicingRepositoryTest` — PASS; 2 tests, 0 failures, 0 errors, 0 skipped. |
| Runtime harness command/scenario and exact result | The PostgreSQL Testcontainers command above started Docker Desktop 29.6.2, PostgreSQL `postgres:16-alpine`, and exercised unique source link, concurrent annual allocation, and immutable event update/delete rejection. PASS. |
| Test infrastructure correction | Testcontainers 1.21.2 failed Docker Desktop 29.6.2 discovery despite `docker version` succeeding. Upgraded `backend/pom.xml` to Testcontainers 2.0.3 (`testcontainers-junit-jupiter`, `testcontainers-postgresql`), then fixed `insertAndGetId` so `Statement.RETURN_GENERATED_KEYS` is supplied only to `executeUpdate`, not mistakenly as the result-set concurrency argument. |
| Rollback boundary | Revert `V12__automatic_quote_invoicing.sql`, the two new entities/repositories/event enum, `Budget`/`Invoice` mappings, repository filtering, Testcontainers dependencies, and the two persistence tests together. No service, controller, or frontend behavior is included. |

## Remaining Work

- [ ] PR 2 — transactional backend approval/removal workflow.
- [ ] PR 3 — secured API contract and budget UI.
