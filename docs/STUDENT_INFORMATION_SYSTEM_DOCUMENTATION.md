# Institutional ERP v1.0 — Student Information System (SIS)
## Comprehensive Technical Documentation & File Specification
**Author:** Palak Agarwal  
**Module:** Student Information System (SIS) — Week 03  
**Framework:** Spring Boot 3 / Java 25 / PostgreSQL & H2 / React + TypeScript  

---

## 1. Architectural Overview

The Student Information System is built adhering to enterprise software engineering best practices:
- **Layered Architecture:** Controller (Presentation/REST) $\rightarrow$ Service (Business Logic) $\rightarrow$ Repository (Data Access) $\rightarrow$ Database Entity (JPA ORM).
- **Separation of Concerns:** Controllers never deal with raw entities; DTOs (`StudentRequestDto`, `StudentResponseDto`) isolate internal schemas from external contracts.
- **Why Functions Return Values (Rather than Printing):**
  In professional backend engineering, functions in Controllers, Services, and Repositories **must return values** (`ResponseEntity`, DTOs, domain objects) so they can be serialized to JSON for web/mobile clients, processed by upstream services, verified by automated unit/integration tests, or persisted in relational databases. Printing via `System.out.println` only writes unformatted strings to standard output and cannot be transmitted over HTTP or consumed by frontend applications.

---

## 2. File-by-File Technical Specification

### 2.1 Database Layer (Day 01)

#### 1. `database/schema/01_student_schema.sql`
- **What it does:** Defines the foundational relational schema for the `students` table, including primary keys, unique constraints (`roll_number`, `email`), search indexes, and audit timestamps.
- **Input:** SQL DDL execution script executed on database engine.
- **Output:** Created table `students` with indexes: `idx_students_roll_number`, `idx_students_email`, `idx_students_department`, `idx_students_status`.
- **Columns:** `id` (PK, BIGSERIAL), `roll_number`, `first_name`, `last_name`, `email`, `phone`, `date_of_birth`, `gender`, `blood_group`, `address`, `city`, `state`, `pincode`, `department`, `program`, `batch`, `enrollment_date`, `status` (DEFAULT 'ACTIVE'), `created_at`, `updated_at`.

#### 2. `database/schema/02_guardian_schema.sql`
- **What it does:** Defines the `guardians` table with a foreign key referencing `students(id)` with `ON DELETE CASCADE`, ensuring parental/guardian records stay linked to student profiles.
- **Input:** SQL DDL execution script.
- **Output:** Created table `guardians` with indexes `idx_guardians_student_id`, `idx_guardians_phone`.
- **Columns:** `id` (PK), `student_id` (FK), `first_name`, `last_name`, `relation` (FATHER, MOTHER, LEGAL_GUARDIAN, OTHER), `phone`, `email`, `occupation`, `address`, `is_emergency_contact`, `created_at`, `updated_at`.

#### 3. `database/schema/03_document_schema.sql`
- **What it does:** Defines the `student_documents` table to store metadata of uploaded files (Aadhaar, Transfer Certificate, Migration, Marksheet, Photograph).
- **Input:** SQL DDL execution script.
- **Output:** Created table `student_documents` with FK to `students(id)`.
- **Columns:** `id` (PK), `student_id` (FK), `document_type`, `file_name`, `original_file_name`, `file_type`, `file_size`, `storage_path`, `uploaded_at`.

#### 4. `database/schema/04_status_schema.sql`
- **What it does:** Defines the `student_status_history` audit table for maintaining an immutable trail of student lifecycle transitions (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`, `ALUMNI`).
- **Input:** SQL DDL execution script.
- **Output:** Created table `student_status_history` with foreign key and indexes on `student_id` and `changed_at`.
- **Columns:** `id` (PK), `student_id` (FK), `previous_status`, `new_status`, `reason`, `changed_by`, `changed_at`.

#### 5. `database/seeds/01_student_seeds.sql`
- **What it does:** Populates realistic seed records for demonstration and testing: 5 students across multiple departments, 4 guardians, 4 documents, and 6 status history records.
- **Input:** SQL `INSERT` script.
- **Output:** Database populated with consistent sample data for immediate demo.

---

### 2.2 Domain Entities & Enums (Day 02 – Day 05)

#### 6. `backend/src/main/java/com/erp/student/entity/Student.java`
- **What it does:** JPA entity representing a student in the database. Encapsulates personal information, academic details, and 1:N relationships to `guardians` and `documents`.
- **Inputs to Methods:** Constructor arguments (`rollNumber`, `firstName`, `lastName`, etc.), Setters for mutable fields.
- **Output from Methods:** Getters returning field values, `getGuardians()`, `getDocuments()`.

#### 7. `backend/src/main/java/com/erp/guardian/entity/Guardian.java`
- **What it does:** JPA entity representing guardian details and relationship to student.
- **Input:** Guardian details (`firstName`, `lastName`, `relation`, `phone`, `email`, `student`).
- **Output:** Getters, student association object.

#### 8. `backend/src/main/java/com/erp/student/entity/StudentDocument.java`
- **What it does:** JPA entity storing physical file storage path, MIME type, size, and document category.
- **Input:** `Student`, `DocumentType`, file path, size, MIME type.
- **Output:** Document metadata and link to parent student.

#### 9. `backend/src/main/java/com/erp/student/entity/DocumentType.java`
- **What it does:** Java `enum` enforcing valid document types:
  - `AADHAAR`
  - `TRANSFER_CERTIFICATE`
  - `MIGRATION`
  - `MARKSHEET`
  - `PHOTOGRAPH`

#### 10. `backend/src/main/java/com/erp/student/entity/StudentStatus.java`
- **What it does:** Java `enum` enforcing student lifecycle states:
  - `ACTIVE`
  - `INACTIVE`
  - `SUSPENDED`
  - `GRADUATED`
  - `ALUMNI`

#### 11. `backend/src/main/java/com/erp/student/entity/StudentStatusHistory.java`
- **What it does:** JPA entity capturing historical status transitions for compliance and academic audit.
- **Input:** `Student`, `previousStatus`, `newStatus`, `reason`, `changedBy`.
- **Output:** Audit record object with auto-generated timestamp.

---

### 2.3 Data Transfer Objects (DTOs) & Mappers

#### 12. `backend/src/main/java/com/erp/student/dto/StudentRequestDto.java`
- **What it does:** Validated request payload for creating/updating a student. Uses Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Pattern`, `@NotNull`).
- **Input:** JSON payload from HTTP request.
- **Output:** Deserialized Java object with validated fields.

