# Institutional ERP v1.0

A modern, scalable Institutional Enterprise Resource Planning (ERP) platform for higher education institutions.

## Tech Stack
- **Backend**: Java 25, Spring Boot 4.x, Spring Data JPA, Hibernate, Bean Validation, SpringDoc OpenAPI 3, JUnit 5 & MockMvc
- **Frontend**: React 18, TypeScript 5, Vite, Lucide Icons, Vanilla CSS Design System
- **Database**: PostgreSQL / H2 In-Memory DB (dev profile)
- **Documentation**: Swagger OpenAPI UI (`/swagger-ui.html`), Markdown API Specs, ERD Diagrams

---

## Implemented Modules (Sprint Days 02 – 06)

| Day | Module | Deliverables & Responsibilities | Key Folder Mapping |
| :--- | :--- | :--- | :--- |
| **Day 02** | **Student Profile** | Student CRUD (Add, View, Edit, Delete), Search, Pagination | `backend/src/main/java/com/erp/student/`, `frontend/src/features/students/`, `database/schema/01_student_schema.sql` |
| **Day 03** | **Guardian Management** | Add, Edit, Delete Guardians, Link with Student | `backend/src/main/java/com/erp/guardian/`, `frontend/src/features/guardians/`, `database/schema/02_guardian_schema.sql` |
| **Day 04** | **Student Documents** | Upload, Download, View, Delete (Aadhaar, TC, Migration, Marksheet, Photo) | `backend/src/main/java/com/erp/student/entity/StudentDocument.java`, `frontend/src/features/students/DocumentUploadModal.tsx`, `database/schema/03_document_schema.sql` |
| **Day 05** | **Student Status** | Active, Inactive, Suspended, Graduated, Alumni lifecycle workflow & audit history | `backend/src/main/java/com/erp/student/entity/StudentStatus.java`, `frontend/src/features/students/StudentStatusModal.tsx`, `database/schema/04_status_schema.sql` |
| **Day 06** | **API Testing & Swagger** | 6 MockMvc test suites, Request/Response Validation, Global Exception Handling, Swagger OpenAPI UI | `backend/src/test/java/com/erp/student/`, `backend/src/main/java/com/erp/config/OpenApiConfig.java`, `docs/API/student-api-spec.md` |

---

## Documentation Links
- **Day-wise Work Mapping & Problem-Solving Journal**: [`docs/DAY_WISE_DOCUMENTATION.md`](file:///d:/ERP%20Project/Palak/Project/docs/DAY_WISE_DOCUMENTATION.md)
- **REST API Specifications & curl Examples**: [`docs/API/student-api-spec.md`](file:///d:/ERP%20Project/Palak/Project/docs/API/student-api-spec.md)
- **Database Schema & ERD Design**: [`docs/database/schema-design.md`](file:///d:/ERP%20Project/Palak/Project/docs/database/schema-design.md)

---

## Quick Start Guide

### 1. Run Backend (Spring Boot)
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
- API Base URL: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console` (`jdbc:h2:mem:erp_db`, User: `sa`, Password: empty)

### 2. Run Backend Tests
```bash
cd backend
.\mvnw.cmd test
```

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Local Web Application: `http://localhost:5173`