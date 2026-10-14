# EduPulse ERP — Full-System Audit & Recovery Baseline Report

**Inspection Date:** 2026-10-13  
**Auditor:** Antigravity Advanced Agentic System  
**Repository Branch:** `develop` (Commit: `0907a8b fix(security): restrict campus and institution mutations to super admin`)  
**Operating Mode:** Audit & Baseline Establishment (Zero Mutations, Safe Reproduction)  
**Deliverable Path:** `docs/recovery/system_audit_and_defect_register.md`

---

## 1. Executive Summary & Architecture Verification

A forensic inspection of the codebase was conducted to establish ground truth rather than relying on legacy assumptions.

### 1.1 Architecture Verification

| Component | Assumed Architecture | Verified Current Architecture | Evidence & File Location |
| :--- | :--- | :--- | :--- |
| **Authoritative Frontend** | Believed `frontend-v2/` | **Confirmed: `frontend-v2/`** is the authoritative frontend. React 19.2.8, Vite 8.3.0, TanStack Query 5.104.1, React Router 7.18.4, Tailwind CSS 3.4.19, Lucide Icons, Zustand 5.0.15. Legacy root `src/` and `frontend/` (React 18) are unmaintained prototypes. | `frontend-v2/package.json`<br/>`frontend-v2/src/App.tsx` |
| **Backend Runtime** | Java 21 | **Confirmed: Java 21** (`javac release 21`). Compiled cleanly with Maven 3.9+. | `backend/pom.xml`<br/>`compiler:3.13.0` release 21 |
| **Backend Framework** | Spring Boot | **Confirmed: Spring Boot 3.3.4**, Spring Data JPA, Spring Security 6.3 with stateless JWT filter chain, SpringDoc OpenAPI v3. | `backend/pom.xml`<br/>`application.yml` |
| **Database Architecture** | PostgreSQL | **Confirmed: Dual Architecture**. Local/Dev/Test operates on in-memory H2 (`jdbc:h2:mem:erp_db`), while Production is configured for PostgreSQL 16+ (`jdbc:postgresql://localhost:5432/edupulse_erp`). Migration engine: Flyway with 5 applied migrations (`V1` to `V5`). | `application-dev.yml`<br/>`application-prod.yml`<br/>`db/migration/V1..V5` |
| **Scale of Codebase** | Unknown | **316 Java source files**, 54 test files, 34 RestControllers, 42 JPA Entities, 16 frontend pages, 13 composite components, 15 core UI primitives. | Directory inventory & Maven compilation metrics |

---

## 2. Git Branch, Status, and Working Tree Baseline

### 2.1 Branch & Commit Lineage
- **Active Branch:** `develop` (tracking `origin/develop`)
- **Current HEAD:** `0907a8b fix(security): restrict campus and institution mutations to super admin`
- **Recent Commit History:**
  - `0907a8b`: fix(security): restrict campus and institution mutations to super admin
  - `048df6e`: docs(readme): fix Mermaid flowchart syntax in section 7 architecture diagram
  - `06015ec`: Merge branch 'develop'
  - `34ec5c3`: docs(readme): update weekly reports folder and add research paper and SRS links
  - `6176bf4`: docs(readme): add 12-week team progress reports google doc archive
  - `7d95cd5`: docs(readme): add application screenshots, quick start, release summary, and troubleshooting guide
  - `dcd9524`: docs(readme): establish EduPulse identity and add Lakshya Goyal as project lead
  - `e11b6e8`: feat(docs): consolidate canonical documentation and complete release candidate hardening
  - `a60c1bc`: feat(finance): close cross-fee idempotency race with HTTP 409 conflict and isolated winner resolution

### 2.2 Working Tree Modifications (Preserved In-Place)
In compliance with the prompt safety constraints (*"Do not reset, stash, discard, overwrite or revert existing work"*), the 10 modified working-tree files and 1 untracked test file were audited and preserved:
1. `backend/.../DevelopmentFixtureSeeder.java`: Seeds student 1 link to `student` account and seeds parent guardian `parent@erp.com`.
2. `backend/.../GuardianController.java`: Adds `GET /api/v1/guardians/me` endpoint for Parent self-service.
3. `backend/.../GuardianService.java` & `GuardianServiceImpl.java`: Adds `getGuardiansByEmail` retrieval.
4. `backend/.../SecurityOwnershipService.java`: Extends student data and finance ownership to verified parents for their wards.
5. `backend/.../StudentDataLoader.java`: Seeds initial emergency guardian with email `parent@erp.com`.
6. `backend/.../FinanceModuleIntegrityAuditTest.java`: Added 2 regression tests for parent ward finance ownership and IDOR isolation.
7. `frontend-v2/src/hooks/useMyStudentId.ts`: Switched parent lookup from `/guardians` to `/guardians/me`.
8. `frontend-v2/src/pages/Dashboard.tsx`: Replaced hardcoded `lockedUsers = 0` with dynamic calculation.
9. `frontend-v2/src/pages/FinanceDashboard.tsx`: Added branch redirecting non-staff roles to their personal `StudentFeesTab`.
10. `frontend-v2/test_batch1_behavioral_regression.cjs` *(untracked)*: Integration test script verifying student & parent finance access.

