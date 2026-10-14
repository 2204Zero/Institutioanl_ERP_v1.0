# EduPulse ERP — Prompt 2/10 Completion Report
**Identity, Account Provisioning, and JSON Development Strategy**

---

## 1. Executive Summary & Root Cause Analysis

### A. Student Account Auto-Provisioning & Linking
* **Previous State / Root Cause:**
  1. Student enrollment in `StudentServiceImpl.java` created the student entity, assigned a roll number, and generated status history, but never created a corresponding `users` authentication record. As a result, newly enrolled students had no credentials and could not log in to the portal.
  2. Admission conversion in `StudentOnboardingService.java` generated a roll number and institutional email, but failed to provision an `AppUser` account or link `user_id`.
  3. In `StudentIdentityService.java`, the `/students/me` resolution logic relied on matching email address rather than enforcing immutable account ownership (`userId`), permitting spoofing or cross-identity misattribution if emails overlapped.
* **Resolution Implemented:**
  1. Created `UserAccountProvisioningService.java` with cryptographically secure credentials (`SecureRandom`, 16 characters including uppercase, lowercase, numbers, and symbols).
  2. Integrated transactional account provisioning into `StudentServiceImpl.createStudent` and `StudentOnboardingService.onboardStudent`.
  3. Guaranteed strict role isolation: attempts to provision a student account using an email already registered under another role (e.g. `FACULTY`, `PARENT`) are rejected with `BusinessException` (HTTP 400).
  4. One-time credentials (`temporaryPassword`, `username`) are returned solely in the initial creation response DTO (`StudentResponseDto`), and transient fields ensure they are NEVER persisted unhashed or returned on subsequent read/get APIs.
  5. Enforced strict ownership matching in `StudentIdentityService.java`: if a student record exists with a matching email but belongs to a different `userId`, identity resolution is rejected.

---

### B. Guardian Provisioning, Multi-Ward Linking & IDOR Elimination
* **Previous State / Root Cause:**
  1. `Guardian` domain entity lacked a `userId` foreign key. It only held `email`, `phone`, and a direct `@ManyToOne Student student` association.
  2. In `SecurityOwnershipService.java`, parent access authorization (`canAccessStudentData`, `canAccessStudentFinance`, `canAccessStudentAttendance`, `canAccessGuardianData`) resolved parents via `guardianRepository.findByEmail(userEmail)`. Any user registering with a parent's email could automatically access the student's records without admin verification or account linkage.
  3. When an admin created a user with `Role.PARENT` in `UserController.java`, the system did not link existing guardian records.
  4. Multi-ward support was broken: linking a guardian to a second ward severed the guardian link to the first ward due to single-student entity linkage.
* **Resolution Implemented:**
  1. Added `user_id BIGINT` column, foreign key constraint `fk_guardians_user`, and migration `V6__link_guardians_to_users.sql`. Added `userId` property to `Guardian.java` and `GuardianResponseDto.java`.
  2. Updated `SecurityOwnershipService.java`: parent authorization strictly requires authenticated account linking via `guardianRepository.findByUserId(principal.getId())`. Insecure email-based access is completely eliminated for authenticated `UserPrincipal` sessions.
  3. Enhanced `GuardianServiceImpl.linkGuardianToStudent`: multi-ward relationships are preserved by creating an additional relation record for the new student ward sharing the exact same `userId`.
  4. Updated `GuardianController.java`: `/guardians/me` now queries `guardianService.getGuardiansByUserId(principal.getId())`, enabling parents to view all their wards from a unified endpoint.
  5. Updated `UserController.java`: when an admin provisions a user with `Role.PARENT`, unlinked guardian records matching the email are automatically linked to `user.getId()`.

---