#### 13. `backend/src/main/java/com/erp/student/dto/StudentResponseDto.java`
- **What it does:** Outgoing response payload containing student profile details, computed `fullName`, and lists of nested `GuardianResponseDto` and `StudentDocumentResponseDto`.
- **Input:** Populated by `StudentMapper.toDto(Student)`.
- **Output:** Serialized JSON payload returned to HTTP client.

#### 14. `backend/src/main/java/com/erp/student/dto/StudentStatusUpdateDto.java`
- **What it does:** Request payload for modifying student status with required audit reason and author.
- **Fields:** `status` (StudentStatus), `reason` (String), `changedBy` (String).

#### 15. `backend/src/main/java/com/erp/student/dto/StudentDocumentResponseDto.java`
- **What it does:** Document metadata DTO including computed human-readable file size (e.g. `240 KB`) and direct `viewUrl` and `downloadUrl` endpoints.

#### 16. `backend/src/main/java/com/erp/guardian/dto/GuardianRequestDto.java` & `GuardianResponseDto.java`
- **What it does:** DTOs for adding, editing, and displaying guardian records.

#### 17. `backend/src/main/java/com/erp/student/mapper/StudentMapper.java` & `GuardianMapper.java`
- **What it does:** Spring `@Component` mappers translating between JPA entities and DTOs, keeping domain logic isolated from external representations.

---

### 2.4 Data Repositories (Spring Data JPA)

#### 18. `backend/src/main/java/com/erp/student/repository/StudentRepository.java`
- **What it does:** Extends `JpaRepository<Student, Long>` with custom queries:
  - `findByRollNumber(String rollNumber)`
  - `findByEmail(String email)`
  - `existsByRollNumber(String rollNumber)`
  - `existsByEmail(String email)`
  - `findWithFilters(...)` — Dynamic search across name, roll number, department, and status with pagination.

#### 19. `backend/src/main/java/com/erp/guardian/repository/GuardianRepository.java`
- **What it does:** Data access for guardians; includes `findByStudentId(Long studentId)`.

#### 20. `backend/src/main/java/com/erp/student/repository/StudentDocumentRepository.java`
- **What it does:** Data access for documents; includes `findByStudentId(Long studentId)` and `findByStudentIdAndDocumentType(...)`.

#### 21. `backend/src/main/java/com/erp/student/repository/StudentStatusHistoryRepository.java`
- **What it does:** Data access for status audit history; includes `findByStudentIdOrderByChangedAtDesc(Long studentId)`.

---

### 2.5 Service Layer (Business Logic)

#### 22. `backend/src/main/java/com/erp/student/service/StudentService.java` & `StudentServiceImpl.java`
- **What it does:**
  - `createStudent(StudentRequestDto)`: Validates uniqueness of roll number and email, saves student, records initial 'ACTIVE' status history.
  - `getStudentById(Long id)`: Fetches student or throws `ResourceNotFoundException`.
  - `getStudentByRollNumber(String rollNumber)`: Queries by unique roll number.
  - `updateStudent(Long id, StudentRequestDto)`: Updates profile with duplicate checks.
  - `deleteStudent(Long id)`: Deletes student (cascades to guardians, documents, and history).
  - `getAllStudents(page, size, search, status, department, sortBy, sortDir)`: Returns paginated response.
  - `updateStudentStatus(Long id, StudentStatusUpdateDto)`: Transitions lifecycle state and logs immutable audit trail.
  - `getStatusHistory(Long id)`: Returns historical audit records.

