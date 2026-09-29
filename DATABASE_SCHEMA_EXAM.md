# PostgreSQL Examination Relational Database Schema DDL

```sql
CREATE TABLE exams (
    id VARCHAR(36) PRIMARY KEY,
    exam_id VARCHAR(30) NOT NULL UNIQUE,
    exam_name VARCHAR(200) NOT NULL,
    semester INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    programme VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('INTERNAL', 'EXTERNAL', 'PRACTICAL', 'VIVA', 'ONLINE', 'OFFLINE', 'OPEN_BOOK')),
    passing_marks INT NOT NULL DEFAULT 40,
    max_marks INT NOT NULL DEFAULT 100,
    status VARCHAR(20) CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'))
);

CREATE TABLE student_marks (
    id VARCHAR(36) PRIMARY KEY,
    student_roll_no VARCHAR(30) NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    internal_marks NUMERIC(5,2) DEFAULT 0,
    external_marks NUMERIC(5,2) DEFAULT 0,
    total_marks NUMERIC(5,2) NOT NULL,
    grade_letter VARCHAR(5) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    result_status VARCHAR(20) CHECK (result_status IN ('PASSED', 'BACKLOG', 'MALPRACTICE'))
);
```