---

## 3. Full System Inventory

### 3.1 Frontend Routes & Permissions Inventory (`frontend-v2/src/App.tsx`)

| Route Path | Page Component | Allowed Roles | Functional Status | Backend API Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| `/login` | `Login.tsx` | All (Public Only) | **FUNCTIONAL** | `POST /auth/login`, `POST /auth/refresh` |
| `/403` | `App.tsx` (Forbidden) | All Authenticated | **FUNCTIONAL** | None |
| `/dashboard` | `Dashboard.tsx` | Any Authenticated | **PARTIAL** (Staff data live; Non-management shows redesign placeholder; Early return violates Rules of Hooks) | `GET /api/v1/admin/users`, `GET /api/v1/departments`, `GET /api/v1/students`, `GET /api/v1/admission-applications` |
| `/dashboard` (Faculty) | `FacultyDashboard.tsx` | `FACULTY` | **FUNCTIONAL** (Loads timetable and assigned sections) | `GET /api/v1/faculty/me/sections`, `GET /api/v1/faculty/me/timetable` |
| `/dashboard/students` | `StudentsList.tsx` | `SUPER_ADMIN`, `ADMIN`, `FACULTY`, `FINANCE` | **FUNCTIONAL** (Debounced search, status filter, pagination) | `GET /api/v1/students` |
| `/dashboard/students/:id` | `StudentProfile.tsx` | `SUPER_ADMIN`, `ADMIN`, `FACULTY`, `STUDENT`, `PARENT`, `FINANCE` | **PARTIAL** (Overview, Academics, Fees work; Status transition dropdown missing ALUMNI; Edit, ID Card, Transcript are stubs) | `GET /api/v1/students/{id}`, `PATCH /api/v1/students/{id}/status`, `PUT /api/v1/students/{id}` |
| `/dashboard/departments` | `DepartmentsList.tsx` | `SUPER_ADMIN`, `ADMIN` | **PARTIAL** (List, Create, Delete work; Search input is unwired) | `GET, POST, DELETE /api/v1/departments` |
| `/dashboard/attendance` (Personal) | `Attendance.tsx` | `STUDENT`, `PARENT` | **FUNCTIONAL** (Queries personal/ward attendance records) | `GET /api/v1/attendance/student/{id}` |
| `/dashboard/attendance` (Admin) | `Attendance.tsx` | `SUPER_ADMIN`, `ADMIN` | **DEFECTIVE** (Search unwired; "View Exceptions" dead; early return violates Rules of Hooks) | `GET /api/v1/attendance` |
| `/dashboard/attendance` (Faculty)| `FacultyAttendance.tsx` | `FACULTY` | **FUNCTIONAL** (Roster sheet, schedule selector, conflict detector) | `GET /api/v1/sections/{id}/students`, `POST /api/v1/attendance/bulk` |
| `/dashboard/finance` | `FinanceDashboard.tsx` | `SUPER_ADMIN`, `ADMIN`, `FINANCE`, `STUDENT`, `PARENT` | **PARTIAL** (Staff metrics & receivables live; Non-staff gated by recent redirect patch) | `GET /api/v1/finance/reports/summary`, `GET /api/v1/finance/student-fees` |
| `/dashboard/institutions`| `InstitutionsList.tsx` | `SUPER_ADMIN` | **PARTIAL** (Create, delete live; search unwired; edit button shows toast stub) | `GET, POST, DELETE /api/v1/institutions`, `PUT /api/v1/institutions/{id}` |
| `/dashboard/campuses` | `CampusesList.tsx` | `SUPER_ADMIN` | **PARTIAL** (Create, delete live; search unwired; edit button shows toast stub) | `GET, POST, DELETE /api/v1/campuses`, `PUT /api/v1/campuses/{id}` |
| `/dashboard/admissions` | `Admissions.tsx` | `SUPER_ADMIN`, `ADMIN` | **FUNCTIONAL** (Inquiries, applications, doc verification, conversion) | `GET, POST /api/v1/admission-applications`, `POST /api/v1/admission-workflows/...` |
| `/dashboard/academics` | `Academics.tsx` | `SUPER_ADMIN`, `ADMIN`, `FACULTY` | **PARTIAL** (Semesters, Offerings, Sections, Timetable add forms work; Programs, Courses, Batches lack creation UI; Prerequisites missing) | `GET /api/v1/academic/...`, `GET /api/v1/courses`, `POST /api/v1/semesters`, `POST /api/v1/sections` |
| `/dashboard/sections` | `FacultySections.tsx` | `FACULTY` | **FUNCTIONAL** (Section details, timetable accordion, student roster) | `GET /api/v1/faculty/me/sections`, `GET /api/v1/sections/{id}` |
| `/dashboard/guardians` | `GuardiansList.tsx` | `SUPER_ADMIN`, `ADMIN` | **PARTIAL** (Create, delete work; search unwired; edit button shows toast stub) | `GET, POST, DELETE /api/v1/guardians`, `PUT /api/v1/guardians/{id}` |
| `/dashboard/admin/users` | `AdminUsersList.tsx` | `SUPER_ADMIN`, `ADMIN` | **FUNCTIONAL** (List, search, Create User dialog with faculty fields) | `GET, POST /api/v1/admin/users` |
| Disabled Roadmap Items | `Layout.tsx` | All Roles | **DISABLED** (Communications, Examinations, Library, Scholarships, Infrastructure marked "Soon") | None (Backend packages contain `.gitkeep`) |