#### 23. `backend/src/main/java/com/erp/guardian/service/GuardianService.java` & `GuardianServiceImpl.java`
- **What it does:** Manages guardian creation, retrieval, updates, and direct student linking.

#### 24. `backend/src/main/java/com/erp/student/service/StudentDocumentService.java` & `StudentDocumentServiceImpl.java`
- **What it does:**
  - `uploadDocument(studentId, documentType, MultipartFile)`: Sanitizes filename, saves file to disk directory `uploads/documents/`, stores metadata record in DB.
  - `loadDocumentAsResource(Long documentId)`: Reads binary stream from disk as `org.springframework.core.io.Resource`.
  - `deleteDocument(Long documentId)`: Unlinks physical file from storage and deletes DB record.

---

### 2.6 Controller Layer (REST APIs)

#### 25. `backend/src/main/java/com/erp/student/controller/StudentController.java`
- **Base URI:** `/api/v1/students`
- **Endpoints:**
  - `POST /`: Creates student profile (`201 Created`).
  - `GET /`: Lists students with pagination/filters (`200 OK`).
  - `GET /{id}`: Returns complete student profile by ID (`200 OK` / `404 Not Found`).
  - `GET /roll/{rollNumber}`: Returns profile by roll number (`200 OK`).
  - `PUT /{id}`: Edits student profile (`200 OK`).
  - `DELETE /{id}`: Deletes student profile (`200 OK`).
  - `PATCH /{id}/status`: Updates status (`200 OK`).
  - `GET /{id}/status-history`: Retrieves audit log (`200 OK`).

#### 26. `backend/src/main/java/com/erp/guardian/controller/GuardianController.java`
- **Endpoints:**
  - `GET /guardians` or `GET /api/v1/guardians`: List all guardians.
  - `POST /guardians`: Create guardian.
  - `PUT /guardians/{id}`: Edit guardian.
  - `DELETE /guardians/{id}`: Delete guardian.
  - `GET /api/v1/students/{studentId}/guardians`: Get guardians for student.
  - `POST /api/v1/students/{studentId}/guardians`: Add and link guardian to student.
  - `POST /api/v1/students/{studentId}/guardians/{guardianId}/link`: Link existing guardian.

#### 27. `backend/src/main/java/com/erp/student/controller/StudentDocumentController.java`
- **Endpoints:**
  - `POST /api/v1/students/{studentId}/documents`: Upload document (`multipart/form-data`).
  - `GET /api/v1/students/{studentId}/documents`: List student documents.
  - `GET /api/v1/documents/{id}/view`: Inline browser preview stream (`Content-Disposition: inline`).
  - `GET /api/v1/documents/{id}/download`: Attachment download stream (`Content-Disposition: attachment`).
  - `DELETE /api/v1/documents/{id}`: Delete document and disk file.

---

### 2.7 Configuration & Test Files

#### 28. `backend/src/main/java/com/erp/student/config/StudentDataLoader.java`
- **What it does:** Spring `CommandLineRunner` active on `dev` profile to automatically seed sample students, guardians, mock PDF files, and status history if database is empty.

#### 29. `backend/src/test/java/com/erp/student/StudentModuleDemonstrationTest.java`
- **What it does:** Specially crafted demonstration suite for live meetings. Runs the complete Day 01 through Day 06 workflows and prints beautifully formatted, indented JSON inputs, outputs, and HTTP response codes directly into the terminal!

#### 30. `backend/src/test/java/com/erp/student/StudentControllerTest.java`
- **What it does:** Tests student creation, validation failures (400 Bad Request), paginated search, and status audit transitions.

#### 31. `backend/src/test/java/com/erp/guardian/GuardianControllerTest.java`
- **What it does:** Tests guardian creation, linking to student, and retrieval via both `/guardians` and nested endpoints.

#### 32. `backend/src/test/java/com/erp/student/StudentDocumentControllerTest.java`
- **What it does:** Tests full document lifecycle: uploading Aadhaar card, listing metadata, viewing inline, downloading attachment, and deleting document.

---

### 2.8 Documentation & Specifications

#### 33. `docs/database/schema-design.md`
- **What it does:** Complete database specification containing Mermaid Entity-Relationship Diagram (ERD), tables, data types, indexes, and primary/foreign key definitions.

#### 34. `docs/API/student-api-spec.md`
- **What it does:** OpenAPI/REST specification documenting all endpoints across Day 02 to Day 06 with sample requests and responses.

---

### 2.9 Frontend Integration Layer

#### 35. `src/services/studentService.ts`
- **What it does:** Client-side TypeScript service connecting frontend UI components to backend REST endpoints (`/api/v1/students`), featuring fallback mock execution, sorting, filtering, and pagination utilities.

#### 36. `src/types/studentTypes.ts`
- **What it does:** TypeScript interfaces (`Student`, `CreateStudentDTO`, `UpdateStudentDTO`, `StudentFilter`) ensuring type safety between frontend forms and backend DTOs.

#### 37. `src/components/modals/StudentDetailModal.tsx`
- **What it does:** React modal component presenting the comprehensive student details view, including guardian contacts, academic metrics, and document attachments.
