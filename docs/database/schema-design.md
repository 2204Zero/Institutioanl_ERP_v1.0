# Institutional ERP v1.0 — Database Schema & ERD Design

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    STUDENTS ||--o{ GUARDIANS : "has (1:N)"
    STUDENTS ||--o{ STUDENT_DOCUMENTS : "holds (1:N)"
    STUDENTS ||--o{ STUDENT_STATUS_HISTORY : "tracks (1:N)"

    STUDENTS {
        bigint id PK
        varchar roll_number UK
        varchar first_name
        varchar last_name
        varchar email UK
        varchar phone
        date date_of_birth
        varchar gender
        varchar blood_group
        varchar address
        varchar city
        varchar state
        varchar pincode
        varchar department
        varchar program
        varchar batch
        date enrollment_date
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    GUARDIANS {
        bigint id PK
        bigint student_id FK
        varchar first_name
        varchar last_name
        varchar relation
        varchar phone
        varchar email
        varchar occupation
        varchar address
        boolean is_emergency_contact
        timestamp created_at
        timestamp updated_at
    }

    STUDENT_DOCUMENTS {
        bigint id PK
        bigint student_id FK
        varchar document_type
        varchar file_name
        varchar original_file_name
        varchar file_type
        bigint file_size
        varchar storage_path
        timestamp uploaded_at
    }

    STUDENT_STATUS_HISTORY {
        bigint id PK
        bigint student_id FK
        varchar previous_status
        varchar new_status
        varchar reason
        varchar changed_by
        timestamp changed_at
    }
```

## 2. Table Specifications

### 2.1 `students`
- **Primary Key**: `id` (BIGSERIAL)
- **Unique Constraints**: `roll_number`, `email`
- **Indexes**: `idx_students_roll_number`, `idx_students_email`, `idx_students_department`, `idx_students_status`
- **Status Enum Values**: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`, `ALUMNI`

### 2.2 `guardians`
- **Primary Key**: `id` (BIGSERIAL)
- **Foreign Key**: `student_id` REFERENCES `students(id)` ON DELETE CASCADE
- **Indexes**: `idx_guardians_student_id`, `idx_guardians_phone`

### 2.3 `student_documents`
- **Primary Key**: `id` (BIGSERIAL)
- **Foreign Key**: `student_id` REFERENCES `students(id)` ON DELETE CASCADE
- **Document Types**: `AADHAAR`, `TRANSFER_CERTIFICATE`, `MIGRATION`, `MARKSHEET`, `PHOTOGRAPH`
- **Indexes**: `idx_student_documents_student_id`, `idx_student_documents_type`

### 2.4 `student_status_history`
- **Primary Key**: `id` (BIGSERIAL)
- **Foreign Key**: `student_id` REFERENCES `students(id)` ON DELETE CASCADE
- **Indexes**: `idx_status_history_student_id`, `idx_status_history_changed_at`