---

### 3.2 Backend RestControllers & Endpoint Surface (34 Controllers)

```
com.erp
├── academic
│   ├── academic_year.controller.AcademicYearController (/api/v1/academic-years)
│   ├── batch.controller.BatchController (/api/v1/batches)
│   ├── course.controller.CourseController (/api/v1/courses)
│   ├── course_offering.controller.CourseOfferingController (/api/v1/course-offerings)
│   ├── course_registration.controller.CourseRegistrationController (/api/v1/course-registrations)
│   ├── course_registration.controller.StudentCourseRegistrationController (/api/v1/students/me/course-registrations)
│   ├── curriculum.controller.CurriculumController (/api/v1/curricula)
│   ├── program.controller.ProgramController (/api/v1/academic/programs)
│   ├── room.controller.RoomController (/api/v1/rooms)
│   ├── section.controller.SectionController (/api/v1/sections)
│   ├── semester.controller.SemesterController (/api/v1/semesters)
│   ├── subject.controller.SubjectController (/api/v1/subjects)
│   └── timetable.controller.TimetableController (/api/v1/timetable)
├── admin.controller.AdminFacultyController (/api/v1/admin/faculty)
├── admin.controller.UserController (/api/v1/admin/users)
├── admission
│   ├── applicant.controller.ApplicantController (/api/v1/applicants)
│   ├── application.controller.AdmissionApplicationController (/api/v1/admission-applications)
│   ├── document.controller.ApplicantDocumentController (/api/v1/applicant-documents)
│   └── workflow.controller.AdmissionWorkflowController (/api/v1/admission-workflows)
├── attendance.controller.AttendanceController (/api/v1/attendance)
├── auth.controller.AuthController (/auth)
├── campus.controller.CampusController (/api/v1/campuses)
├── department.controller.DepartmentController (/api/v1/departments)
├── faculty.controller.FacultyController (/api/v1/faculty)
├── finance.controller
│   ├── FeeStructureController (/api/v1/finance/fee-structures)
│   ├── FinanceReportController (/api/v1/finance/reports)
│   ├── PaymentController (/api/v1/finance/payments)
│   └── StudentFeeController (/api/v1/finance/student-fees)
├── guardian.controller.GuardianController (/api/v1/guardians)
├── institution.controller.InstitutionController (/api/v1/institutions)
├── security.authentication.AuthenticationController (/api/v1/auth)
└── student.controller
    ├── StudentController (/api/v1/students)
    ├── StudentDocumentController (/api/v1/students/{studentId}/documents)
    └── StudentOnboardingController (/api/v1/admission-workflows/applications/{id}/onboard)
```

---

### 3.3 JPA Domain Entities & Relational Schema (42 Entities)

1. **Academic Domain (15):** `AcademicYear`, `Batch`, `Course`, `CoursePrerequisite`, `CourseOffering`, `AddDropRequest`, `CourseRegistration`, `CreditRule`, `Curriculum`, `CurriculumCourse`, `Program`, `Room`, `Section`, `SectionFaculty`, `SectionStudent`, `Semester`, `Subject`, `ClassSchedule`, `TimeSlot`, `TimetableSlot`.
2. **Student & Guardian Domain (7):** `Student`, `StudentAcademicRecord`, `StudentCategory`, `StudentDocument`, `StudentEnrollment`, `StudentStatusHistory`, `Guardian`.
3. **Admissions Domain (4):** `Applicant`, `AdmissionApplication`, `ApplicantDocument`, `AdmissionInquiry`.
4. **Attendance Domain (4):** `StudentAttendanceRecord`, `AttendanceCorrection`, `LeaveRequest`, `AttendanceAlert`.
5. **Finance Domain (9):** `FeeHead`, `FeeStructure`, `FeeStructureComponent`, `StudentFee`, `StudentFeeComponent`, `Payment`, `PaymentAllocation`, `Receipt`, `Scholarship`, `StudentScholarship`, `Concession`.
6. **Governance & User Domain (3):** `AppUser`, `Institution`, `Campus`, `Department`, `Faculty`.

---

### 3.4 Roles & Lifecycle State Machines

