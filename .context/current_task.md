# Current Task Tracking

## Current Objective

Setting up the basic Spring Boot V1 backend architecture and verifying local database connection.

## Micro-Steps

- [x] Download Spring Boot project from Spring Initializr.
- [x] Fix package naming: `es.constuformas.api` → `es.construformas.api` and Spring Boot version references (3.x → 4.x).
- [x] Configure AI tooling: `.cursorrules`, `AI-rules.md`, `.opencode/agents/`, `opencode.json`, root `.gitignore`.
- [x] Configure `application.yml` with local MariaDB database credentials.
- [x] Create `Usuario`, `Obra`, and `Fichaje` JPA entities.
- [x] Run the application to verify Hibernate auto-creates the tables.
- [x] Configure Flyway for database migrations (V1-V3 scripts, pom.xml dependencies, ddl-auto: validate).

## Blockers / Notes

- Flyway migrations created: V1 (usuarios), V2 (obras), V3 (fichajes).
- `ddl-auto` changed from `update` to `validate` — Flyway now owns schema management.
- `baseline-on-migrate: false` set because this is a fresh DB with no prior data.
