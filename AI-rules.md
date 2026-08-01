# Construformas Project Rules & Context

## Project Overview

This is an enterprise management and clocking web application (MVP v1) for a renovation company named "Construformas".

- Website frontend (Marketing/Contact): Built with Astro (deployed independently).
- Internal Management/Clocking application: Built with Angular and Spring Boot.

## Architecture & Stack

- **Monorepo Structure:** `/backend` (Spring Boot API), `/frontend` (Angular SPA).
- **Backend:** Java 17/21, Spring Boot 4.x, Spring Data JPA, Spring Security + JWT, Lombok.
  - **Base Package:** `es.construformas.api`
  - **Database:** MariaDB (Managed via Hibernate `ddl-auto: validate` and Flyway migrations).
- **Frontend:** Angular (Latest stable), Mobile-First SPA, TailwindCSS. Utilizing **Angular Signals** for reactive state management.

## Core Business Logic & Constraints (V1 Scope)

1. **Role Model:** Two roles exist in V1: `ADMIN` and `OPERATOR` (stored in `roles` table, many-to-many via `user_roles`). `MANAGER` kept as dead code for V2.
2. **Security Model:**
   - `@EnableMethodSecurity` with `@PreAuthorize` on all endpoints
   - `ADMIN`: full access to all endpoints
   - `OPERATOR`: access to own data only (clock entries, corrections, profile)
   - Registration: ADMIN-only via `POST /api/users`
   - JWT: carries roles array claim
   - Refresh tokens: 14-day expiry, rotation on refresh
2. **Clocking System (Fichajes):**
   - Workers scan a physical QR code at the construction site.
   - **Privacy Guardrail:** Continuous GPS tracking is strictly ILLEGAL. Location (`latitude`, `longitude`) MUST only be captured at the exact millisecond the user clocks in or out.
   - **Validation:** The backend must validate the distance between the worker's current GPS coordinates and the construction site coordinates using the **Haversine Formula**. If the distance exceeds the allowed threshold (e.g., 50 meters), the clocking event is marked as an anomaly or blocked.
3. **Forgot to Clock Out Flow:**
   - If a worker forgets to clock out, the system flags the day as incomplete.
   - The worker cannot clock in the next day without filling out a "Forgot to Clock Out" form (Manual correction request).
   - This request goes to the Admin panel for approval/rejection.

## Token-Saving & Efficiency Instructions for AI Agents

- **Do not hallucinate features:** Stick strictly to the V1 scope (`ADMIN` and `OPERATOR`). Do not write code for task management, shifts, or automatic payroll calculations yet.
- **Code Style:** Always provide clean, production-ready code. Use standard enterprise architecture patterns (Controller-Service-Repository for backend).
- **Configuration:** Write all properties, configuration keys, and code-level setup in English.
- **Be Concise:** Do not output long explanations of how Spring Boot or Angular works unless explicitly requested. Provide the code blocks directly with minimal, high-impact comments.
- **Offline-First Readiness:** Design the data models to support offline-first timestamps and identifiers (UUIDs or structured payloads) so local storage sync won't break in V2.

## AI Behavior & Code Generation Guardrails (CRITICAL)

1. **Step-by-Step Execution ONLY:** - NEVER generate huge blocks of code (more than 30-40 lines per file at once) that the user cannot easily review in LazyVim.
   - Break down complex tasks into tiny, testable micro-steps. Wait for user confirmation after each step.

2. **Pre-Task Analysis & Feasibility Check:**
   - Before writing ANY code for a new task or requirement, stop and perform a thorough analysis.
   - You MUST explicitly reply to the user confirming:
     a) If the task is technically feasible within the current architecture.
     b) The potential side effects or risks of the implementation.
     c) The exact sub-steps you plan to take.
   - If a requirement is unrealistic or will lead to a dead-end, warn the user immediately. DO NOT write code that you cannot guarantee will work.

3. **Playground & Custom Requirements Adaptability:**
   - This project is a real-world playground for a family business. The user will request non-standard, custom, or "weird" features tailored to specific construction dynamics.
   - Do not force rigid corporate patterns if a simpler, custom workaround solves the business reality better, but always prioritize safety and data integrity.

4. **Concise Explanations:**
   - Do not over-explain elementary programming concepts.
   - Focus the explanation ONLY on the custom logic, the mathematical reasons (like Haversine), or why a specific step is necessary for this specific business flow.
