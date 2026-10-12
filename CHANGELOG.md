# Changelog — Institutional ERP v1.0

All notable changes to this project are documented in this file based on verified repository milestones, sprint logs, and architectural audit reports.

---

## [v1.0-RC1] — 2026-10-12

### Added
- **Production Container Stack**: Added hardened `edupulse/docker-compose.prod.yml` and root `.dockerignore` / `backend/.dockerignore` for multi-stage Docker builds.
- **Flyway V5 Migration**: Added `V5__payment_idempotency.sql` enforcing unique idempotency keys on payment transactions to eliminate duplicate billing.
- **PostgreSQL Test Safety Guard**: Implemented `PostgresSafetyGuard` to prevent test execution against non-test databases (`edupulse_erp`, `one`).
- **Comprehensive Documentation System (Phase 9.30-R)**:
  - Authored formal academic abstract and problem statement in `docs/project-overview/abstract.md`.
  - Authored modular monolith system architecture with Mermaid sequence and component diagrams in `docs/architecture/system-architecture.md`.
  - Consolidated team contributor registry and sprint daily logs in `docs/reports/weekly/README.md`.
  - Consolidated testing evidence, CI matrix, and live browser audit ledger in `docs/testing/master-test-report.md`.
  - Authored central documentation index in `docs/README.md`.
  - Updated `CONTRIBUTING.md` and added `SECURITY.md`.

### Fixed
- **Campus API Alignment**: Corrected campus creation and deletion endpoints in `frontend-v2` (`CampusesList.tsx`, `CreateCampusDialog.tsx`) to communicate with `/api/v1/campuses`.
- **Student Profile Identity Synchronization**: Resolved mismatched entity mapping between internal `Student.id` and institutional `rollNumber` in `useStudents.ts` and `useMyStudentId.ts`.
- **Login Redirect & Authentication Handling**: Fixed credentials submission and demo role switcher in `frontend-v2/src/pages/Login.tsx` and `src/pages/LoginPage.tsx`.
- **API Base URL Port Alignment**: Standardized frontend API configuration in `src/config/apiConfig.ts` to target port 8081.

---

## [v0.9.0] — Sprint Iterations (Days 01–06)

### Added
- **Student Information System (Palak Agarwal)**:
  - Student Profile CRUD, pagination, and multi-field search (`backend/src/main/java/com/erp/student/`).
  - Guardian management linking parent contacts with student records (`com/erp/guardian/`).
  - Document management supporting PDF and image uploads (`com/erp/student/entity/StudentDocument.java`).
  - Student lifecycle status transitions (Active, Inactive, Suspended, Graduated, Alumni) with immutable audit history.
  - 35 automated test cases achieving 100% pass rate (`docs/test-cases/ALL_MODULES_COMPLETE_TEST_SUITE.txt`).
  - Automated demo script: `run_student_demo.ps1` and `run_student_demo.bat`.
- **Enterprise Security & Access Control (Manish Sharma)**:
  - Database-backed `Session` management replacing in-memory stubs (`com/erp/auth/`).
  - Dynamic user-role assignment with `@ElementCollection` (`ROLE_SECURITY_ADMIN`).
  - Method-level security with `@EnableMethodSecurity` and custom JSON `ApiErrorResponse` handlers.
  - Password recovery service with 15-minute single-use UUID reset tokens.
  - Integration test suites: `AuthenticationIntegrationTest` and `RbacAndPermissionIntegrationTest`.
- **Frontend Architecture & Data Management (Lakshya Singhal)**:
  - Multi-tier data management layer in `src/` and `frontend-v2/`.
  - Strongly typed `apiClient` with Axios request/response interceptors, correlation IDs, and token rotation (`DATA_LAYER_README.md`, `INTEGRATION_README.md`).
  - Generic in-memory cache manager with time-to-live (TTL) invalidation.
  - Responsive administrative dashboard with KPI metrics and role-based navigation.
- **Institution & Campus Governance (Prashant Jain)**:
  - Institution metadata, accreditation tracking, and multi-campus hierarchy (`com/erp/institution/`, `com/erp/campus/`).
  - Academic scheduling authorization constraints (`AcademicSchedulingSecurity.java`).

---

## [v0.1.0] — Initial Foundation (Day 01)
- Baseline PostgreSQL schema initialization (`database/schema/01_student_schema.sql`).
- Spring Boot 3.3.4 parent POM configuration with Java 21 LTS baseline.
- Initial Git branching structure and registry (`docs/Branch-Registry.md`).
