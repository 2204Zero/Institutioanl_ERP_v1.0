BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V1_create_core_database.sql
-- Description  : Core Database Foundation, Departments, Academic Programs & Admission System
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- 1. Department (Institutional Base Structure)
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
-- 2. Academic Program (Degrees Offered)
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
-- 3. Academic Calendar
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_calendar (
    calendar_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    term_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current_term BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_academic_calendar_dates CHECK (end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 4. Credit Policy & Standards
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_policy (
    credit_policy_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    policy_code VARCHAR(30) UNIQUE NOT NULL,
    policy_name VARCHAR(100) NOT NULL,
    min_credits_per_term NUMERIC(5,2) NOT NULL DEFAULT 12.00,
    max_credits_per_term NUMERIC(5,2) NOT NULL DEFAULT 24.00,
    lecture_hours_per_credit NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    lab_hours_per_credit NUMERIC(5,2) NOT NULL DEFAULT 30.00,
    pass_grade_point NUMERIC(3,2) NOT NULL DEFAULT 2.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_credit_policy_range CHECK (max_credits_per_term >= min_credits_per_term)
);

-- ------------------------------------------------------------------------------
-- 5. Admission Inquiry
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admission_inquiry (
    inquiry_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inquiry_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    mobile VARCHAR(25) NOT NULL,
    inquiry_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    interested_program VARCHAR(100) NOT NULL,
    previous_institution VARCHAR(200),
    inquiry_source VARCHAR(50) DEFAULT 'WEBSITE',
    inquiry_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    counselor_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_inquiry_status CHECK (inquiry_status IN ('OPEN', 'CONTACTED', 'CONVERTED', 'CLOSED', 'SPAM'))
);

-- ------------------------------------------------------------------------------
-- 6. Applicant
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applicant (
    applicant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inquiry_id BIGINT REFERENCES admission_inquiry(inquiry_id) ON DELETE SET NULL,
    applicant_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(25) UNIQUE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL DEFAULT 'INDIAN',
    aadhaar_number VARCHAR(30) UNIQUE,
    passport_number VARCHAR(30),
    registration_status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_applicant_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    CONSTRAINT chk_applicant_status CHECK (registration_status IN ('REGISTERED', 'VERIFIED', 'APPLIED', 'WITHDRAWN'))
);

-- ------------------------------------------------------------------------------
-- 7. Application (Connected to academic_program)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application (
    application_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    applicant_id BIGINT NOT NULL REFERENCES applicant(applicant_id) ON DELETE RESTRICT,
    program_id BIGINT NOT NULL REFERENCES academic_program(program_id) ON DELETE RESTRICT,
    calendar_id BIGINT NOT NULL REFERENCES academic_calendar(calendar_id) ON DELETE RESTRICT,
    application_number VARCHAR(60) UNIQUE NOT NULL,
    submission_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    application_fee_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    fee_transaction_reference VARCHAR(100),
    application_status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_application_status CHECK (application_status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED', 'ENROLLED'))
);

-- ------------------------------------------------------------------------------
-- 8. Application Document
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_document (
    document_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES application(application_id) ON DELETE CASCADE,
    document_type VARCHAR(60) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    verified_by VARCHAR(100),
    verification_date TIMESTAMPTZ,
    verification_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_document_verif_status CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'RE_UPLOAD_REQUESTED'))
);

-- ------------------------------------------------------------------------------
-- 9. Application Review
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS application_review (
    review_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES application(application_id) ON DELETE CASCADE,
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_role VARCHAR(50) NOT NULL,
    academic_score NUMERIC(5,2) DEFAULT 0.00,
    entrance_score NUMERIC(5,2) DEFAULT 0.00,
    interview_score NUMERIC(5,2) DEFAULT 0.00,
    total_rating NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    review_recommendation VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    review_notes TEXT,
    review_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_review_recommendation CHECK (review_recommendation IN ('PENDING', 'STRONGLY_ACCEPT', 'ACCEPT', 'WAITLIST', 'REJECT'))
);

-- ------------------------------------------------------------------------------
-- 10. Admission Decision
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admission_decision (
    decision_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT UNIQUE NOT NULL REFERENCES application(application_id) ON DELETE CASCADE,
    decision_type VARCHAR(30) NOT NULL,
    decision_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    offer_letter_number VARCHAR(100) UNIQUE,
    offer_expiry_date DATE,
    scholarship_percentage NUMERIC(5,2) DEFAULT 0.00,
    approved_by VARCHAR(100) NOT NULL,
    candidate_accepted BOOLEAN DEFAULT FALSE,
    acceptance_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_decision_type CHECK (decision_type IN ('OFFERED', 'CONDITIONAL_OFFER', 'REJECTED', 'WAITLISTED'))
);

-- ------------------------------------------------------------------------------
-- 11. Student (Root Enrollment Record)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student (
    student_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT UNIQUE REFERENCES application(application_id) ON DELETE RESTRICT,
    student_registration_number VARCHAR(50) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50) UNIQUE,
    admission_date DATE NOT NULL,
    batch_year INTEGER NOT NULL,
    current_semester INTEGER NOT NULL DEFAULT 1,
    student_category VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    enrollment_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_student_enroll_status CHECK (enrollment_status IN ('ACTIVE', 'PROBATION', 'SUSPENDED', 'ALUMNI', 'WITHDRAWN', 'DEFERRED'))
);

-- ------------------------------------------------------------------------------
-- 12. Student History
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_history (
    history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    remarks TEXT,
    action_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