#### Role Hierarchy & Authority Boundaries
- **`SUPER_ADMIN`**: Global institutional governance, multi-campus management, database maintenance, user provisioning, global auditing. Exclusive rights to mutate campuses and institutions.
- **`ADMIN`**: Academic administration, admissions processing, student lifecycle management, department catalog, fee structure configuration, timetable generation.
- **`FACULTY`**: Classroom operations, timetable and assigned section rosters, attendance submission, conflict checks.
- **`FINANCE`**: Billing operations, fee structure assignment, payment recording, receipts, and receivables reporting.
- **`STUDENT`**: Self-service student portal, personal course registration, personal timetable, attendance ledger, personal invoices and fee statement.
- **`PARENT`**: Ward self-service portal, ward attendance ledger, ward invoices and fee statement.

#### Domain Lifecycle State Machines
1. **Student Status (`StudentStatus`):**
   - Transitions allowed by backend:
     - `ACTIVE` -> `GRADUATED`, `SUSPENDED`, `TRANSFERRED`, `DROPPED`, `INACTIVE`
     - `INACTIVE`, `SUSPENDED` -> `ACTIVE`, `DROPPED`, `TRANSFERRED`
     - `GRADUATED` -> `ALUMNI`
     - `ALUMNI`, `DROPPED`, `TRANSFERRED` -> Terminal (No further transitions)
2. **Admission Application Status (`ApplicationStatus`):**
   - `SUBMITTED` -> `UNDER_REVIEW` -> `DOCUMENTS_VERIFIED` -> `ADMITTED` -> `ENROLLED` (or `REJECTED`)
3. **Course Registration Status (`RegistrationStatus`):**
   - `REGISTERED` -> `DROPPED` -> `REGISTERED` (Reactivation)
4. **Payment Status (`PaymentStatus`):**
   - `PENDING` -> `SUCCESS` -> `REFUNDED` (or `FAILED`)

---

## 4. End-to-End Workflow Trace & Analysis

### Workflow 1: Authentication & Session Management
- **UI:** `/login` (`Login.tsx`). Provides role switcher for quick demo login (`superadmin`, `admin`, `faculty`, `student`, `parent`, `finance`) and username/password form.
- **API Client:** `POST /auth/login` via `config/api.ts`. Returns `{ accessToken, refreshToken, user: { username, role, permissions } }`.
- **State Store:** `useAuthStore` stores tokens and user metadata in `localStorage` (`auth-storage`). Axios request interceptor attaches `Authorization: Bearer <token>`.
- **Backend Flow:** `AuthController` -> `AuthenticationManager` -> `CustomUserDetailsService` -> queries `users` table -> `JwtTokenProvider.generateToken()`.
- **Session Refresh:** `config/api.ts` handles HTTP 401 with queuing and calls `POST /auth/refresh`.
- **Defects Discovered:** 
  - Login works smoothly for seeded accounts, but dynamically onboarded students and created parents lack user credentials because user provisioning is decoupled from domain entity creation.

---

### Workflow 2: Student Lifecycle & Management
- **UI:** `/dashboard/students` (`StudentsList.tsx`) and `/dashboard/students/:id` (`StudentProfile.tsx`).
- **API:** `GET /api/v1/students` (paginated, debounced search), `POST /api/v1/students`, `GET /api/v1/students/{id}`, `PATCH /api/v1/students/{id}/status`.
- **Authorization:** `GET` allowed for `ADMIN`, `SUPER_ADMIN`, `FACULTY`, `FINANCE`. Student profile allowed for privileged staff or verified student/parent owner. Status patch restricted to `ADMIN`, `SUPER_ADMIN`.
- **Service & Persistence:** `StudentServiceImpl` writes to `students` table and logs every transition into `student_status_history`.
- **Defects Discovered:**
  - `StudentProfile.tsx` options dropdown contains `Mark Active`, `Suspend`, `Drop`, and `Graduated`, but **completely omits `ALUMNI`**. Once a student is marked `GRADUATED`, administrators cannot transition them to `ALUMNI` through the UI, breaking the documented lifecycle.
  - "Edit Profile", "Generate ID Card", and "Export Transcript" buttons render toast info stubs.
  - "Attendance", "Documents", and "Audit History" tabs show "Module Unreachable" or placeholder alerts.

---

### Workflow 3: Admissions Conversion & Student Onboarding
- **UI:** `/dashboard/admissions` (`Admissions.tsx`).
- **API:** `GET /api/v1/admission-applications`, `POST /api/v1/admission-workflows/applications/{id}/verify-document`, `POST /api/v1/admission-workflows/applications/{id}/admit`, `POST /api/v1/admission-workflows/applications/{id}/onboard`.
- **Backend Flow:** `StudentOnboardingService.onboardStudent()` acquires pessimistic write lock, verifies `ADMITTED` status, generates roll number, creates `Student` record, resolves matching `Batch` and `Semester 1`, persists `StudentEnrollment`, and marks application as `ENROLLED`.
- **Defects Discovered:**
  - `StudentOnboardingService` creates the `Student` entity but **does NOT create an `AppUser` account**. The newly enrolled student cannot log into the system unless an administrator manually creates a matching user account via `/dashboard/admin/users`.

