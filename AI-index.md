# Construformas Project Rules & Context

## Project Overview

This is an enterprise management and clocking web application (MVP v1) for a renovation company named "Construformas".

- Website frontend (Marketing/Contact): Built with Astro (deployed independently).
- Internal Management/Clocking application: Built with Angular and Spring Boot.

## Architecture & Stack

- **Monorepo Structure:** `/backend` (Spring Boot API), `/frontend` (Angular SPA).
- **Backend:** Java 17/21, Spring Boot 3.x, Spring Data JPA, Spring Security + JWT, Lombok.
  - **Base Package:** `es.construformas.api`
  - **Database:** MySQL/PostgreSQL (Managed via Hibernate `ddl-auto: update` in local development).
- **Frontend:** Angular (Latest stable), Mobile-First SPA, TailwindCSS. Utilizing **Angular Signals** for reactive state management.

## Core Business Logic & Constraints (V1 Scope)

1. **Role Model:** Only two roles exist in V1: `ADMIN` and `OPERARIO`. (Keep architecture open for `ENCARGADO` in V2, but do not implement it yet).
2. **Clocking System (Fichajes):**
   - Workers scan a physical QR code at the construction site.
   - **Privacy Guardrail:** Continuous GPS tracking is strictly ILLEGAL. Location (`latitude`, `longitude`) MUST only be captured at the exact millisecond the user clocks in or out.
   - **Validation:** The backend must validate the distance between the worker's current GPS coordinates and the construction site coordinates using the **Haversine Formula**. If the distance exceeds the allowed threshold (e.g., 50 meters), the clocking event is marked as an anomaly or blocked.
3. **Forgot to Clock Out Flow:**
   - If a worker forgets to clock out, the system flags the day as incomplete.
   - The worker cannot clock in the next day without filling out a "Forgot to Clock Out" form (Manual correction request).
   - This request goes to the Admin panel for approval/rejection.

## Token-Saving & Efficiency Instructions for AI Agents

- **Do not hallucinate features:** Stick strictly to the V1 scope (`ADMIN` and `OPERARIO`). Do not write code for task management, shifts, or automatic payroll calculations yet.
- **Code Style:** Always provide clean, production-ready code. Use standard enterprise architecture patterns (Controller-Service-Repository for backend).
- **Configuration:** Write all properties, configuration keys, and code-level setup in English.
- **Be Concise:** Do not output long explanations of how Spring Boot or Angular works unless explicitly requested. Provide the code blocks directly with minimal, high-impact comments.
- **Offline-First Readiness:** Design the data models to support offline-first timestamps and identifiers (UUIDs or structured payloads) so local storage sync won't break in V2.
