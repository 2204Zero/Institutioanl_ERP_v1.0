# EduPulse ERP — JSON Development Data Strategy & Architectural Plan

**Document Version:** 1.0  
**Phase:** Prompt 2/10 — Identity, Account Provisioning & Storage Architecture  
**Author:** Antigravity Recovery Agent  
**Status:** Approved Architectural Decision Record (ADR)

---

## 1. Executive Summary & Context

The product requirement states that JSON is intended as the temporary development data source for rapid prototyping and offline development in EduPulse ERP. However, the current backend architecture is an enterprise Spring Boot 3.x modular monolith comprised of:
- **42 Spring Data JPA Repositories** utilizing relational queries, JPQL joins, and pagination (`Page<T>`, `Pageable`).
- **Database Concurrency Controls** including `@Lock(LockModeType.PESSIMISTIC_WRITE)` in admission workflows and fee collections.
- **Transactional Rollback Boundaries** (`@Transactional(rollbackFor = Exception.class)`) across student enrollment, billing, and identity provisioning.
- **Flyway Database Migrations** (`V1__baseline_erp_schema.sql` through `V6__link_guardians_to_users.sql`) targeting PostgreSQL in production and H2 in dev/test.

---

## 2. Core Architectural Dilemma & Decision

### 2.1 The Two-Competing-Sources-of-Truth Risk
If a parallel JSON file persistence mechanism was naively introduced during Prompt 2 directly alongside Spring Data JPA:
1. Writing to JSON files while JPA writes to the active database creates competing, out-of-sync sources of truth.
2. Flat-file JSON lacks native multi-table relational foreign-key integrity, ACID transactions, and pessimistic row locking, which would immediately break existing transactional services.
3. Ripping out JPA in Prompt 2 would invalidate the 310+ regression tests without providing an equivalent test harness.

### 2.2 Explicit Architectural Decision
**Decision:**  
JSON development mode **must NOT be mixed into Prompt 2's identity workflows as an ad-hoc second store**. Instead, the storage-layer transition is formally planned as a **Separately Controlled Storage Layer Milestone**.

For Prompt 2:
- All identity and account-provisioning workflows are implemented against the unified repository interfaces (`UserRepository`, `StudentRepository`, `GuardianRepository`).
- Production PostgreSQL configurations, existing migrations (`V1`–`V6`), and transactional boundaries are strictly preserved.
- The JSON Development Architecture is specified herein to guide the storage-layer transformation in subsequent prompts.

---

## 3. JSON Development Mode Architecture & Blueprint

### 3.1 Design Philosophy: Clean Repository Adapter Architecture
To support JSON as a true development data source without breaking application services, the design must use the **Adapter Pattern** at the repository boundary:

```
+-------------------------------------------------------------------+
|               Service Layer (StudentServiceImpl, etc.)             |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                  Domain Repository Interfaces                     |
|           (StudentRepository, UserRepository, etc.)               |
+-------------------------------------------------------------------+
              |                                           |
              v                                           v
+-----------------------------+             +-----------------------------+
|    JPA / Database Adapter   |             |     JSON Storage Adapter    |
|   (PostgreSQL / H2 engine)  |             |  (File/Memory Document Store|
|     Profile: "prod", "db"   |             |     Profile: "dev-json"     |
+-----------------------------+             +-----------------------------+
```

### 3.2 Data Directory Layout & Schema Definition
When JSON development mode is activated (via Spring profile `dev-json`), entities will be stored as JSON arrays in isolated directory paths:
```
backend/data/dev-json/
  ├── users.json
  ├── students.json
  ├── guardians.json
  ├── faculty.json
  ├── courses.json
  ├── enrollments.json
  └── fixtures/
      └── seed_default_state.json
```

### 3.3 Concurrency & Transaction Semantics for JSON Mode
1. **In-Memory Cache with Write-Through / Flush-on-Commit:**
   - A `JsonDataStoreManager` loads JSON collections into concurrent maps (`ConcurrentHashMap<Long, Entity>`) on startup.
   - On `@Transactional` completion (via Spring `TransactionSynchronizationManager`), dirty state is safely serialized to JSON files atomically using a temporary file rename (`.tmp` -> `.json`) to prevent partial write corruption.
2. **Deterministic Sequence Allocation:**
   - Atomic ID generators (`AtomicLong`) ensure predictable entity IDs matching relational auto-increment behavior.
3. **Reset & Fixture Reload Capability:**
   - An administrative dev endpoint `POST /api/v1/dev/reset-data` reloads the baseline fixture set from `backend/data/dev-json/fixtures/`.

---

| Milestone | Target Prompt | Deliverables | Status |
|---|---|---|---|
| **Phase 1: Identity & Provisioning Integrity** | **Prompt 2** | Implement secure user, student, and guardian provisioning on unified repository layer; establish ADR document. | **COMPLETE** |
| **Phase 2: Academic & Catalog Foundations** | **Prompt 4** | Academic hierarchy and course catalog JSON data stores under `com.erp.devjson`. | **COMPLETE** |
| **Phase 3: Complete Unified JSON Storage Engine** | **Prompt 6** | Implement `com.erp.devjson` across all 11 ERP modules (Users, Students, Guardians, Faculty, Academic, Timetable, Attendance, Admissions, Finance, Notifications, Dashboards), `DevJsonSyncEngine`, `DevJsonDataHydrator`, atomic file engine, and cold-restart recovery. | **COMPLETE** |
| **Phase 4: Role-Based Workspaces & Offline Validation** | **Prompt 7–8** | Validate complete ERP user experiences, dashboards, and role workflows running against JSON files. | **READY FOR PROMPT 7** |

---

## 5. Compliance with Safety Rules

- **Zero Overwrites:** Preserved all existing working-tree modifications from Prompts 1 through 5.
- **Production PostgreSQL Unchanged:** All Flyway migrations remain standard SQL scripts (`V1`–`V6`); production datasources remain untouched.
- **Single Source of Truth:** `dev-json` profile explicitly writes to `backend/data/dev-json/*.json` with atomic file flushing, while default profile targets relational stores.
- **Full Report:** See [prompt6_completion_report.md](file:///c:/Users/digit/Desktop/Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/docs/recovery/prompt6_completion_report.md) for full 43-repository inventory, storage matrix, test evidence, and developer configuration instructions.