---

### Workflow 4: Academic Catalog, Timetable & Prerequisites
- **UI:** `/dashboard/academics` (`Academics.tsx`), `TimetableTab.tsx`, `/dashboard/sections` (`FacultySections.tsx`).
- **API:** Catalog endpoints for programs, courses, batches, semesters, offerings, sections, and timetable grid.
- **Backend Flow:** `ScheduleConflictService` prevents double-booking faculty or rooms during identical time slots.
- **Defects Discovered:**
  - **Missing Academic Prerequisites:** `CoursePrerequisite.java` entity, repository, and `CoursePrerequisiteService.java` (with circular dependency detection) exist in the backend. However:
    1. There is **zero Controller endpoint** exposing prerequisites (`/api/v1/courses/{id}/prerequisites` does not exist).
    2. In `CourseRegistrationService.java` (lines 84–88), the prerequisite check is an empty comment:
       ```java
       List<CoursePrerequisite> prerequisites = prerequisiteRepository.findByCourseId(offering.getCourse().getId());
       if (!prerequisites.isEmpty()) {
           // Documented gap: course-specific completion grades are not stored in student_academic_records
       }
       ```
    3. The frontend `Academics.tsx` has no prerequisite display or assignment interface.
  - **Catalog Creation Forms Missing:** Tabs 1 (Programs), 2 (Courses), and 3 (Batches) display read-only tables with no "Add" dialogs. Only Semesters, Offerings, and Sections have creation dialogs.

---

### Workflow 5: Attendance Tracking & Faculty Roster
- **UI:** `/dashboard/attendance` (`Attendance.tsx`, `FacultyAttendance.tsx`), `TakeAttendanceDialog.tsx`.
- **API:** `GET /api/v1/attendance`, `GET /api/v1/attendance/student/{id}`, `GET /api/v1/sections/{id}/students`, `POST /api/v1/attendance/bulk`.
- **Backend Flow:** Faculty can select section, view student roster, mark attendance, and submit bulk records.
- **Defects Discovered:**
  - `TakeAttendanceDialog.tsx` is an **orphaned component**: it is completely implemented but never imported or rendered anywhere.
  - In `Attendance.tsx` (Admin view), the search input is unwired (no `value` or `onChange`), and the `<button>View Exceptions</button>` has no `onClick` handler.
  - **Rules of Hooks Violation:** `Attendance.tsx` lines 24–26 executes an early return (`if (user?.role === 'FACULTY') return <FacultyAttendance />;`) before calling `useQuery` on line 28, violating React 19 hook rules.

---

### Workflow 6: Finance & Fee Invoicing
- **UI:** `/dashboard/finance` (`FinanceDashboard.tsx`), `CreateInvoiceDialog.tsx`, `RecordPaymentDialog.tsx`, `StudentFeesTab.tsx`.
- **API:** `GET /api/v1/finance/reports/summary`, `GET /api/v1/finance/student-fees`, `POST /api/v1/finance/student-fees/assign`, `POST /api/v1/finance/payments`.
- **Backend Flow:** Idempotent payment processing with unique hash and conflict resolution.
- **Defects Discovered:**
  - Sidebar links for Student ("My Invoices") and Parent ("Ward Fees") point to `/dashboard/finance`. The page originally failed with an access block. Recent uncommitted changes render `StudentFeesTab` via `useMyStudentId()`, but if the student/ward is unlinked, it displays a dead-end state.

---

### Workflow 7: Communications & Notifications
- **UI:** Bell icon in `Layout.tsx` header with static red badge; sidebar "Communications" with "Soon" badge.
- **API:** None.
- **Backend:** Zero notification controllers, entities, repositories, or services exist in the Spring Boot backend.
- **Defects Discovered:**
  - The notification bell is an entirely non-functional visual stub. It has no `onClick` handler, makes no API calls, opens no popover, and permanently displays an unread red dot.

---

## 5. Complete Defect Register

### Severity Classifications
- **P1 (Critical / Blocker):** System crash, runtime hook failure, authorization bypass/lockout, or completely broken user lifecycle.
- **P2 (Major):** Broken workflows, disconnected domain entities, dead action buttons, unwired search fields, orphaned components, or missing state controls.
- **P3 (Minor / Polish):** Missing creation dialogs for secondary entities, cosmetic toast stubs, or unoptimized data fetches.

