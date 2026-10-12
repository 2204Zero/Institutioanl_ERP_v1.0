# Institutional ERP v1.0 — Team Contributions & Sprint Progress Reports

## 1. Verified Project Contributor Registry

This registry documents all team members, assigned branches, responsibilities, and verified deliverables based on repository evidence from [`docs/Branch-Registry.md`](../Branch-Registry.md), commit history, test suites, and technical documentation.

| Member Name | Git Author / Email | Project Role & Branch | Assigned Modules | Verified Deliverables | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Palak Agarwal** | `inagarwalpalak2005@gmail.com` | Lead SIS Engineer<br/>`feature/student-profile` | Student Profile, Guardians, Student Documents, Status Lifecycle | Days 01–06 SIS test suites (7 files), `StudentModuleDemonstrationTest`, `run_student_demo.ps1` | **Verified** |
| **Manish Sharma** | `sharmamanish48118@gmail.com` | Security & RBAC Engineer<br/>`feature/authentication` | Authentication, Sessions, User Management, Dynamic Roles | Days 01–06 Security report, `AuthenticationIntegrationTest`, `RbacAndPermissionIntegrationTest` | **Verified** |
| **Lakshya Singhal** | `lakshyasinghal92@gmail.com`<br/>`lakshyagoyal701@gmail.com` | Frontend Architect & Lead Hardening<br/>`feature/dashboard` | Dashboard UI, Data Layer, Integration, Concurrency | `DATA_LAYER_README.md`, `INTEGRATION_README.md`, Postgres IT safety guards, batch security closures | **Verified** |
| **Prashant Jain** | `prashantjain.code@gmail.com` | Institutional & Campus Engineer<br/>`feature/institution` | Institution Management, Campuses, Scheduling Security | Branch registry baseline, `AcademicSchedulingSecurity.java`, campus CRUD endpoints | **Verified** |

---

## 2. Palak Agarwal — Student Information System (SIS) Sprint Log

### Summary of Responsibilities
Palak Agarwal owned the design, relational schema, Spring Boot services, and test suites for the core Student Information System (SIS).

| Sprint Day | Module Focus | Work Completed | Technical Deliverables & Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Day 01** | Database Schema & Constraints | Authored DDL scripts for `students`, `guardians`, `student_documents`, and `student_status_history`. Enforced unique constraints on `roll_number` and `email`, plus cascading deletes on foreign keys. | [`01_student_schema.sql`](../../database/schema/01_student_schema.sql)<br/>[`day01_database_schema_test_cases.txt`](../test-cases/day01_database_schema_test_cases.txt) | Complete |
| **Day 02** | Student Profile CRUD | Implemented Spring Boot entity, repository, service, and controller for full student lifecycle (Create, Read, Update, Delete), multi-criteria filtering, and pagination. | `Student.java`, `StudentController.java`, `StudentServiceImpl.java`<br/>[`day02_student_profile_test_cases.txt`](../test-cases/day02_student_profile_test_cases.txt) | Complete |
| **Day 03** | Guardian Management | Built 1:N relational linking between students and guardians. Supported emergency contact designation, relationship categorization (Father, Mother, Legal Guardian), and contact details. | `Guardian.java`, `GuardianController.java`, `GuardianServiceImpl.java`<br/>[`day03_guardian_management_test_cases.txt`](../test-cases/day03_guardian_management_test_cases.txt) | Complete |
| **Day 04** | Document Repository | Developed document upload and storage engine supporting PDF/image storage for Aadhaar, Marksheets, Transfer Certificates, and photos with disk persistence and MIME validation. | `StudentDocument.java`, `StudentDocumentController.java`<br/>[`day04_student_documents_test_cases.txt`](../test-cases/day04_student_documents_test_cases.txt) | Complete |
| **Day 05** | Student Status Lifecycle | Engineered state transition machine (`ACTIVE`, `SUSPENDED`, `DROPPED`, `GRADUATED`, `ALUMNI`) with mandatory effective date and audit reason logging to `student_status_history`. | `StudentStatus.java`, `StudentStatusUpdateDto.java`<br/>[`day05_student_status_test_cases.txt`](../test-cases/day05_student_status_test_cases.txt) | Complete |
| **Day 06** | MockMvc API Testing & Swagger | Authored 6 automated MockMvc test suites validating HTTP status codes, Bean Validation errors (400), unique conflicts (409), payload caps (413), and OpenAPI 3 annotations. | `StudentControllerTest.java`, `OpenApiConfig.java`<br/>[`day06_api_validation_test_cases.txt`](../test-cases/day06_api_validation_test_cases.txt)<br/>[`ALL_MODULES_COMPLETE_TEST_SUITE.txt`](../test-cases/ALL_MODULES_COMPLETE_TEST_SUITE.txt) | Complete |

### One-Click Demonstration Evidence
Palak Agarwal authored the automated demonstration harness [`StudentModuleDemonstrationTest.java`](../../backend/src/test/java/com/erp/student/StudentModuleDemonstrationTest.java) and companion one-click launch scripts:
- Windows Batch: [`run_student_demo.bat`](../../run_student_demo.bat)
- PowerShell: [`run_student_demo.ps1`](../../run_student_demo.ps1)

---

## 3. Manish Sharma — Security & RBAC Sprint Log

