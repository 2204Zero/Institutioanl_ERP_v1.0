# Institutional ERP v1.0 — Day-wise Development Documentation & Engineering Journal

> **Branch**: `feature/management`  
> **Author**: Palak Agarwal  
> **Sprint / Timeline**: Days 02 — 06  
> **Official Folder Structure Standard**: Defined by [`structure_erp.pdf`](file:///d:/ERP%20Project/Palak/Project/structure_erp.pdf)

---

## 1. Executive Summary

This document records the full engineering lifecycle, implementation architecture, day-wise folder mapping, challenges encountered, and solutions devised during the implementation of the **Student Profile**, **Guardian Management**, **Student Documents**, **Student Status**, and **API Testing & Swagger Documentation** modules.

All code has been developed adhering to clean architecture principles:
- **Backend**: Java 25, Spring Boot 4.x, Spring Data JPA, Hibernate, Bean Validation, SpringDoc OpenAPI 3, JUnit 5 & MockMvc.
- **Frontend**: React 18, TypeScript 5, Vite, Vanilla CSS Design System with responsive design tokens, Lucide Icons.
- **Database**: PostgreSQL / ANSI SQL DDL schemas, indexes, and comprehensive realistic seed data.

---

## 2. Day-wise Work Mapping with Respective Folders

Below is the definitive folder mapping aligning each day's deliverables to the official repository structure:

| Day | Focus Area | Backend Folder Mapping | Frontend Folder Mapping | Database Folder Mapping |
| :--- | :--- | :--- | :--- | :--- |
| **Day 02** | **Student Profile (CRUD)** | `backend/src/main/java/com/erp/student/entity/Student.java`<br>`backend/src/main/java/com/erp/student/repository/StudentRepository.java`<br>`backend/src/main/java/com/erp/student/service/StudentService.java`<br>`backend/src/main/java/com/erp/student/service/StudentServiceImpl.java`<br>`backend/src/main/java/com/erp/student/controller/StudentController.java`<br>`backend/src/main/java/com/erp/student/dto/StudentRequestDto.java`<br>`backend/src/main/java/com/erp/student/dto/StudentResponseDto.java`<br>`backend/src/main/java/com/erp/student/mapper/StudentMapper.java` | `frontend/src/features/students/StudentList.tsx`<br>`frontend/src/features/students/StudentForm.tsx`<br>`frontend/src/features/students/StudentDetails.tsx`<br>`frontend/src/services/studentService.ts`<br>`frontend/src/types/student.ts` | `database/schema/01_student_schema.sql`<br>`database/seeds/01_student_seeds.sql` |
| **Day 03** | **Guardian Management** | `backend/src/main/java/com/erp/guardian/entity/Guardian.java`<br>`backend/src/main/java/com/erp/guardian/repository/GuardianRepository.java`<br>`backend/src/main/java/com/erp/guardian/service/GuardianService.java`<br>`backend/src/main/java/com/erp/guardian/service/GuardianServiceImpl.java`<br>`backend/src/main/java/com/erp/guardian/controller/GuardianController.java`<br>`backend/src/main/java/com/erp/guardian/dto/GuardianRequestDto.java`<br>`backend/src/main/java/com/erp/guardian/dto/GuardianResponseDto.java`<br>`backend/src/main/java/com/erp/guardian/mapper/GuardianMapper.java` | `frontend/src/features/guardians/GuardianModal.tsx`<br>`frontend/src/features/guardians/GuardianList.tsx`<br>`frontend/src/services/guardianService.ts`<br>`frontend/src/types/guardian.ts` | `database/schema/02_guardian_schema.sql`<br>`database/seeds/01_student_seeds.sql` |
| **Day 04** | **Student Documents** | `backend/src/main/java/com/erp/student/entity/StudentDocument.java`<br>`backend/src/main/java/com/erp/student/entity/DocumentType.java`<br>`backend/src/main/java/com/erp/student/repository/StudentDocumentRepository.java`<br>`backend/src/main/java/com/erp/student/service/StudentDocumentService.java`<br>`backend/src/main/java/com/erp/student/service/StudentDocumentServiceImpl.java`<br>`backend/src/main/java/com/erp/student/controller/StudentDocumentController.java`<br>`backend/src/main/java/com/erp/student/dto/StudentDocumentResponseDto.java` | `frontend/src/features/students/DocumentUploadModal.tsx`<br>`frontend/src/services/documentService.ts`<br>`frontend/src/types/document.ts` | `database/schema/03_document_schema.sql`<br>`database/seeds/01_student_seeds.sql` |
| **Day 05** | **Student Status Workflow** | `backend/src/main/java/com/erp/student/entity/StudentStatus.java`<br>`backend/src/main/java/com/erp/student/entity/StudentStatusHistory.java`<br>`backend/src/main/java/com/erp/student/repository/StudentStatusHistoryRepository.java`<br>`backend/src/main/java/com/erp/student/dto/StudentStatusUpdateDto.java` | `frontend/src/features/students/StudentStatusModal.tsx`<br>`frontend/src/components/ui/Badge/Badge.tsx` | `database/schema/04_status_schema.sql`<br>`database/seeds/01_student_seeds.sql` |
| **Day 06** | **API Testing & Swagger** | `backend/src/test/java/com/erp/student/StudentControllerTest.java`<br>`backend/src/test/java/com/erp/guardian/GuardianControllerTest.java`<br>`backend/src/test/java/com/erp/student/StudentDocumentControllerTest.java`<br>`backend/src/main/java/com/erp/config/OpenApiConfig.java`<br>`backend/src/main/java/com/erp/common/exception/GlobalExceptionHandler.java` | `frontend/src/features/docs_viewer/ApiDocsViewer.tsx` | `docs/API/student-api-spec.md` |

---

## 3. Detailed Daily Breakdown

### Day 02 — Student Profile Module
- **Goal**: Build full-featured CRUD operations for Student records.
- **Backend Components**:
  - `Student` Entity: Captures `rollNumber` (unique), personal details (`firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `gender`, `bloodGroup`), residence address, academic affiliation (`department`, `program`, `batch`, `enrollmentDate`), and status.
  - `StudentRepository`: Includes paginated keyword search query across name, roll number, and email with dynamic status and department filters.
  - `StudentService` / `StudentServiceImpl`: Handles business rules (e.g. uniqueness validation for roll number and email), entity mapping, and persistence.
  - `StudentController`: Exposes `POST /api/v1/students`, `GET /api/v1/students`, `GET /api/v1/students/{id}`, `PUT /api/v1/students/{id}`, `DELETE /api/v1/students/{id}`.
- **Frontend Components**:
  - `StudentList.tsx`: Metric cards banner (Total, Active, Suspended, Graduated), search input, status filter pills, department dropdown, clean data table, and pagination.
  - `StudentForm.tsx`: Modal form for adding and editing students with comprehensive field validation.
  - `StudentDetails.tsx`: Student Profile overview tab displaying full academic and contact records.

---

### Day 03 — Guardian Management Module
- **Goal**: Develop the Guardian module to manage parents and legal guardians, linking them directly to students.
- **Backend Components**:
  - `Guardian` Entity: Stores guardian identity, relation (`FATHER`, `MOTHER`, `LEGAL_GUARDIAN`, `OTHER`), phone, email, occupation, address, and emergency contact flag.
  - `GuardianRepository`: Supports queries by `studentId` and emergency contact lookup.
  - `GuardianService` / `GuardianServiceImpl`: Implements CRUD operations, direct linking with student ID, and dedicated student-guardian linking.
  - `GuardianController`:
    - `GET /guardians` and `GET /api/v1/guardians`
    - `POST /guardians` and `POST /api/v1/guardians`
    - `GET /guardians/{id}`
    - `PUT /guardians/{id}`
    - `DELETE /guardians/{id}`
    - `GET /api/v1/students/{studentId}/guardians`
    - `POST /api/v1/students/{studentId}/guardians`
- **Frontend Components**:
  - `GuardianModal.tsx`: Form for adding/editing guardian records with relationship selector and emergency contact toggle.
  - `GuardianList.tsx`: Institution-wide guardian directory.
  - `StudentDetails.tsx` (Guardians Tab): Dedicated section inside the student profile listing all linked guardians with quick add/edit/delete actions.

---

### Day 04 — Student Documents Module
- **Goal**: Implement secure document upload, preview, download, and deletion for verified student identity.
- **Supported Documents**:
  - `AADHAAR`: National identity document.
  - `TRANSFER_CERTIFICATE`: School / college transfer certificate.
  - `MIGRATION`: Migration certificate from prior board / university.
  - `MARKSHEET`: Academic grade card / transcript.
  - `PHOTOGRAPH`: Passport-size photograph.
- **Backend Components**:
  - `StudentDocument` Entity & `DocumentType` Enum.
  - `StudentDocumentServiceImpl`:
    - Validates file presence, sanitized file names (preventing path traversal).
    - Stores binary payload in `uploads/documents/` with UUID-salted naming.
    - Saves document metadata in the database.
    - Serves files via `loadDocumentAsResource()` with appropriate `Content-Disposition` headers (`attachment` for download, `inline` for browser preview).
  - `StudentDocumentController`:
    - `POST /api/v1/students/{studentId}/documents` (multipart upload)
    - `GET /api/v1/students/{studentId}/documents` (list)
    - `GET /api/v1/documents/{id}/view` (inline preview)
    - `GET /api/v1/documents/{id}/download` (file download)
    - `DELETE /api/v1/documents/{id}` (cleanup)
- **Frontend Components**:
  - `DocumentUploadModal.tsx`: Drag-and-drop or click-to-upload modal with file size validation (max 10MB) and document type picker.
  - `StudentDetails.tsx` (Documents Tab): Grid of uploaded documents showing file sizes, upload timestamps, inline View button, Download button, and Delete button.

---

### Day 05 — Student Status Workflow
- **Goal**: Manage student lifecycle transitions with administrative audit tracking.
- **Allowed Statuses**:
  - `ACTIVE`: Currently enrolled and in good academic standing.
  - `INACTIVE`: Temporarily absent or on approved leave of absence.
  - `SUSPENDED`: Disciplinary hold or attendance shortage suspension.
  - `GRADUATED`: Program requirements completed; degree awarded.
  - `ALUMNI`: Registered in institutional alumni records post-convocation.
- **Backend Components**:
  - `StudentStatus` Enum.
  - `StudentStatusHistory` Entity & Repository: Captures `previousStatus`, `newStatus`, `reason`, `changedBy`, and `changedAt` timestamp.
  - `StudentService.updateStudentStatus()` & `getStatusHistory()`.
  - `PATCH /api/v1/students/{id}/status` & `GET /api/v1/students/{id}/status-history`.
- **Frontend Components**:
  - `Badge.tsx`: Color-coded status badges with status dots:
    - Active: Emerald green
    - Inactive: Amber
    - Suspended: Crimson red
    - Graduated: Royal purple
    - Alumni: Cerulean blue
  - `StudentStatusModal.tsx`: Modal for transitioning student status with reason remarks.
  - `StudentDetails.tsx` (Status Audit Tab): Visual timeline displaying the historical log of every status change.

---

### Day 06 — API Testing & Swagger Documentation
- **Goal**: Full automated testing, exception handling validation, and Swagger OpenAPI integration.
- **Backend Tests (JUnit 5 + MockMvc)**:
  - `StudentControllerTest.java`:
    - Successful student creation (`POST /api/v1/students` -> 201 Created).
    - Validation rejection with bad input (`POST /api/v1/students` -> 400 Bad Request with field errors map).
    - Paginated search and list (`GET /api/v1/students` -> 200 OK).
    - Status change and history verification (`PATCH /api/v1/students/{id}/status` -> 200 OK).
  - `GuardianControllerTest.java`:
    - Guardian creation, student linking, student guardians retrieval, and global `/guardians` endpoint.
  - `StudentDocumentControllerTest.java`:
    - Multipart document upload, document listing, inline viewing header verification, attachment download header verification, and document deletion.
- **Swagger / OpenAPI**:
  - Configuration in `OpenApiConfig.java`.
  - Swagger UI accessible at `http://localhost:8080/swagger-ui.html`.
  - OpenAPI 3 specification at `http://localhost:8080/v3/api-docs`.
- **Frontend API Viewer**:
  - `ApiDocsViewer.tsx`: Built-in UI view listing all endpoints, HTTP methods, and quick links to open Swagger UI.

---

## 4. Problems Faced and Solutions Devised

### Problem 1: Empty Placeholder Skeleton Files in `develop` Branch
- **Observation**:
  Upon switching to branch `feature/management`, checking `backend/pom.xml`, `backend/src/main/resources/application.yml`, and `frontend/tsconfig.json` revealed they were 0-byte empty files created during initial repository initialization.
- **Root Cause**:
  The repository was initialized using skeleton touch commands without operational configuration.
- **How We Figured It Out & Solved It**:
  1. We ran a directory scan checking byte sizes across the repository.
  2. In `backend/java security/demo/demo/pom.xml`, we discovered that another team member had previously tested Java 25 compatibility using Maven Wrapper.
  3. We replicated the Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/`) into `backend/`.
  4. We authored a clean `pom.xml` containing `spring-boot-starter-webmvc`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `h2`, `postgresql`, and `springdoc-openapi-starter-webmvc-ui:2.6.0`.
  5. We ran `.\mvnw.cmd dependency:resolve` to ensure all libraries downloaded and resolved cleanly.

---

### Problem 2: Java 25 Compatibility and Compiler Target
- **Observation**:
  The user machine is running Oracle JDK 25 LTS (`java version "25.0.2"`). Earlier Spring Boot starter configurations often default to Java 17 or 21.
- **Root Cause**:
  Compiling Java 25 source files with mismatched release flags could cause javac bytecode incompatibility.
- **How We Figured It Out & Solved It**:
  Configured `<properties><java.version>25</java.version></properties>` in `pom.xml`. Verified compilation with `mvnw test-compile`, which confirmed successful compilation using `javac [debug parameters release 25]`.

---

### Problem 3: Spring Boot 4 Test Slice Packaging (`AutoConfigureMockMvc`)
- **Observation**:
  During test compilation, Maven reported:
  `package org.springframework.boot.test.autoconfigure.web.servlet does not exist`
  `cannot find symbol: class AutoConfigureMockMvc`
- **Root Cause**:
  In Spring Boot 4.x / Spring Framework 7, web slice auto-configuration classes were reorganized into separate starter modules.
- **How We Figured It Out & Solved It**:
  Rather than binding tests to fragile autoconfiguration annotation slices, we refactored the test suite to use `MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(globalExceptionHandler).build()`.
  This approach:
  - Eliminated the missing dependency error completely.
  - Dramatically accelerated test execution (tests run in ~120ms).
  - Explicitly registered the `GlobalExceptionHandler` so validation errors and business exceptions were tested directly.
  - Re-running `.\mvnw.cmd test` resulted in: `Tests run: 6, Failures: 0, Errors: 0, Skipped: 0` (`BUILD SUCCESS`).

---

### Problem 4: Typo in Skeleton File `frontend/pacakage.json`
- **Observation**:
  In `frontend/`, running `npm install` initially did nothing because the skeleton file was committed as `pacakage.json` (spelled with an extra 'a') and was 0 bytes.
- **Root Cause**:
  Human typo in the template repository scaffolding.
- **How We Figured It Out & Solved It**:
  Identified the spelling difference via `git ls-files`. Created a valid `package.json` specifying React 18, Vite, TypeScript, and Lucide Icons, then deleted the misspelled `pacakage.json`. Running `npm install` and `npm run build` succeeded without error.

---

### Problem 5: Entity Relational Serialization Recursion (Infinite JSON Loop)
- **Observation**:
  When a `Student` has a list of `guardians`, and each `Guardian` references `student`, serializing the entities to JSON can cause Jackson infinite recursion (`StackOverflowError`).
- **Root Cause**:
  Bidirectional JPA mapping without JSON serialization guards.
- **How We Figured It Out & Solved It**:
  1. Applied `@JsonIgnore` on `Guardian.student`, `StudentDocument.student`, and `StudentStatusHistory.student`.
  2. Implemented a decoupled DTO layer (`StudentResponseDto`, `GuardianResponseDto`, `StudentDocumentResponseDto`) with `StudentMapper` to completely isolate the presentation layer from raw JPA entity graphs.

---

### Problem 6: File Storage Safety for Student Documents
- **Observation**:
  Allowing users to upload documents (Aadhaar, TC, Marksheets) can expose servers to path traversal attacks (e.g. `../../etc/passwd`) or file name collisions.
- **Root Cause**:
  Directly using unvalidated `MultipartFile.getOriginalFilename()`.
- **How We Figured It Out & Solved It**:
  1. Added `StringUtils.cleanPath()` and explicitly checked for `..` path sequences, throwing a `BusinessException` if detected.
  2. Prepended the student ID, document type, and a random UUID substring to every saved file (`{studentId}_{documentType}_{uuid}.{ext}`).
  3. Stored metadata in the database and configured separate endpoints for inline preview (`Content-Disposition: inline`) and download (`Content-Disposition: attachment`).

---

## 5. Summary of Verification & Build Status

1. **Backend Build & Automated Tests**:
   - Command: `.\mvnw.cmd clean test`
   - Result: **BUILD SUCCESS**
   - Test Results: **6 of 6 tests passed** (0 failures, 0 errors, 0 skipped).
2. **Frontend Build & Type Checking**:
   - Command: `npm run build`
   - Result: **BUILD SUCCESS** (0 TypeScript errors, bundle generated in 3.02s).
3. **Database Schema & Seeds**:
   - All 4 DDL scripts generated in `database/schema/`.
   - Seed data script created in `database/seeds/01_student_seeds.sql`.
   - In-memory startup seeder created in `StudentDataLoader.java`.