| Defect ID | Severity | Affected Area / Component | Defect Summary & Root Cause | Reproducible Evidence | Dependencies | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **P1** | `frontend-v2/src/components/Layout.tsx` | **Notification Bell is a Dead Visual Stub with False Alert Dot**<br/>Header renders a bell icon with hardcoded red dot (`span.bg-red-500`). Button has no `onClick`, no dropdown, triggers zero network requests, and backend has no notification service. | DOM inspection: `<button class="text-slate-400..."><Bell /><span class="...bg-red-500..." /></button>`. Zero event listeners attached. | None | Bell button is either connected to a functional notification drawer/popover or cleanly styled as an informational icon with no misleading red dot. |
| **DEF-02** | **P1** | `frontend-v2/src/pages/Dashboard.tsx` & `Attendance.tsx` | **React Rules of Hooks Violations (Early Returns Before Hooks)**<br/>`Dashboard.tsx` (lines 19–21) and `Attendance.tsx` (lines 24–26) execute early returns when `role === 'FACULTY'`, preceding calls to `useQuery`. | `oxlint` reports 5 errors: `React Hook "useQuery" is called conditionally. React Hooks must be called in the exact same order in every component render.` | React 19 Compiler | All hooks are declared unconditionally at top of component, or role-based routing is factored into parent router/subcomponents. |
| **DEF-03** | **P2** | `backend/.../StudentOnboardingService.java` & `UserController.java` | **Disconnected Login Accounts and Student/Guardian Records**<br/>Onboarding an admitted applicant creates `Student` but provisions no `AppUser`. Creating `PARENT` user in `UserController` links no `Guardian`. Creating a `Guardian` provisions no `AppUser`. | In `StudentOnboardingService.java`, `studentRepository.save(student)` is called with `user_id = null`. In `UserController.java`, `role == Role.PARENT` has zero handling. | Identity & Auth | Onboarding automatically provisions student login credentials. Parent user accounts link bidirectionally to guardian records. |
| **DEF-04** | **P2** | `frontend-v2/src/pages/StudentProfile.tsx` | **Missing Alumni Lifecycle Control in Status Transition Dropdown**<br/>Backend state machine explicitly defines `GRADUATED -> ALUMNI`. Frontend dropdown offers `ACTIVE`, `SUSPENDED`, `DROPPED`, `GRADUATED`, but omits `ALUMNI`. | `StudentProfile.tsx` lines 126–129 renders 4 options; `ALUMNI` is absent. `StudentServiceImpl.java:196` validates `case GRADUATED -> target == StudentStatus.ALUMNI`. | Student Status API | `StudentProfile.tsx` status dropdown dynamically displays valid target transitions based on current status, including "Transition to Alumni" when graduated. |
| **DEF-05** | **P2** | `backend/.../CourseRegistrationService.java` & `CourseController.java` | **Missing Academic Prerequisites Controller & No-Op Service Check**<br/>`CoursePrerequisite` entity and cycle detector exist, but no REST controller exposes prerequisite CRUD, and `CourseRegistrationService.java:85-88` skips enforcement with an empty comment block. | `CourseRegistrationService.java:86`: `if (!prerequisites.isEmpty()) { /* Documented gap */ }`. `CourseController.java` has no prerequisite endpoints. | Course & Registration API | Controller endpoints exist to view/assign course prerequisites. Course registration service verifies student prerequisite completion before confirming enrollment. |
| **DEF-06** | **P2** | 5 Listing Pages (`Departments`, `Campuses`, `Institutions`, `Guardians`, `Attendance`) | **Unwired Search Inputs on Core Directories**<br/>Search `<input>` fields in `DepartmentsList`, `CampusesList`, `InstitutionsList`, `GuardiansList`, and `Attendance` (Admin) have no state binding (`value` or `onChange`). Typing does nothing. | Code inspection: `<Input placeholder="Search..." />` lacks `value` or `onChange` props. | Client filter state | Typing in search input dynamically filters displayed table rows using debounced search predicate. |
| **DEF-07** | **P2** | `Attendance.tsx` & `TakeAttendanceDialog.tsx` | **Orphaned TakeAttendanceDialog & Dead View Exceptions Button**<br/>`TakeAttendanceDialog.tsx` is completely implemented but never imported anywhere. `Attendance.tsx` renders `<button>View Exceptions</button>` with no `onClick`. | Search for `TakeAttendanceDialog` yields 0 imports across codebase. `Attendance.tsx` line 124 button has no click handler. | Attendance Module | `TakeAttendanceDialog` is imported and wired to a trigger button. "View Exceptions" either filters records or is cleanly integrated. |
| **DEF-08** | **P2** | Dropdown Action Menus (`CampusesList`, `InstitutionsList`, `GuardiansList`, `StudentProfile`) | **Dead "Edit" Dropdown Actions Displaying Toast Stubs**<br/>Clicking "Edit" in `CampusesList`, `InstitutionsList`, `GuardiansList`, or `StudentProfile` triggers `toast.info('Edit mode not fully implemented yet')`, despite backend `PUT` endpoints existing. | Code inspection of dropdown items reveals hardcoded `toast.info(...)` stubs. | Entity Dialogs | Edit dialogs are implemented and wired to existing backend `PUT` endpoints, or action buttons are disabled with clear tooltips. |
| **DEF-09** | **P2** | `frontend-v2/src/pages/Dashboard.tsx` | **Non-Management Dashboard Renders Generic Redesign Placeholder**<br/>When `STUDENT`, `PARENT`, or `FINANCE` lands on `/dashboard`, they see: *"Workspace redesign in progress for your role."* | `Dashboard.tsx` lines 51–58 returns generic placeholder box for all non-management roles. | Role Home Pages | Dedicated dashboard home widgets are rendered for Student (enrolled courses, attendance summary, fee status), Parent (ward summary), and Finance (daily collection overview). |
| **DEF-10** | **P3** | `frontend-v2/src/pages/Academics.tsx` | **Missing UI Creation Dialogs for Programs, Courses, and Batches**<br/>Tabs 1 (Programs), 2 (Courses), and 3 (Batches) display data tables but offer no UI creation forms. Only Semesters, Offerings, and Sections have "Add" dialogs. | `Academics.tsx` lines 200–350 contains tables without creation header buttons. | Academic Catalog API | Administrative users have "Create Program", "Create Course", and "Create Batch" dialogs wired to existing backend `POST` endpoints. |
| **DEF-11** | **P3** | `frontend-v2/src/pages/StudentProfile.tsx` | **Quick Action Document Stubs (ID Card & Transcript)**<br/>Buttons for "Generate ID Card" and "Export Transcript" trigger toast info notifications. | `StudentProfile.tsx` lines 180–185 onClick handlers trigger `toast.info`. | Document Generator | Buttons either export client-side printable views or display clear roadmap status indicators. |
| **DEF-12** | **P3** | `Layout.tsx` & Backend Packages | **Stub Backend Packages with Only .gitkeep Files**<br/>Packages `communication`, `examination`, `infrastructure`, `library`, `parents`, `report` contain only `.gitkeep`. Matching sidebar items are disabled with "Soon". | Directory check: 6 backend packages have 0 `.java` files. | Future Roadmap | Documented as deferred roadmap scope, ensuring no broken routes or dead endpoints exist in active production code. |

