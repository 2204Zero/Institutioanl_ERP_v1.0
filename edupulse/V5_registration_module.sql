BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V5_registration_module.sql
-- Description  : Course Registration, Holds, Approvals, Drops, and Withdrawals
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Registration Hold Definition & Student Holds
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_hold (
    hold_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hold_code VARCHAR(30) UNIQUE NOT NULL,
    hold_title VARCHAR(100) NOT NULL,
    hold_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_hold_type CHECK (hold_type IN ('FINANCIAL', 'ACADEMIC_PROBATION', 'DISCIPLINARY', 'LIBRARY_OVERDUE', 'DOCUMENT_PENDING'))
);

CREATE TABLE IF NOT EXISTS student_registration_hold (
    student_hold_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    hold_id BIGINT NOT NULL REFERENCES registration_hold(hold_id) ON DELETE RESTRICT,
    placed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMPTZ,
    placed_by VARCHAR(100) NOT NULL,
    cleared_by VARCHAR(100),
    is_hold_active BOOLEAN NOT NULL DEFAULT TRUE,
    hold_reason TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Course Registration (Header)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_registration (
    registration_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    semester_id BIGINT NOT NULL REFERENCES semester(semester_id) ON DELETE RESTRICT,
    registration_number VARCHAR(60) UNIQUE NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_registered_credits NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    registration_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_semester_reg UNIQUE (student_id, semester_id),
    CONSTRAINT chk_reg_status CHECK (registration_status IN ('DRAFT', 'SUBMITTED', 'ADVISOR_APPROVED', 'COMPLETED', 'CANCELLED'))
);

-- ------------------------------------------------------------------------------
-- 3. Registration Item (Line items with duplicate prevention)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_item (
    registration_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES course_registration(registration_id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE RESTRICT,
    section_id BIGINT REFERENCES section(section_id) ON DELETE RESTRICT,
    credits NUMERIC(4,2) NOT NULL,
    grading_basis VARCHAR(30) NOT NULL DEFAULT 'LETTER_GRADE',
    item_status VARCHAR(30) NOT NULL DEFAULT 'ENROLLED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_reg_offering UNIQUE (registration_id, offering_id),
    CONSTRAINT chk_grading_basis CHECK (grading_basis IN ('LETTER_GRADE', 'PASS_FAIL', 'AUDIT')),
    CONSTRAINT chk_item_status CHECK (item_status IN ('ENROLLED', 'DROPPED', 'WITHDRAWN', 'AUDIT'))
);

-- ------------------------------------------------------------------------------
-- 4. Registration Approval
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_approval (
    approval_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES course_registration(registration_id) ON DELETE CASCADE,
    advisor_faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    decision_timestamp TIMESTAMPTZ,
    advisor_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_reg_approval_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CONDITIONAL'))
);

-- ------------------------------------------------------------------------------
-- 5. Registration Payment
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registration_payment (
    reg_payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES course_registration(registration_id) ON DELETE CASCADE,
    total_fee_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    payment_date TIMESTAMPTZ,
    payment_gateway_ref VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_reg_pay_status CHECK (payment_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'WAIVED'))
);

-- ------------------------------------------------------------------------------
-- 6. Drop Course
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drop_course (
    drop_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_item_id BIGINT UNIQUE NOT NULL REFERENCES registration_item(registration_item_id) ON DELETE RESTRICT,
    drop_request_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    drop_effective_date DATE NOT NULL,
    drop_reason TEXT NOT NULL,
    refund_percentage NUMERIC(5,2) DEFAULT 100.00,
    approved_by VARCHAR(100),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Withdraw Course
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS withdraw_course (
    withdrawal_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registration_item_id BIGINT UNIQUE NOT NULL REFERENCES registration_item(registration_item_id) ON DELETE RESTRICT,
    withdrawal_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_transcript_grade VARCHAR(5) NOT NULL DEFAULT 'W',
    withdrawal_reason TEXT NOT NULL,
    counselor_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
