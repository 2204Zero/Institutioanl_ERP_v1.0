# Institutional ERP v1.0 — System Architecture & Technical Design

## 1. Architectural Philosophy: The Modular Monolith

Institutional ERP v1.0 is engineered as a **cohesive, domain-partitioned modular monolith**. Rather than introducing the operational complexity and distributed network overhead of microservices prematurely, the application encapsulates discrete business domains within clearly demarcated Spring Boot modules while sharing a unified transactional database engine and security perimeter.

### Why Modular Monolith?
- **Transactional Consistency:** Critical institutional workflows (such as student onboarding, course section allocation, and fee payment recording) execute within atomic, ACID-compliant database transactions without two-phase commit overhead.
- **Strict Boundary Enforcement:** Domain packages (`student`, `faculty`, `academic`, `admission`, `finance`, `attendance`, `auth`) interact through strongly typed DTOs and well-defined service interfaces rather than raw entity exposure.
- **Simplified Operational Topology:** A single containerized Spring Boot backend service pairs with an authoritative single-page application (SPA), drastically reducing infrastructure maintenance costs.

---

## 2. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        Browser[Modern Web Browser - Chrome, Firefox, Edge]
        SPA["Authoritative Web Portal (React 19 + TypeScript)<br/>frontend-v2: Port 5173"]
        Browser --> SPA
    end

    subgraph Reverse Proxy & Gateway
        Nginx["Reverse Proxy / Web Server<br/>Nginx 1.25 / Vite Gateway"]
        SPA --> Nginx
    end

    subgraph Application Tier [Spring Boot 3.3.4 - Port 8081]
        SecurityFilter["Spring Security Filter Chain<br/>JwtAuthenticationFilter"]
        Nginx --> SecurityFilter

        subgraph Core Business Domains
            AuthModule["Auth & Identity<br/>(JJWT + BCrypt)"]
            SISModule["Student Information System<br/>(Profile, Guardians, Docs)"]
            AcadModule["Academics & Scheduling<br/>(Offerings, Sections, Timetable)"]
            FacultyModule["Faculty Workspace<br/>(Roster, Sections, Attendance)"]
            AdmissionModule["Admissions Pipeline<br/>(Inquiry, Review, Onboard)"]
            FinanceModule["Finance Engine<br/>(Invoices, Payments, Receipts)"]
            AttendanceModule["Attendance Engine<br/>(Bulk Marking, Audit)"]
        end

        SecurityFilter --> AuthModule
        SecurityFilter --> SISModule
        SecurityFilter --> AcadModule
        SecurityFilter --> FacultyModule
        SecurityFilter --> AdmissionModule
        SecurityFilter --> FinanceModule
        SecurityFilter --> AttendanceModule
    end

    subgraph Data & Storage Tier
        Flyway["Flyway Migration Engine<br/>(V1 Baseline to V5 Hardened)"]
        HikariCP["HikariCP Connection Pool"]
        PostgresDB[("PostgreSQL 17 / 18 Primary DB<br/>Port 5432: edupulse_erp")]
        RedisCache[("Redis 7 In-Memory Cache<br/>Port 6379: Sessions & Fast Cache")]
        RabbitBroker[("RabbitMQ 3 Message Broker<br/>Port 5672: Async Events")]
        MinIOStore[("MinIO S3 Object Storage<br/>Port 9000: PDFs & Media")]

        ApplicationTier --> HikariCP
        HikariCP --> PostgresDB
        Flyway -.-> PostgresDB
        ApplicationTier --> RedisCache
        ApplicationTier --> RabbitBroker
        ApplicationTier --> MinIOStore
    end