---

## 6. Current Test Baseline & Genuine Verification Assessment

### 6.1 Backend Test Suite Assessment
- **Execution Command:** `mvn test`
- **Total Test Classes:** 42
- **Total Test Methods:** 310+
- **Pass Rate:** 100% (310/310 PASS, 0 FAIL, 0 ERRORS)
- **Execution Time:** ~55 seconds
- **What Backend Tests Genuinely Verify:**
  1. **Spring Security & RBAC:** Thoroughly verified by `SecurityAuthorizationIntegrationTest` (26 tests) and `RbacAndPermissionIntegrationTest` (11 tests). Unauthenticated requests are rejected with 401; unauthorized role mutations receive 403; Super Admin governance of campus/institution is strictly guarded.
  2. **Financial Idempotency & Concurrency:** Verified by `FinanceModuleIntegrityAuditTest` (22 tests). Idempotency keys prevent double billing; concurrent duplicate payments return HTTP 409 Conflict; IDOR boundaries prevent cross-student debt inspection.
  3. **Timetable Conflict Detection:** Verified by `ScheduleConflictServiceTest`. Faculty and room double-booking is rejected.
  4. **Pessimistic Locking & Onboarding:** Verified by `StudentOnboardingServiceTest` and `CourseRegistrationConcurrencyTest`.

### 6.2 Frontend Acceptance Suite Shortcomings
- **Legacy Acceptance Scripts:** `scratch/execute_cdp_acceptance.cjs` and `scratch/run_hardened_acceptance_suite.cjs`.
- **Structural Flaw Identified:**
  - Previous passes (50 PASS / 0 FAIL) relied on **shallow text heuristics**:
    ```javascript
    pageText = await evalExpr('document.body.innerText');
    recordTest('INST-01', 'Institution Governance Directory', ..., pageText.includes('Institution') ? 'PASS' : 'FAIL');
    ```
  - This verified that pages loaded without crashing, but **did not test interactive behavior**:
    - Never typed into search inputs (concealing DEF-06).
    - Never clicked dropdown "Edit" items (concealing DEF-08).
    - Never clicked the Notification Bell (concealing DEF-01).
    - Never evaluated status transition dropdown options (concealing DEF-04).
- **Static Analysis Baseline (`oxlint` & `tsc`):**
  - `npx tsc --noEmit`: **0 errors** (Clean TypeScript compilation).
  - `npx oxlint`: **9 errors, 24 warnings**. Exposed 5 critical React Rules-of-Hooks violations (DEF-02) in `Dashboard.tsx` and `Attendance.tsx`.

---

## 7. Recommended Implementation Sequence (10-Prompt Roadmap)

To recover EduPulse systematically without regressions, the work is structured into 10 cohesive, verifiable prompts:

