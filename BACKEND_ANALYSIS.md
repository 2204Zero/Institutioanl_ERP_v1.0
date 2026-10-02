# Institutional ERP System - Backend Deep Dive

## Spring Boot Architecture

### Technology Stack
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 21
- **Persistence**: Spring Data JPA / Hibernate
- **Database Support**: H2 (In-memory) and PostgreSQL 16
- **API Specification**: OpenAPI 3 (Springdoc Swagger UI at `/swagger-ui.html`)

---

## Domain Modules & Entities

1. **Authentication & User Management**:
   - Entities: `User`, `Role`, `Session`, `PasswordResetToken`
   - Services: `AuthService`, `UserService`, `PasswordRecoveryService`
   - Features: BCrypt password hashing, JWT access & refresh token generation.

2. **Student Information System (SIS)**:
   - Entities: `Student`, `Guardian`, `StudentDocument`, `StudentAcademicRecord`, `StudentEnrollment`, `StudentCategory`
   - Services: `StudentService`, `GuardianService`, `StudentDocumentService`

3. **Academic Structure**:
   - Entities: `Institution`, `Campus`, `Department`, `AcademicYear`, `Program`, `Course`, `Curriculum`, `Semester`, `Batch`, `Section`, `Subject`

4. **Attendance System**:
   - Controllers: `AttendanceController`
   - Features: Daily attendance recording, section-wise roll-call verification.

5. **Finance System**:
   - Controllers: `FinanceController`
   - Features: Fee collection ledger, status management, payment mode validation.

---

## Critical Backend Issues
- **Maven Build Failure**: Compiling under JDK 21 fails due to Lombok annotation processor reflection restriction. Requires compiler arg adjustment or Lombok update.
- **Duplicate Class Definitions**: Found multiple duplicate controller files in different subpackages (e.g. duplicate `AuthController.java` and `GlobalExceptionHandler.java` files).
