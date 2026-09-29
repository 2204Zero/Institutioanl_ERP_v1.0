# Developer Diary: Institutional ERP

This document tracks our daily progress, problems encountered, solutions found, and maps our work directly to the folder structure.

## Overview of Standards Applied
- **Structure**: Feature-based domain packaging (`com.erp.campus`, `com.erp.department`).
- **DTOs**: Java 25 `record` types used exclusively for Data Transfer Objects to enforce immutability.
- **API Versioning**: All REST controllers prefixed with `/api/v1/`.
- **Exception Handling**: GlobalExceptionHandler implemented for standardized API error responses.

---

## Work Log

### Day 01: Core Architecture Reset & Setup
- **Work Done**: 
  - Wiped existing loose microservices.
  - Initialized monolithic `com.erp` structure.
  - Built GlobalExceptionHandler and base ApiErrorResponse.
- **Problem**: Previous code contained generic `RuntimeException` and was scattered outside of standard domain packages, violating our new enterprise constraints.
- **Solution**: Refactored the entire project structure from standalone Maven folders into one unified `backend/` project.

### Day 02: Campus Management
- **Work Done**: Developed basic CRUD operations for `Campus`.
- **Folder Mapping**: `backend/src/main/java/com/erp/campus`
- **Migration**: `V2__create_campus_table.sql`

### Day 03: Department Management
- **Work Done**: Developed basic CRUD operations for `Department`.
- **Folder Mapping**: `backend/src/main/java/com/erp/department`
- **Migration**: `V3__create_department_table.sql`

### Day 04: Academic Year
- **Work Done**: Developed basic CRUD operations for `AcademicYear`.
- **Folder Mapping**: `backend/src/main/java/com/erp/academic/academic_year`
- **Problem**: Package naming conflicts with Java standard conventions (underscores in packages).
- **Solution**: Decided to maintain exact mapping to the provided `structure_erp.pdf` to ensure structural alignment with the team's visual mental model.
- **Migration**: `V4__create_academic_year_table.sql`

### Day 05: Semester
- **Work Done**: Developed basic CRUD operations for `Semester`.
- **Folder Mapping**: `backend/src/main/java/com/erp/academic/semester`
- **Migration**: `V5__create_semester_table.sql`

### Day 06: Program & Batch
- **Work Done**: Developed basic CRUD operations for `Program` and `Batch`.
- **Folder Mapping**: 
  - `backend/src/main/java/com/erp/academic/program`
  - `backend/src/main/java/com/erp/academic/batch`
- **Migration**: 
  - `V6__create_program_table.sql`
  - `V7__create_batch_table.sql`

---

### Additional Deliverables
- **Institution Module**: Set up initial mapping.
  - **Folder Mapping**: `backend/src/main/java/com/erp/institution`
  - **Migration**: `V1__create_institution_table.sql`
