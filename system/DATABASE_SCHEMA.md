# Institutional ERP Suite — Relational Database Schema & Data Dictionary

## 1. Relational Entity Relationship Architecture (PostgreSQL)

```
 academic_sessions ──< academic_terms ──< course_offerings ──< student_enrollments
                                                │                    │
                                                ├──> courses         └──> attendance_records
                                                ├──> faculty
                                                └──> rooms
```

---

## 2. PostgreSQL DDL Table Specifications

### 2.1 `academic_sessions`
```sql
CREATE TABLE academic_sessions (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) CHECK (status IN ('UPCOMING', 'ACTIVE', 'CONCLUDED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 `courses`
```sql
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    lecture_hours INT NOT NULL DEFAULT 3,
    tutorial_hours INT NOT NULL DEFAULT 0,
    practical_hours INT NOT NULL DEFAULT 0,
    credits INT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('THEORY', 'LABORATORY', 'SEMINAR', 'PROJECT', 'STUDIO')),
    category VARCHAR(20) CHECK (category IN ('CORE', 'ELECTIVE', 'OPEN_ELECTIVE', 'SKILL', 'VALUE_ADDED')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 `lms_learning_materials`
```sql
CREATE TABLE lms_learning_materials (
    id VARCHAR(36) PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL,
    file_url TEXT NOT NULL,
    file_size VARCHAR(20) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    downloads_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_code) REFERENCES courses(code) ON DELETE CASCADE
);
```

### 2.4 `lms_discussion_threads`
```sql
CREATE TABLE lms_discussion_threads (
    id VARCHAR(36) PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    replies_count INT DEFAULT 0,
    upvotes INT DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- PostgreSQL Array type for tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 `attendance_records`
```sql
CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    course_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    time_slot_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'DUTY_LEAVE', 'MEDICAL_LEAVE')),
    marked_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_attendance_entry UNIQUE (student_id, course_id, date, time_slot_id)
);
```

---

## 3. Indexing & Optimization Strategy
- **Composite Index on Attendance**: `CREATE INDEX idx_attendance_student_course ON attendance_records(student_id, course_id);`
- **LMS Course Index**: `CREATE INDEX idx_lms_materials_course ON lms_learning_materials(course_code);`