### Summary of Responsibilities
Manish Sharma owned authentication, JWT tokens, session lifecycle, user account management, dynamic role assignment, and password recovery. (Evidence: [`Day_1_to_6_Documentation.md`](<../../backend/java security/Day_1_to_6_Documentation.md>)).

| Sprint Day | Module Focus | Work Completed | Technical Deliverables & Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Day 01** | Session Management | Replaced in-memory token list with database-backed `Session` entity, `SessionRepository`, and `SessionService` tracking active sessions by user and token. | `Session.java`, `SessionService.java`, `SessionController.java` | Complete |
| **Day 02** | Authentication Testing | Authored `AuthenticationIntegrationTest` verifying full Spring Security filter chain for valid login, invalid passwords, non-existent users, and token revocation. | `AuthenticationIntegrationTest.java` | Complete |
| **Day 03** | User Management | Implemented core `User` entity with `createdAt`/`updatedAt` audit fields, replacing legacy `InMemoryUserRegistry` with `UserRepository` and `UserService`. | `AppUser.java`, `UserRepository.java`, `UserService.java`, `UserController.java` | Complete |
| **Day 04** | User–Role Assignment | Built `RoleAssignmentService` utilizing JPA `@ElementCollection` for dynamic user-role assignment with strict `ROLE_` normalization. | `RoleAssignmentService.java`, `Role.java` | Complete |
| **Day 05** | Permission Enforcement | Integrated method-level security with `@EnableMethodSecurity`, custom `JwtAuthenticationEntryPoint`, and `CustomAccessDeniedHandler` returning clean JSON error bodies. | `JwtAuthenticationEntryPoint.java`, `CustomAccessDeniedHandler.java` | Complete |
| **Day 06** | Password Recovery | Developed `PasswordResetToken` entity, BCrypt old-password validation, and 15-minute one-time UUID token reset workflow. | `PasswordResetToken.java`, `PasswordRecoveryController.java` | Complete |

---

## 4. Lakshya Singhal — Frontend Architecture & Hardening Sprint Log

### Summary of Responsibilities
Lakshya Singhal architected the enterprise frontend data layer, token refresh queue, protected routing system, and led repository-wide hardening (PostgreSQL integration tests, safety guards, and financial concurrency).

| Sprint Phase | Focus Area | Work Completed | Technical Deliverables & Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Day 05** | Frontend Data Layer | Architected the enterprise frontend data management layer: typed HTTP error hierarchy, JWT token storage, cache manager with TTL, and custom hooks. | [`DATA_LAYER_README.md`](../../DATA_LAYER_README.md)<br/>`src/services/apiClient.ts`, `src/utils/tokenStorage.ts` | Complete |
| **Day 06** | System Integration | Engineered centralized Axios interceptors, automatic 401 refresh queue, and protected route hierarchy (`ProtectedRoute`, `RoleGuard`, `AdminRoute`). | [`INTEGRATION_README.md`](../../INTEGRATION_README.md)<br/>`src/components/routing/RoleGuard.tsx` | Complete |
| **Phases 9.x** | Hardening & Security Closure | Implemented fail-fast `PostgresSafetyGuardTest`, admissions IDOR elimination, course registration capacity locks, and payment idempotency conflict resolution (HTTP 409). | Git commits `a60c1bc`, `fb51196`, `d101ced`<br/>`PostgresSafetyGuard.java`, `FinanceConcurrencyPostgresIT.java` | Complete |

---

## 5. Prashant Jain — Institutional Management & Campus Sprint Log

### Summary of Responsibilities
Prashant Jain owned the institutional domain baseline, campus management endpoints, and academic scheduling security evaluators.

| Sprint Focus | Focus Area | Work Completed | Technical Deliverables & Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Week 3** | Institution Management | Managed the `feature/institution` branch baseline, institutional entity mapping, and multi-campus relational hierarchies. | [`docs/Branch-Registry.md`](../Branch-Registry.md)<br/>`Institution.java`, `Campus.java`, `CampusController.java` | Complete |
| **Hardening** | Scheduling Security | Authored academic scheduling security evaluation logic for classroom and timetable constraints. | `AcademicSchedulingSecurity.java` | Complete |

---

## 6. Consolidated Weekly Work Mapping

| Week | Milestone Focus | Primary Member Contributions | Key Verification Output |
| :---: | :--- | :--- | :--- |
| **Week 1** | Baseline Relational Architecture | Palak (SIS Schema), Manish (Session DB), Prashant (Institution DDL), Lakshya (Vite Setup) | Flyway V1 baseline schema, H2 dev profiles |
| **Week 2** | Core Domain Implementation | Palak (Student & Guardian CRUD), Manish (Authentication Filter), Lakshya (Data Layer Hooks) | 20+ REST endpoints, MockMvc test baseline |
| **Week 3** | Branch Registry & Security Integration | Palak (Documents & Status), Manish (RBAC Permissions), Prashant (Campuses), Lakshya (Protected Routes) | Branch registry active, JWT refresh queue operational |
| **Week 4** | Hardening, Safety Guards & Packaging | Lakshya (Postgres IT Safety Guards, Financial Idempotency), Team (Integration & Acceptance) | 49 backend test passes, 14 browser routes verified |
