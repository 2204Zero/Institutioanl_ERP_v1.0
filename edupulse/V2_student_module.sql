BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V2_student_module.sql
-- Description  : Complete Student Module (Profile, Guardians, Addresses, Medical, Auth, Preferences)
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Student Profile
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_profile (
    profile_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    official_email VARCHAR(150) UNIQUE NOT NULL,
    personal_email VARCHAR(150),
    mobile VARCHAR(25) UNIQUE NOT NULL,
    alternate_mobile VARCHAR(25),
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    date_of_birth DATE NOT NULL,
    nationality VARCHAR(50) NOT NULL DEFAULT 'INDIAN',
    religion VARCHAR(50),
    category VARCHAR(50) DEFAULT 'GENERAL',
    domicile_state VARCHAR(100),
    photo_url VARCHAR(500),
    signature_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_student_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'))
);

-- ------------------------------------------------------------------------------
-- 2. Guardian & Student Guardian Mapping
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guardian (
    guardian_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    primary_mobile VARCHAR(25) NOT NULL,
    alternate_mobile VARCHAR(25),
    email VARCHAR(150),
    occupation VARCHAR(100),
    annual_income NUMERIC(12,2) DEFAULT 0.00,
    organization_name VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS student_guardian (
    student_guardian_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    guardian_id BIGINT NOT NULL REFERENCES guardian(guardian_id) ON DELETE CASCADE,
    is_primary_guardian BOOLEAN NOT NULL DEFAULT TRUE,
    can_sign_undertaking BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_guardian UNIQUE (student_id, guardian_id)
);

-- ------------------------------------------------------------------------------
-- 3. Address
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_address (
    address_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    address_type VARCHAR(30) NOT NULL,
    address_line1 VARCHAR(250) NOT NULL,
    address_line2 VARCHAR(250),
    landmark VARCHAR(150),
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
    CONSTRAINT chk_student_address_type CHECK (address_type IN ('PERMANENT', 'CORRESPONDENCE', 'HOSTEL', 'LOCAL_GUARDIAN'))
);

-- ------------------------------------------------------------------------------
-- 4. Emergency Contact
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_contact (
    contact_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    primary_phone VARCHAR(25) NOT NULL,
    secondary_phone VARCHAR(25),
    email VARCHAR(150),
    priority_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_emergency_priority CHECK (priority_order > 0)
);

-- ------------------------------------------------------------------------------
-- 5. Previous Education
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS previous_education (
    education_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    qualification_title VARCHAR(100) NOT NULL,
    board_or_university VARCHAR(200) NOT NULL,
    school_or_college VARCHAR(250) NOT NULL,
    passing_year INTEGER NOT NULL,
    score_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    score_value NUMERIC(6,2) NOT NULL,
    maximum_score NUMERIC(6,2) NOT NULL,
    percentage NUMERIC(5,2) NOT NULL,
    certificate_roll_no VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_score_type CHECK (score_type IN ('PERCENTAGE', 'CGPA', 'GRADE'))
);

-- ------------------------------------------------------------------------------
-- 6. Medical Record
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_record (
    medical_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    identification_mark TEXT,
    known_allergies TEXT,
    chronic_conditions TEXT,
    physical_disability_details TEXT,
    has_disability BOOLEAN NOT NULL DEFAULT FALSE,
    health_insurance_provider VARCHAR(150),
    health_insurance_policy_no VARCHAR(100),
    insurance_expiry_date DATE,
    doctor_contact_name VARCHAR(150),
    doctor_contact_phone VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Scholarship & Student Scholarship Mapping
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scholarship (
    scholarship_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scholarship_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(150) NOT NULL,
    awarding_body VARCHAR(200) NOT NULL,
    scholarship_type VARCHAR(50) NOT NULL,
    coverage_percentage NUMERIC(5,2) DEFAULT 0.00,
    fixed_annual_amount NUMERIC(12,2) DEFAULT 0.00,
    min_cgpa_requirement NUMERIC(3,2) DEFAULT 7.50,
    renewal_criteria TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_scholarship_type CHECK (scholarship_type IN ('MERIT', 'NEED_BASED', 'SPORTS', 'GOVERNMENT', 'ALUMNI_ENDOWMENT'))
);

CREATE TABLE IF NOT EXISTS student_scholarship (
    student_scholarship_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    scholarship_id BIGINT NOT NULL REFERENCES scholarship(scholarship_id) ON DELETE RESTRICT,
    awarded_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    disbursed_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    scholarship_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_student_scholarship_status CHECK (scholarship_status IN ('ACTIVE', 'RENEWED', 'REVOKED', 'EXPIRED'))
);

-- ------------------------------------------------------------------------------
-- 8. Student Documents
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_document (
    student_doc_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    document_title VARCHAR(150) NOT NULL,
    document_category VARCHAR(50) NOT NULL,
    file_uri VARCHAR(500) NOT NULL,
    file_mime_type VARCHAR(50) NOT NULL,
    file_size_kb BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by VARCHAR(100),
    verification_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 9. Student Status
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_status (
    status_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    status_name VARCHAR(50) NOT NULL,
    reason TEXT,
    effective_date DATE NOT NULL,
    approved_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 10. Student Login
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_login (
    login_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100),
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    lockout_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 11. Student Preferences
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_preferences (
    preference_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    portal_theme VARCHAR(30) NOT NULL DEFAULT 'DARK',
    preferred_language VARCHAR(20) NOT NULL DEFAULT 'en-US',
    email_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    digest_frequency VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
