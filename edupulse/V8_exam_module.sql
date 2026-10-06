BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V8_exam_module.sql
-- Description  : Examination, Grading, Marks, Results, and CGPA Transcripts
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Exam Type
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_type (
    exam_type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_code VARCHAR(30) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    weightage_percentage NUMERIC(5,2) NOT NULL DEFAULT 40.00,
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Grading Scale
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grading_scale (
    grade_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    grade_letter VARCHAR(5) UNIQUE NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL,
    min_marks_percent NUMERIC(5,2) NOT NULL,
    max_marks_percent NUMERIC(5,2) NOT NULL,
    grade_description VARCHAR(50) NOT NULL,
    is_pass BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_grade_range CHECK (max_marks_percent >= min_marks_percent)
);

-- ------------------------------------------------------------------------------
-- 3. Exam Schedule
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam (
    exam_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE RESTRICT,
    exam_type_id BIGINT NOT NULL REFERENCES exam_type(exam_type_id) ON DELETE RESTRICT,
    exam_code VARCHAR(50) UNIQUE NOT NULL,
    exam_title VARCHAR(150) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    passing_marks NUMERIC(6,2) NOT NULL DEFAULT 40.00,
    exam_status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_exam_status CHECK (exam_status IN ('SCHEDULED', 'CONDUCTING', 'COMPLETED', 'POSTPONED', 'CANCELLED'))
);

-- ------------------------------------------------------------------------------
-- 4. Exam Hall Seating
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_hall (
    hall_seating_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exam(exam_id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES room(room_id) ON DELETE RESTRICT,
    allocated_students_count INTEGER NOT NULL DEFAULT 0,
    seating_plan_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_exam_room UNIQUE (exam_id, room_id)
);

-- ------------------------------------------------------------------------------
-- 5. Invigilator Duty
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invigilator (
    invigilator_duty_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exam(exam_id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES room(room_id) ON DELETE RESTRICT,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    reporting_time TIMESTAMPTZ,
    duty_status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_exam_room_faculty UNIQUE (exam_id, room_id, faculty_id),
    CONSTRAINT chk_duty_status CHECK (duty_status IN ('ASSIGNED', 'REPORTED', 'ABSENT', 'REPLACED'))
);

-- ------------------------------------------------------------------------------
-- 6. Marks Entry
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marks (
    marks_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    exam_id BIGINT NOT NULL REFERENCES exam(exam_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    marks_obtained NUMERIC(6,2),
    is_absent BOOLEAN NOT NULL DEFAULT FALSE,
    evaluated_by_faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    moderation_adjustment NUMERIC(6,2) DEFAULT 0.00,
    final_marks NUMERIC(6,2),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_exam_student_marks UNIQUE (exam_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 7. Course Result
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS result (
    result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    semester_id BIGINT NOT NULL REFERENCES semester(semester_id) ON DELETE RESTRICT,
    total_marks_obtained NUMERIC(6,2) NOT NULL,
    max_total_marks NUMERIC(6,2) NOT NULL DEFAULT 100.00,
    percentage NUMERIC(5,2) NOT NULL,
    grade_letter VARCHAR(5) NOT NULL,
    grade_point NUMERIC(4,2) NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT TRUE,
    result_status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_offering_result UNIQUE (student_id, offering_id)
);

-- ------------------------------------------------------------------------------
-- 8. CGPA & Semester GPA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_semester_gpa (
    sgpa_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    semester_id BIGINT NOT NULL REFERENCES semester(semester_id) ON DELETE RESTRICT,
    credits_registered NUMERIC(5,2) NOT NULL,
    credits_earned NUMERIC(5,2) NOT NULL,
    total_grade_points NUMERIC(6,2) NOT NULL,
    sgpa NUMERIC(4,2) NOT NULL,
    is_promoted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_sem_sgpa UNIQUE (student_id, semester_id)
);

CREATE TABLE IF NOT EXISTS cgpa (
    cgpa_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    total_cumulative_credits NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    total_earned_credits NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    total_grade_points_earned NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    academic_standing VARCHAR(50) NOT NULL DEFAULT 'GOOD_STANDING',
    last_updated_semester_id BIGINT REFERENCES semester(semester_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_academic_standing CHECK (academic_standing IN ('GOOD_STANDING', 'PROBATION', 'HONORS', 'DEAN_LIST', 'DISMISSED'))
);

-- ------------------------------------------------------------------------------
-- 9. Transcript
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transcript (
    transcript_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    transcript_serial VARCHAR(60) UNIQUE NOT NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verification_hash VARCHAR(128) NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT TRUE,
    issued_by VARCHAR(100) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
