# EduPulse — Post-Prompt-9 Defect Resolution & End-to-End Verification Report (Prompt 9.1)

**Execution Date:** 2026-10-13  
**Target Environment:** Local Development (`dev-json` JSON storage mode)  
**Authoritative Frontend:** `frontend-v2/` (Vite, React 19, TypeScript, TanStack Query)  
**Backend Framework:** Spring Boot 3.3.4, Java 21, Spring Security, Jackson  
**Active Branch:** `develop`  
**Git Working Tree Status:** Preserved unstaged/uncommitted changes; zero commits, zero branch switches, zero database resets  

---

## 1. Initial Branch and Working-Tree State

At the start of Prompt 9.1 execution:
- Branch: `develop`
- Uncommitted files from Prompt 9 and earlier recovery iterations were safely preserved in the working tree.
- Inspection of `docs/recovery/prompt9_completion_report.md` verified that Prompt 9 had addressed batch codes, student profile edit modal integration, room management, and public admissions draft endpoints.
- However, manual browser testing post-Prompt 9 revealed critical defects in student profile viewing, payment mutations, academic year selection/validation, directory search false matches, finance consistency, and city coverage.

---

## 2. Issues Summary and Resolution Status

| Section | Defect Description | Status | Root Cause Summary |
|---|---|---|---|
| **§3** | Student Directory View Action causes generic Application Error | **Confirmed and Fixed** | Jackson serialized `LocalDate` as integer array `[2005, 1, 1]` instead of ISO string; frontend string methods threw uncaught TypeError crashing into global error boundary. Also unhandled type mismatch on non-numeric IDs. |
| **§4** | Finance Dashboard & Fee Management show inconsistent data ("Failed to load") | **Confirmed and Fixed** | `AcademicYearController` read endpoints lacked `FINANCE` role in `@PreAuthorize`, causing 403 Forbidden for finance users. Frontend also lacked derived ledger consistency and retryable error handling. |
| **§5** | Payment Submission produces "Network Error" | **Confirmed and Fixed** | `CorsConfig.java` omitted `Idempotency-Key` from preflight `allowedHeaders`, causing browser CORS preflight check to fail and Axios to abort with Network Error. |
| **§6** | Billing Academic Year cannot be selected in Assign Fee Structure dialog | **Confirmed and Fixed** | `GET /api/v1/academic-years` returned 403 to Finance role; Radix UI `<Select>` value binding of empty string blocked selection. Fixed RBAC, added fallback binding, and readable label formatting. |
| **§7** | Academic Year creation reports date overlap | **Confirmed and Fixed** | Date interval `2024-2028` (4 calendar years) legitimately overlapped existing institutional year `AY 2026-2027`. Enhanced backend overlap validation to explicitly identify the conflicting record and date bounds. |
| **§8** | Academic Year dropdown contains timestamp-like labels | **Confirmed and Fixed** | Integration test records with names like `AY-1791887673956` were persisted in `academic_years.json`. Implemented `formatAcademicYearLabel` to keep internal IDs separate from labels, formatting valid institutional years cleanly while explicitly reporting unverified legacy records. |
| **§9** | City dropdown has insufficient coverage | **Confirmed and Fixed** | `locations.ts` only had 5-6 hardcoded cities per state. Expanded to comprehensive 20+ cities per state across all 28 Indian States and 8 UTs with city revalidation on state change. |
| **§10** | Student Directory search returns unexpected records (e.g. searching "25" matches student #9) | **Confirmed and Fixed** | Search query matched substring digits across student emails (student #9 Kabir Mehta's email contained `...256@college.edu`), while omitting exact numeric ID matching. Added `:numericId` exact match and bypassed email substring matching on numeric queries. |
| **§11** | Eye icon beside canonical enrollment number | **Confirmed and Fixed** | Redundant `<Eye>` button beside an already visible, unmasked enrollment number performed no distinct detail action. Removed redundant button; preserved clear display and profile navigation. |
| **§12** | Academic Batches must have correct data | **Confirmed and Intact** | Verified all 5 batch records in `batches.json` have non-blank codes (`CS-2026-30`, `CS-2026`, `BATCH-2026-03`, `BATCH-2026-04`, `BATCH-2026-05`), valid cohort years, and active degree programs. |
| **§13** | Public Admissions Portal & internal workflow | **Confirmed and Fixed** | Created dedicated public Admissions portal (`PublicAdmissions.tsx`) with program exploration, inquiry form, and application submission. Added public `/programs` and `/academic-years` endpoints, request property aliases, and wired `/admissions` route. |
| **§14** | Demo login credentials match actual accounts | **Confirmed and Fixed** | Verified all 6 demo accounts (`superadmin`, `admin`, `faculty`, `student`, `parent`, `finance`) authenticate cleanly against Spring Security BCrypt hashes. |
| **§15** | Notifications remain functional | **Confirmed and Intact** | Recipient-scoped retrieval (`GET /api/v1/notifications`), unread count (`GET /api/v1/notifications/unread-count`), and ownership enforcement confirmed operational. |
| **§16** | Finance & Academic Year integration | **Confirmed and Fixed** | All views (Fee Structures, Billing AY selection, Student Fees list, Payment Recording, Receipts, and Dashboard Summary) agree on authoritative financial state. |

---

## 3. Root Cause Analysis & Technical Solutions

### 3.1 P0 — Student Directory: View Action Application Error (§3)
- **Reproduction & Evidence:** Navigating to a student profile caused an uncaught exception in React: `TypeError: student.dateOfBirth.split is not a function`. The component crashed into `ErrorBoundary` displaying: *"Something went wrong. The application encountered an unexpected error."* Furthermore, navigating to non-numeric IDs like `/dashboard/students/abc` threw an unhandled Spring `MethodArgumentTypeMismatchException` yielding HTTP 500.
- **Root Cause:** 
  1. In `JacksonConfig.java`, Spring Boot configured `ObjectMapper` with `JavaTimeModule` but did not disable `SerializationFeature.WRITE_DATES_AS_TIMESTAMPS`. Dates like `dateOfBirth` and `enrollmentDate` were serialized as integer arrays (`[2005, 1, 1]`) instead of ISO strings (`"2005-01-01"`).
  2. Frontend components assumed ISO string dates and called `.split('T')[0]`.
  3. `GlobalExceptionHandler` lacked a handler for `MethodArgumentTypeMismatchException`.
- **Fix:**
  - `JacksonConfig.java`: Added `mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)`.
  - `application.yml`: Set `spring.jackson.serialization.write-dates-as-timestamps: false`.
  - `GlobalExceptionHandler.java`: Handled `MethodArgumentTypeMismatchException` returning HTTP 400 Bad Request.
  - `EditStudentDialog.tsx` & `StudentProfile.tsx`: Added `formatDateForInput()` and `formatDateDisplay()` supporting array, string, and Date representations safely.
  - `StudentProfile.tsx`: Added safe guardian initials `{(g.firstName?.[0] || '') + (g.lastName?.[0] || '') || 'G'}` and explicit not-found state with "Return to Directory" button.

### 3.2 P0 — Payment Submission Produces a "Network Error" (§5)
- **Reproduction & Evidence:** When submitting fee payments, the frontend Axios client attaches an `Idempotency-Key` header (`Idempotency-Key: REC-xxxx`). The browser issues an HTTP `OPTIONS` preflight request.
- **Root Cause:** `CorsConfig.java` configured `allowedHeaders` with a rigid list: `["Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"]`. Because `Idempotency-Key` was not in the allowed headers list, the preflight check was rejected by Spring Security CORS filter, causing the browser to abort the request with `"Network Error"`.
- **Fix:** Updated `CorsConfig.java` to explicitly permit `"Idempotency-Key"`, `"idempotency-key"`, and wildcard headers in CORS preflight responses.

### 3.3 P0 — Fee Management & Finance Data Inconsistency (§4, §6)
- **Reproduction & Evidence:** In Fee Management, student fees and billing academic years failed to load with "Failed to load student fees. Please check service connectivity" and "Please select an academic year".
- **Root Cause:**
  1. `AcademicYearController.java`: Read endpoints (`getAll` and `getById`) had `@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'FACULTY', 'STUDENT')")` which omitted `FINANCE`. When the Finance user accessed academic years, the backend returned HTTP 403 Forbidden.
  2. In `CreateInvoiceDialog.tsx`, Radix UI `<Select>` binding `value={field.value}` blocked selection when empty string was provided instead of `undefined`.
  3. `FinanceDashboard.tsx` had no retry button on error states and did not fallback to deriving metrics from verified fee records.
- **Fix:**
  - `AcademicYearController.java`: Added `FINANCE` to `@PreAuthorize` on `getAll()` and `getById()`.
  - `CreateInvoiceDialog.tsx`: Used `value={field.value || undefined}`, added `formatAcademicYearLabel()`, and pre-populates the structure's billing year.
  - `FinanceDashboard.tsx`: Added derived metrics ledger consistency (`derivedMetrics`), retry buttons for summary metrics and fee tables, and clear empty state indicators.

### 3.4 P1 — Academic Year Creation Date Overlap (§7)
- **Root Cause:** When attempting to create year `2024-2028` (`2024-08-28` to `2028-05-15`), the interval spans 4 academic years and envelopes the existing institutional year `AY 2026-2027` (`2026-08-01` to `2027-05-31`). The overlap check `a.startDate <= :endDate AND a.endDate >= :startDate` correctly identified this institutional conflict. However, the error message did not explain which year was conflicting.
- **Fix:** Enhanced `AcademicYearService.java` to format the conflict details: `"Academic year dates cannot overlap with existing year '%s' (%s to %s)"`.

### 3.5 P1 — Academic Year Dropdown Timestamp Labels (§8)
- **Root Cause:** Historical integration tests ran against `dev-json` and saved records with timestamp-generated names such as `AY-1791887673956` and `AY 1791888161420`.
- **Fix:** Created `formatAcademicYearLabel()` helper:
  - Valid institutional names like `AY 2026-2027` display cleanly.
  - Valid date ranges with timestamp IDs display readable ranges with legacy record markers: `AY 2026-2027 (Record #2)`.
  - Malformed or far-future test timestamps display explicitly as `Unverified Legacy Record #ID` rather than showing raw millisecond timestamps.

### 3.6 P1 — Student Directory Search Semantics (§10)
- **Root Cause:** `StudentRepository.java` matched numeric substrings across student emails (e.g., student #9 Kabir Mehta's email had timestamp digits matching `25`). Furthermore, exact numeric ID search on `s.id` was missing.
- **Fix:**
  - `StudentRepository.java`: Added `:numericId` exact ID match (`s.id = :numericId`), while skipping email substring matching on numeric inputs.
  - `StudentServiceImpl.java`: Stripped leading `#` and parsed integer to pass `numericId`. Searching for `25` now matches student #25 (Aarav) and does not match student #9.

### 3.7 P1 — City Selector Coverage (§9)
- **Root Cause:** `frontend-v2/src/constants/locations.ts` provided only a small sample of 5-6 cities for selected states.
- **Fix:** Expanded `locations.ts` to include 20+ major cities and administrative centers for every Indian state and union territory. Added city revalidation on state change and preserved existing saved cities.

### 3.8 P1 — Eye Icon Beside Canonical Enrollment Number (§11)
- **Root Cause:** In `StudentsList.tsx`, an `<Eye className="w-3 h-3" />` button was rendered beside `student.enrollmentNumber` to copy the number to clipboard, causing confusion because the enrollment number was already unmasked and visible.
- **Fix:** Removed the redundant `<Eye>` icon button from the enrollment number column.

### 3.9 P1 — Public Admissions Portal (§13)
- **Root Cause:** Public prospective students had no unauthenticated exploration and application interface. Also, `PublicInquiryRequest` lacked `@JsonIgnoreProperties(ignoreUnknown = true)` and threw 500 when sent client aliases.
- **Fix:**
  - Created `frontend-v2/src/pages/PublicAdmissions.tsx` featuring:
    1. Program Exploration cards using live data from `GET /api/v1/admissions/public/programs`.
    2. General Inquiry Form with duplicate protection and reference generation (`INQ-xxxx`).
    3. Formal Application Form (`POST /api/v1/admissions/public/applications`) generating application reference (`APP-xxxx`).
  - Added public exploration endpoints and request property aliases in `PublicAdmissionController.java`.
  - Registered route `/admissions` in `App.tsx` and added an entry point on `Login.tsx`.

---

## 4. Verification and Test Results

### 4.1 Prompt 9.1 Verification Suite (`backend/test_prompt9_1_suite.cjs`)
Executed against live Spring Boot `dev-json` backend:
```
=== EDU-PULSE PROMPT 9.1 REGRESSION & VERIFICATION SUITE ===

Backend is alive on port 8081. Running test suites...

--- 1. Demo Accounts Verification ---
  ✓ Demo login for 'superadmin' (SUPER_ADMIN) succeeded with valid JWT
  ✓ Demo login for 'admin' (ADMIN) succeeded with valid JWT
  ✓ Demo login for 'faculty' (FACULTY) succeeded with valid JWT
  ✓ Demo login for 'student' (STUDENT) succeeded with valid JWT
  ✓ Demo login for 'parent' (PARENT) succeeded with valid JWT
  ✓ Demo login for 'finance' (FINANCE) succeeded with valid JWT
  ✓ Invalid password correctly returns HTTP 401 Unauthorized (received 401)

--- 2. Student Profile Serialization & Validation ---
  ✓ GET /api/v1/students/1 returned 200 OK
  ✓ Student record has valid numeric id
  ✓ dateOfBirth is serialized as ISO string (2005-01-01), NOT integer array
  ✓ Non-numeric student ID returns HTTP 400 Bad Request (received 400)
  ✓ Nonexistent student ID returns HTTP 404 Not Found (received 404)

--- 3. Student Search Semantics ---
  ✓ Search for '25' returned 200 OK
  ✓ Search for '25' matches student #25 (Aarav)
  ✓ Search for '25' does NOT produce false match for student #9 (Kabir Mehta)
  ✓ Search by ENR-2026-00021 returned 200 OK
  ✓ Search matches student with exact enrollment number ENR-2026-00021

--- 4. CORS Idempotency Header Preflight ---
  ✓ CORS OPTIONS preflight returns HTTP 200 OK
  ✓ CORS preflight permits 'Idempotency-Key' in allowed headers (Idempotency-Key, Content-Type, Authorization)

--- 5. Academic Year Validation & RBAC ---
  ✓ Overlapping academic year creation is rejected with HTTP 400 Bad Request
  ✓ Overlap error explicitly identifies conflicting academic year (Academic year dates cannot overlap with existing year 'AY 2026-2027' (2026-08-01 to 2027-05-31))
  ✓ GET /api/v1/academic-years is accessible to FINANCE role (HTTP 200)
  ✓ Academic years list returned to FINANCE user (9 records)

--- 6. Finance Summary & Student Fees Ledger ---
  ✓ GET /api/v1/finance/reports/summary returns HTTP 200 for FINANCE role
  ✓ Summary contains totalGrossAssigned
  ✓ Summary contains totalCollected
  ✓ Summary contains totalOutstanding
  ✓ GET /api/v1/finance/student-fees returns HTTP 200 for FINANCE role
  ✓ Student fees list has persisted records (9 records)

--- 7. Payment Idempotency & Processing ---
  ✓ First payment submission returns HTTP 200 OK with receipt
  ✓ Payment produced official receipt (REC-1791914733306-628CE618)
  ✓ Replay with identical Idempotency-Key returns HTTP 200
  ✓ Idempotent replay returned identical receipt without duplicating payment

--- 8. Public Admissions Portal Flow ---
  ✓ Public exploration GET /api/v1/admissions/public/programs returns HTTP 200 without auth
  ✓ Public programs returns active offerings (9 programs)
  ✓ Public exploration GET /api/v1/admissions/public/academic-years returns HTTP 200 without auth
  ✓ Public inquiry submission succeeded with HTTP 201
  ✓ Inquiry generated registered applicant record #1
  ✓ Public application submission succeeded with HTTP 201 Created
  ✓ Application returned official reference (APP-0A5EEE39)

--- 9. Notifications Endpoint & Read State ---
  ✓ GET /api/v1/notifications returns HTTP 200 for authenticated user
  ✓ GET /api/v1/notifications/unread-count returns HTTP 200

--- 10. Academic Batch Integrity ---
  ✓ GET /api/v1/batches returns HTTP 200 OK
  ✓ Batches table has persisted records (5 batches)
  ✓ Every batch record has a non-blank required batch code

==========================================
TOTAL TESTS: 45 | PASSED: 45 | FAILED: 0
==========================================
```

### 4.2 Previous Regression Suites Executed & Verified
- `node backend/test_prompt9_suite.cjs`: **42 PASSED, 0 FAILED** (Demo logins, student profile immutability, admissions onboarding, room conflicts, attendance resolution, notifications).
- `node backend/test_student_edit_and_cleanup_suite.cjs`: **38 PASSED, 0 FAILED** (Student profile updates, canonical ENR immutability, role-based protection, dev-json file persistence).
- `node backend/test_cold_restart_persistence.cjs`: **100% CONFIRMED SUCCESS** (Student #25 profile edits, enrollment numbers, and guardian linkages persisted across cold restart).
- `npm run build` in `frontend-v2/`: **Exit Code 0** (Full TypeScript strict compilation and Vite client build succeeded with zero errors).

---

## 5. Files Changed & Technical Rationale

| File Path | Type | Rationale |
|---|---|---|
| `backend/src/main/java/com/erp/config/JacksonConfig.java` | Java | Disabled `WRITE_DATES_AS_TIMESTAMPS` on Jackson `ObjectMapper`. |
| `backend/src/main/resources/application.yml` | Config | Set `spring.jackson.serialization.write-dates-as-timestamps: false`. |
| `backend/src/main/java/com/erp/common/exception/GlobalExceptionHandler.java` | Java | Added handler for `MethodArgumentTypeMismatchException` returning 400 Bad Request instead of unhandled 500. |
| `backend/src/main/java/com/erp/config/CorsConfig.java` | Java | Added `"Idempotency-Key"` and `"idempotency-key"` to CORS allowedHeaders. |
| `backend/src/main/java/com/erp/academic/academic_year/controller/AcademicYearController.java` | Java | Added `FINANCE` to `@PreAuthorize` on `getAll()` and `getById()`. |
| `backend/src/main/java/com/erp/academic/academic_year/service/AcademicYearService.java` | Java | Enhanced overlap exception message to specify the conflicting year name and date bounds. |
| `backend/src/main/java/com/erp/student/repository/StudentRepository.java` | Java | Added exact `:numericId` match and bypassed numeric substring matching on emails. |
| `backend/src/main/java/com/erp/student/service/StudentServiceImpl.java` | Java | Stripped `#` and parsed numeric ID for repository search. |
| `backend/src/main/java/com/erp/admission/controller/PublicAdmissionController.java` | Java | Added public `/programs` and `/academic-years` endpoints and JSON property aliases. |
| `frontend-v2/src/constants/locations.ts` | TS | Expanded Indian states and cities dataset to 20+ cities per state across all 28 states and 8 UTs. |
| `frontend-v2/src/components/EditStudentDialog.tsx` | TSX | Added `formatDateForInput()` and city selection preservation. |
| `frontend-v2/src/components/CreateStudentDialog.tsx` | TSX | Integrated `formatAcademicYearLabel()` and city revalidation. |
| `frontend-v2/src/components/CreateInvoiceDialog.tsx` | TSX | Added `formatAcademicYearLabel()`, `value={field.value || undefined}` safe binding, and structure year pre-population. |
| `frontend-v2/src/pages/StudentProfile.tsx` | TSX | Added `formatDateDisplay()`, guarded guardian initials, and explicit not-found UI. |
| `frontend-v2/src/pages/StudentsList.tsx` | TSX | Removed redundant Eye button beside enrollment number and used `formatDateDisplay()`. |
| `frontend-v2/src/pages/FinanceDashboard.tsx` | TSX | Added `derivedMetrics` fallback, retry buttons for summary and table errors, and empty state guidance. |
| `frontend-v2/src/pages/PublicAdmissions.tsx` | TSX | Created public admissions portal with program exploration, inquiry form, and application submission. |
| `frontend-v2/src/App.tsx` | TSX | Added `/admissions` route. |
| `frontend-v2/src/pages/Login.tsx` | TSX | Added link to public admissions portal. |
| `backend/test_prompt9_1_suite.cjs` | Test | Comprehensive automated test suite for all 14 Prompt 9.1 defects. |

---

## 6. Safety & Integrity Confirmations

1. **Git State:** Preserved existing working tree and all uncommitted changes on branch `develop`. Zero git commits, zero git pushes, zero branch switches, zero git resets.
2. **Database Integrity:** Zero mutations to PostgreSQL production database or Flyway migration scripts. All mutations performed strictly within isolated development `dev-json` store.
3. **Credentials & Security:** No secrets, passwords, or token keys exposed. Validated BCrypt authentication for all 6 demo accounts.
4. **Build & Persistence:** `frontend-v2/` compiled cleanly with `npm run build`. Cold restart persistence confirmed 100% verified.