```

---

## 3. Layered Application Design

### 3.1 Presentation Layer (Authoritative Frontend: `frontend-v2/`)
- **Technology:** React 19, TypeScript ~6.0, Vite 8, Tailwind CSS, Radix UI Primitives.
- **State Management:**
  - **Server State:** TanStack Query v5 (`@tanstack/react-query`) with automatic background invalidation, stale-while-revalidate caching, and optimistic UI updates.
  - **Client State:** Zustand (`useAuthStore`) storing authentication tokens, active role claims, and user metadata in `localStorage`.
- **Component System:** Headless, highly accessible UI components built with Radix UI (`Dialog`, `DropdownMenu`, `Select`, `Slot`) styled via Tailwind CSS utility classes and Lucide icons.
- **Form Handling:** React Hook Form coupled with Zod schema validation for strict client-side contract checking before network dispatch.

### 3.2 Security & Filter Chain Layer
- **Token Format:** Cryptographically signed JSON Web Tokens (JJWT 0.11.5) using HMAC-SHA256 (`HS256`).
- **Authentication Filter:** `JwtAuthenticationFilter` intercepts incoming requests:
  1. Extracts `Authorization: Bearer <token>` header.
  2. Validates token signature and expiration against server secret.
  3. Queries `CustomUserDetailsService` / `SessionService`.
  4. Injects `UsernamePasswordAuthenticationToken` into `SecurityContextHolder`.
- **Authorization Enforcement:** Method-level security via `@EnableMethodSecurity` and `@PreAuthorize("hasRole('...') or hasAuthority('...')")` on every controller method.
- **Resource Ownership & IDOR Protection:** `SecurityOwnershipService` and `StudentIdentityService` ensure that authenticated users cannot access or alter resources belonging to other identities.

### 3.3 Domain Service Layer
- **Encapsulated Business Rules:** Pure Java services (`StudentServiceImpl`, `FacultyServiceImpl`, `PaymentServiceImpl`, `AdmissionServiceImpl`) implement transactional workflows annotated with `@Transactional`.
- **DTO Isolation:** Entity objects (`Student`, `AppUser`, `FeePayment`) are strictly isolated within the persistence tier and never exposed directly over HTTP. All inputs and outputs utilize dedicated DTOs (`StudentRequestDto`, `StudentResponseDto`, `PaymentRequestDto`).
- **Auditing & History:** Domain status updates (e.g. `StudentStatus`) automatically persist immutable audit snapshots to tracking tables (`student_status_history`).

### 3.4 Persistence & Database Migration Layer
- **JPA & Hibernate:** Spring Data JPA with custom Spring Data repository interfaces (`StudentRepository`, `FeePaymentRepository`).
- **Database Migration:** Managed exclusively via Flyway:
  - `V1__baseline_erp_schema.sql`: Core university data schema (20+ normalized relational tables).
  - `V2__persistent_user_management.sql`: Enterprise user authentication entity schema.
  - `V3__enforce_faculty_fk.sql`: Strict foreign key constraint linking faculty records to departments.
  - `V4__link_users_to_domain_entities.sql`: Structural backfill linking authentication accounts to domain actors.
  - `V5__payment_idempotency.sql`: Cryptographic idempotency keys and balance integrity safeguards.
- **Database Safety Guards:** Integrated fail-fast test guards (`PostgresSafetyGuard`) prevent automated tests from ever running against protected operational databases (`edupulse_erp` or `one`).

---

## 4. End-to-End Request Lifecycle Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Institutional User (Faculty / Student / Admin)
    participant UI as React 19 Frontend (frontend-v2)
    participant Axios as Centralized ApiClient
    participant Filter as JwtAuthenticationFilter
    participant Controller as Domain Controller (e.g. StudentController)
    participant Service as Domain Service (e.g. StudentService)
    participant Ownership as SecurityOwnershipService
    participant Repo as Spring Data JPA Repository
    participant DB as PostgreSQL Database

    User->>UI: Interacts with UI (e.g. Update Student Status)
    UI->>Axios: Dispatches HTTP request (PATCH /api/v1/students/1/status)
    Axios->>Axios: Injects Authorization Bearer JWT
    Axios->>Filter: Sends HTTP Request
    Filter->>Filter: Validates JWT signature, claims & expiration
    Filter->>Filter: Sets Authentication in SecurityContext
    Filter->>Controller: Forwards validated request
    Controller->>Controller: Validates @Valid DTO payload constraints
    Controller->>Ownership: Verifies user has authority or resource ownership
    alt Ownership Denied (IDOR / Role Mismatch)
        Ownership-->>Controller: Throws AccessDeniedException
        Controller-->>UI: Returns HTTP 403 Forbidden
    else Ownership Confirmed
        Controller->>Service: Invokes updateStudentStatus(id, dto)
        Service->>Repo: Queries current Student entity
        Repo->>DB: Executes SELECT query
        DB-->>Repo: Returns student record
        Service->>Service: Applies status transition & validation rules
        Service->>Repo: Saves student status history audit record
        Service->>Repo: Saves updated Student entity
        Repo->>DB: Executes UPDATE & INSERT transaction
        DB-->>Repo: Commits transaction
        Service-->>Controller: Returns StudentResponseDto
        Controller-->>UI: Returns HTTP 200 OK with Envelope JSON
        UI->>UI: TanStack Query invalidates cache & updates UI state
        UI-->>User: Displays success notification (Sonner Toast)
    end
```

---

## 5. Security & Concurrency Architecture

### 5.1 Payment Idempotency Engine
To prevent double-billing during financial network retries, payment requests require an `Idempotency-Key` header. The database enforces uniqueness on `fee_payments.idempotency_key`. A duplicate submission triggers an HTTP 409 Conflict or returns the cached successful receipt, guaranteeing zero duplicate ledger posts.

### 5.2 Section Capacity Safeguards
Course registration operations implement pessimistic/optimistic locking checks on section enrollment counts. If a course section's physical seat cap (`max_capacity`) is reached, concurrent registration attempts fail gracefully with informative error payloads rather than over-allocating seats.