### C. JSON Development Mode Strategy
* Formulated comprehensive Architectural Decision Record (ADR) in `docs/recovery/json_development_mode_strategy.md`.
* **Decision:** Keep Spring Data JPA + PostgreSQL as the unified production/test standard throughout Prompt 2.
* Designed a 4-phase non-breaking roadmap for file-based JSON repository adapters using Spring profiles (`@Profile("json-dev")`) and dedicated interface abstractions, avoiding premature bifurcations or dual sources of truth.

---

## 2. Inventory of Modified & Untracked Files

| File | Change Type | Purpose / Description |
|---|---|---|
| `backend/src/main/java/com/erp/auth/service/UserAccountProvisioningService.java` | Created | Centralized provisioning service: password generator, username uniqueness, cross-role collision checks, student/parent user account creation. |
| `backend/src/main/resources/db/migration/V6__link_guardians_to_users.sql` | Created | Database migration adding `user_id` to `guardians` table with FK constraint and deterministic backfill. |
| `docs/recovery/json_development_mode_strategy.md` | Created | Architecture decision record and roadmap for offline/demo development mode. |
| `backend/src/test/java/com/erp/auth/IdentityAndAccountProvisioningIntegrationTest.java` | Created | Integration and security suite (7 tests) validating student/guardian provisioning, multi-ward linking, IDOR prevention, and role collisions. |
| `backend/src/main/java/com/erp/guardian/entity/Guardian.java` | Modified | Added `userId` persistent column and transient `temporaryPassword` / `username`. |
| `backend/src/main/java/com/erp/guardian/repository/GuardianRepository.java` | Modified | Added `List<Guardian> findByUserId(Long userId)`. |
| `backend/src/main/java/com/erp/guardian/dto/GuardianResponseDto.java` | Modified | Added `userId` and transient `temporaryPassword` / `username`. |
| `backend/src/main/java/com/erp/guardian/mapper/GuardianMapper.java` | Modified | Maps `userId`; deliberately excludes `temporaryPassword` on entity-to-DTO conversion. |
| `backend/src/main/java/com/erp/guardian/service/GuardianService.java` & `GuardianServiceImpl.java` | Modified | Added `getGuardiansByUserId`; updated `linkGuardianToStudent` to support multi-ward parents without unlinking previous wards. |
| `backend/src/main/java/com/erp/guardian/controller/GuardianController.java` | Modified | Updated `/guardians/me` to look up by authenticated `principal.getId()`. |
| `backend/src/main/java/com/erp/student/entity/Student.java` | Modified | Added transient `temporaryPassword` and `username`. |
| `backend/src/main/java/com/erp/student/dto/StudentRequestDto.java` | Modified | Added optional `guardian` and `password`. |
| `backend/src/main/java/com/erp/student/dto/StudentResponseDto.java` | Modified | Added `userId` and transient `temporaryPassword` / `username`. |
| `backend/src/main/java/com/erp/student/mapper/StudentMapper.java` | Modified | Maps `userId`; excludes `temporaryPassword` from entity mapping. |
| `backend/src/main/java/com/erp/student/service/StudentServiceImpl.java` | Modified | Injected provisioning service; auto-provisions student and guardian on enrollment. |
| `backend/src/main/java/com/erp/student/service/StudentOnboardingService.java` | Modified | Auto-provisions student user on admission conversion with collision safeguards; validates batch/semester prerequisites prior to provisioning. |
| `backend/src/main/java/com/erp/student/service/StudentIdentityService.java` | Modified | Rejects profile resolution if student entity belongs to a different `userId`. |
| `backend/src/main/java/com/erp/admin/controller/UserController.java` | Modified | Links unlinked guardians when admin creates a user with `Role.PARENT`. |
| `backend/src/main/java/com/erp/security/SecurityOwnershipService.java` | Modified | Replaced insecure email-only matching with strict `guardianRepository.findByUserId(principal.getId())` for parents. |
| `backend/src/test/java/com/erp/student/service/StudentOnboardingServiceTest.java` | Modified | Injected `UserAccountProvisioningService` mock; verified batch/semester validation ordering. |

