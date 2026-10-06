BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V4_faculty_module.sql
-- Description  : Complete Faculty Management Module
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Designation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_designation (
    designation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    designation_code VARCHAR(30) UNIQUE NOT NULL,
    designation_name VARCHAR(100) NOT NULL,
    pay_scale_band VARCHAR(50),
    min_teaching_load_hours NUMERIC(4,2) DEFAULT 12.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Faculty
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    designation_id BIGINT NOT NULL REFERENCES faculty_designation(designation_id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    official_email VARCHAR(150) UNIQUE NOT NULL,
    personal_email VARCHAR(150),
    mobile VARCHAR(25) UNIQUE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    date_of_joining DATE NOT NULL,
    employment_type VARCHAR(30) NOT NULL DEFAULT 'FULL_TIME',
    qualification_highest VARCHAR(100) NOT NULL,
    specialization_area VARCHAR(200),
    experience_years NUMERIC(4,1) DEFAULT 0.0,
    faculty_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    photo_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_faculty_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_employment_type CHECK (employment_type IN ('FULL_TIME', 'ADJUNCT', 'VISITING', 'EMERITUS', 'CONTRACT')),
    CONSTRAINT chk_faculty_status CHECK (faculty_status IN ('ACTIVE', 'ON_LEAVE', 'SABBATICAL', 'RESIGNED', 'RETIRED'))
);

-- ------------------------------------------------------------------------------
-- 3. Faculty Department Mapping
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_department (
    faculty_dept_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    department_id BIGINT NOT NULL REFERENCES department(department_id) ON DELETE CASCADE,
    is_primary_department BOOLEAN NOT NULL DEFAULT TRUE,
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_faculty_dept UNIQUE (faculty_id, department_id)
);

-- ------------------------------------------------------------------------------
-- 4. Faculty Qualification
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_qualification (
    qualification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    degree_title VARCHAR(150) NOT NULL,
    institution_name VARCHAR(250) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    completion_year INTEGER NOT NULL,
    specialization VARCHAR(150),
    grade_or_division VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 5. Faculty Address
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_address (
    address_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    address_type VARCHAR(30) NOT NULL DEFAULT 'CURRENT',
    address_line1 VARCHAR(250) NOT NULL,
    address_line2 VARCHAR(250),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_fac_address_type CHECK (address_type IN ('PERMANENT', 'CURRENT'))
);

-- ------------------------------------------------------------------------------
-- 6. Faculty Documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_documents (
    doc_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    document_title VARCHAR(150) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_uri VARCHAR(500) NOT NULL,
    file_size_kb BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Faculty Assignment
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_assignment (
    assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    section_id BIGINT REFERENCES section(section_id) ON DELETE CASCADE,
    teaching_role VARCHAR(50) NOT NULL DEFAULT 'PRIMARY_INSTRUCTOR',
    assigned_workload_hours NUMERIC(4,2) NOT NULL DEFAULT 4.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_teaching_role CHECK (teaching_role IN ('PRIMARY_INSTRUCTOR', 'CO_INSTRUCTOR', 'LAB_INSTRUCTOR', 'TEACHING_ASSISTANT'))
);

-- ------------------------------------------------------------------------------
-- 8. Faculty Attendance
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_attendance (
    attendance_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    punch_in_time TIMESTAMPTZ,
    punch_out_time TIMESTAMPTZ,
    attendance_status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    biometric_device_id VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_fac_attendance_date UNIQUE (faculty_id, attendance_date),
    CONSTRAINT chk_fac_att_status CHECK (attendance_status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_DUTY', 'ON_LEAVE', 'HOLIDAY'))
);

-- ------------------------------------------------------------------------------
-- 9. Faculty Salary
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_salary (
    salary_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    basic_salary NUMERIC(12,2) NOT NULL,
    hra NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    da NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    special_allowance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    provident_fund_deduction NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_deduction NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_payable_salary NUMERIC(12,2) NOT NULL,
    effective_from_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 10. Faculty Login
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_login (
    login_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT UNIQUE NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100),
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    failed_attempts INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lockout_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