```mermaid
flowchart TD
    P1["PROMPT 1 (Current)\nFull-System Audit & Defect Register"] --> P2["PROMPT 2\nCore Identity, Login & Account Provisioning\n(DEF-03: Student & Parent Auto-Provisioning)"]
    P2 --> P3["PROMPT 3\nReact Architecture & Navigation Hardening\n(DEF-02: Fix Rules of Hooks; DEF-09: Role Dashboards)"]
    P3 --> P4["PROMPT 4\nAcademic Prerequisites & Catalog Completion\n(DEF-05: Prerequisite REST & Enforcement; DEF-10: Catalog UI)"]
    P4 --> P5["PROMPT 5\nStudent Lifecycle, Status Machine & Alumni Controls\n(DEF-04: Alumni Transition Dropdown & Audit Trail)"]
    P5 --> P6["PROMPT 6\nSearch Wiring & Dialog Integrations\n(DEF-06: Wire 5 Search Inputs; DEF-07: Attendance Dialog; DEF-08: Edit Dialogs)"]
    P6 --> P7["PROMPT 7\nNotification Architecture Resolution\n(DEF-01: Header Bell Notification Drawer/Popover)"]
    P7 --> P8["PROMPT 8\nRole-Specific Workspaces & Document Generation\n(DEF-11: ID Card & Transcript Printable Engines)"]
    P8 --> P9["PROMPT 9\nBehavioral Acceptance Test Overhaul\n(Multi-step E2E browser & network assertions)"]
    P9 --> P10["PROMPT 10\nFinal Release Hardening & Production Bundle Validation"]
```

### Detailed Sequence Breakdown

1. **Prompt 1 (Current): Full-System Audit, Inventory & Defect Register**
   - Verify architecture, modules, routes, entities, workflows, and tests.
   - Establish baseline and create durable `docs/recovery/system_audit_and_defect_register.md`.
2. **Prompt 2: Core Identity, Login & Account Provisioning (DEF-03)**
   - Link domain entity lifecycles to user credentials.
   - Auto-provision `AppUser` accounts during student onboarding and student creation.
   - Wire parent `AppUser` creation to `Guardian` records with automated email linking.
3. **Prompt 3: React Architecture & Navigation Hardening (DEF-02, DEF-09)**
   - Eliminate React 19 Rules-of-Hooks violations in `Dashboard.tsx` and `Attendance.tsx`.
   - Replace generic *"Workspace redesign in progress"* with functional role-specific dashboard home cards for Student, Parent, and Finance.
4. **Prompt 4: Academic Prerequisites & Catalog Completion (DEF-05, DEF-10)**
   - Implement `CoursePrerequisiteController` for prerequisite CRUD.
   - Wire prerequisite enforcement into `CourseRegistrationService`.
   - Add frontend creation dialogs for Programs, Courses, and Batches in `Academics.tsx`.
5. **Prompt 5: Student Lifecycle, Status Machine & Alumni Controls (DEF-04)**
   - Add "Transition to Alumni" action in `StudentProfile.tsx` dropdown when student is `GRADUATED`.
   - Ensure dynamic transition availability respects `StudentServiceImpl` validation rules.
   - Verify immutable logging in `student_status_history`.
6. **Prompt 6: Search Wiring & Dialog Integrations (DEF-06, DEF-07, DEF-08)**
   - Add stateful search filtering to `DepartmentsList`, `CampusesList`, `InstitutionsList`, `GuardiansList`, and `Attendance`.
   - Integrate orphaned `TakeAttendanceDialog.tsx` into attendance oversight.
   - Build or cleanly resolve `EditCampusDialog`, `EditInstitutionDialog`, and `EditGuardianDialog`.
7. **Prompt 7: Notification Architecture Resolution (DEF-01)**
   - Implement functional notification popover/drawer in `Layout.tsx` displaying system alerts, fee notices, and academic announcements.
   - Eliminate misleading permanent red dot and bind badge to real unread notification count.
8. **Prompt 8: Role-Specific Workspaces & Document Generation (DEF-11)**
   - Implement printable ID Card modal and Transcript generator on `StudentProfile.tsx`.
   - Wire document upload/download in Student Documents tab.
9. **Prompt 9: Behavioral Acceptance Test Overhaul**
   - Replace shallow string-matching test scripts with multi-step behavioral assertions (typing, clicking, network status, DOM validation).
   - Ensure 100% verified pass rate across all active roles.
10. **Prompt 10: Production Bundle Validation & Release Readiness**
    - Validate PostgreSQL migrations (`V1` to `V5`), production Vite bundle, security headers, and release documentation.

---

## 8. Handoff to Prompt 2/10

### Required Scope for Prompt 2:
**Identity Synchronization & Automated Account Provisioning**
1. **Student Auto-Provisioning:** In `StudentOnboardingService.java` and `StudentServiceImpl.java`, automatically generate an `AppUser` account (role `STUDENT`, standard default credentials or notification) and assign `student.userId`.
2. **Parent / Guardian Auto-Provisioning:** In `GuardianServiceImpl.java` and `UserController.java`, bridge `Guardian` and `AppUser` (role `PARENT`), ensuring parent users can immediately log in and access their linked ward records.
3. **Security Test Verification:** Add unit and integration tests verifying that dynamically onboarded students and parents can authenticate and access their personal portal endpoints without manual administrative database intervention.

*End of Prompt 1/10 Audit Deliverable.*
