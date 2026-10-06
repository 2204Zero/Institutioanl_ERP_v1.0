BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V3_academic_module.sql
-- Description  : Complete Academic Module
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Department
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS department (
    department_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_code VARCHAR(30) UNIQUE NOT NULL,
    department_name VARCHAR(150) NOT NULL,
    head_of_department VARCHAR(150),
    contact_email VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(25),
    building_location VARCHAR(100),
    established_year INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Program
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_program (
    program_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    program_code VARCHAR(30) UNIQUE NOT NULL,
    program_name VARCHAR(150) NOT NULL,
    degree_level VARCHAR(50) NOT NULL,
    duration_years INTEGER NOT NULL DEFAULT 4,
    total_semesters INTEGER NOT NULL DEFAULT 8,
    required_credits NUMERIC(6,2) NOT NULL DEFAULT 160.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_degree_level CHECK (degree_level IN ('UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL', 'DIPLOMA', 'CERTIFICATE'))
);

-- ------------------------------------------------------------------------------
-- 3. Batch
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS batch (
    batch_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES academic_program(program_id) ON DELETE RESTRICT,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    batch_name VARCHAR(100) NOT NULL,
    admission_year INTEGER NOT NULL,
    graduation_year INTEGER NOT NULL,
    current_semester_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_batch_graduation CHECK (graduation_year >= admission_year)
);

-- ------------------------------------------------------------------------------
-- 4. Semester
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semester (
    semester_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    calendar_id BIGINT NOT NULL REFERENCES academic_calendar(calendar_id) ON DELETE RESTRICT,
    semester_code VARCHAR(30) UNIQUE NOT NULL,
    semester_name VARCHAR(100) NOT NULL,
    semester_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_sem_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_semester_type CHECK (semester_type IN ('ODD', 'EVEN', 'SUMMER', 'SPECIAL'))
);

-- ------------------------------------------------------------------------------
-- 5. Course Category
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_elective BOOLEAN NOT NULL DEFAULT FALSE,
    min_required_credits NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. Course
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course (
    course_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_id BIGINT NOT NULL REFERENCES department(department_id) ON DELETE RESTRICT,
    category_id BIGINT NOT NULL REFERENCES course_category(category_id) ON DELETE RESTRICT,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    course_title VARCHAR(200) NOT NULL,
    credits NUMERIC(4,2) NOT NULL DEFAULT 3.00,
    lecture_hours NUMERIC(4,2) NOT NULL DEFAULT 3.00,
    tutorial_hours NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    practical_hours NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    syllabus_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Prerequisite
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_prerequisite (
    prerequisite_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
    prerequisite_course_id BIGINT NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
    minimum_grade_required VARCHAR(5) DEFAULT 'D',
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_course_prereq UNIQUE (course_id, prerequisite_course_id),
    CONSTRAINT chk_self_prereq CHECK (course_id != prerequisite_course_id)
);

-- ------------------------------------------------------------------------------
-- 8. Curriculum
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curriculum (
    curriculum_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES academic_program(program_id) ON DELETE RESTRICT,
    curriculum_version VARCHAR(50) NOT NULL,
    effective_from_year INTEGER NOT NULL,
    total_credits_required NUMERIC(6,2) NOT NULL,
    approved_by_senate_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_program_curriculum UNIQUE (program_id, curriculum_version)
);

-- ------------------------------------------------------------------------------
-- 9. Credit Mapping (Curriculum Course Mapping)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_mapping (
    mapping_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    curriculum_id BIGINT NOT NULL REFERENCES curriculum(curriculum_id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES course(course_id) ON DELETE RESTRICT,
    semester_number INTEGER NOT NULL,
    is_compulsory BOOLEAN NOT NULL DEFAULT TRUE,
    credit_weight NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_curriculum_course UNIQUE (curriculum_id, course_id, semester_number),
    CONSTRAINT chk_semester_number CHECK (semester_number > 0)
);

-- ------------------------------------------------------------------------------
-- 10. Course Offering
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_offering (
    offering_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(course_id) ON DELETE RESTRICT,
    semester_id BIGINT NOT NULL REFERENCES semester(semester_id) ON DELETE RESTRICT,
    offering_code VARCHAR(60) UNIQUE NOT NULL,
    max_enrollment_capacity INTEGER NOT NULL DEFAULT 60,
    current_enrollment_count INTEGER NOT NULL DEFAULT 0,
    offering_status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_offering_status CHECK (offering_status IN ('SCHEDULED', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'))
);

-- ------------------------------------------------------------------------------
-- 11. Section
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS section (
    section_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    section_name VARCHAR(20) NOT NULL,
    intake_capacity INTEGER NOT NULL DEFAULT 60,
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_offering_section UNIQUE (offering_id, section_name)
);

COMMIT;