All 10 working-tree modifications from Prompt 1 remain strictly preserved.

---

## 3. Test Suite Execution & Verification Results

### Backend Integration & Security Suites Executed:
Command:
```bash
mvn test "-Dtest=IdentityAndAccountProvisioningIntegrationTest,AuthenticationIntegrationTest,RbacAndPermissionIntegrationTest,UserControllerTest,StudentControllerTest,GuardianControllerTest,StudentOnboardingControllerTest,StudentOnboardingServiceTest,SecurityAuthorizationIntegrationTest,StudentModuleDemonstrationTest"
```

**Results:**
* `Tests run: 70, Failures: 0, Errors: 0, Skipped: 0`
* `BUILD SUCCESS` (Execution time: 28.910 s)

#### Detailed Suite Breakdown:
1. **`IdentityAndAccountProvisioningIntegrationTest` (7/7 passed):**
   * `testStudentEnrollmentProvisionsUserAccount`: Admin creates student -> user account auto-created with `STUDENT` role -> student logs in with generated credentials and verifies self-profile via `/api/v1/students/me`.
   * `testStudentEnrollmentWithGuardianProvisionsBothAccounts`: Admin enrolls student with guardian -> both student and parent user accounts auto-created -> parent logs in and accesses `/api/v1/guardians/me` successfully.
   * `testMultiWardGuardianLinking`: Parent linked to Ward 1 is linked to Ward 2 -> parent `/api/v1/guardians/me` returns both wards without dropping previous link.
   * `testCrossRoleCollisionRejected`: Enrollment with email registered to `FACULTY` role is rejected with 400 Bad Request.
   * `testIdorPreventionForGuardians`: Parent 1 authenticated with valid token is strictly forbidden (HTTP 403) from accessing Ward 2 belonging to Parent 2.
   * `testFailedEnrollmentDoesNotLeaveOrphanUser`: When enrollment validation fails (e.g. invalid batch), transaction rolls back and orphan user account is not created.
   * `testEmailOnlyMatchDeniedWithoutUserIdLink`: When an attacker user registers with an email matching an unlinked guardian record, access is strictly denied (HTTP 403) because `userId` is unlinked.
2. **`AuthenticationIntegrationTest` (8/8 passed):**
   * Login, token refresh, logout, session expiration, invalid credentials.
3. **`RbacAndPermissionIntegrationTest` (11/11 passed):**
   * Role and permission gates across ADMIN, FACULTY, STUDENT, PARENT, and FINANCE.
4. **`UserControllerTest` (4/4 passed):**
   * User creation, update, retrieval, and parent guardian auto-linking.
5. **`GuardianControllerTest` (1/1 passed):**
   * Guardian CRUD and ward queries.
6. **`StudentControllerTest` (6/6 passed):**
   * Student CRUD, filtering, status transition history.
7. **`StudentOnboardingControllerTest` (1/1 passed):**
   * Admission-to-student conversion endpoint.
8. **`StudentOnboardingServiceTest` (5/5 passed):**
   * Unit tests for admission onboarding, batch/semester prerequisites, duplicate safeguards.
9. **`SecurityAuthorizationIntegrationTest` (26/26 passed):**
   * Complete ownership and IDOR authorization matrices.
10. **`StudentModuleDemonstrationTest` (1/1 passed):**
    * Comprehensive student module lifecycle demonstration.

---

## 4. Dependencies & Preparation for Prompt 3

1. **Student & Guardian Portal Dependencies Ready:**
   * Student portal frontend can now authenticate as a student and call `/api/v1/students/me` to immediately obtain student ID, roll number, department, and academic history.
   * Guardian portal can now authenticate as a parent and call `/api/v1/guardians/me` to obtain all ward relationships.
2. **Readiness for Prompt 3/10:**
   * Faculty and Academic domain workflows can now build upon validated user identity mapping (`faculty.user_id` and `students.user_id`).
   * No pending regressions or unmerged blockers.
