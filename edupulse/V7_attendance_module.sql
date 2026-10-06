BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V7_attendance_module.sql
-- Description  : Attendance Management System (Biometric, Faculty & Student)
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Biometric Devices & Raw Logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS biometric_device (
    device_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_serial VARCHAR(60) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(20) UNIQUE,
    location_description VARCHAR(150) NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT TRUE,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS biometric_raw_log (
    log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES biometric_device(device_id) ON DELETE RESTRICT,
    badge_identifier VARCHAR(100) NOT NULL,
    punch_timestamp TIMESTAMPTZ NOT NULL,
    punch_type VARCHAR(10) NOT NULL DEFAULT 'IN',
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_punch_type CHECK (punch_type IN ('IN', 'OUT'))
);

-- ------------------------------------------------------------------------------
-- 2. Student Attendance Record
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_attendance_record (
    record_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    schedule_id BIGINT NOT NULL REFERENCES class_schedule(schedule_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    marked_by_faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_schedule_attendance UNIQUE (student_id, schedule_id, attendance_date),
    CONSTRAINT chk_student_att_status CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED'))
);

-- ------------------------------------------------------------------------------
-- 3. Faculty Attendance Log (Dedicated Detailed)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_attendance_record (
    fac_record_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    punch_in TIMESTAMPTZ,
    punch_out TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 0,
    attendance_status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_faculty_att_rec UNIQUE (faculty_id, attendance_date),
    CONSTRAINT chk_fac_rec_status CHECK (attendance_status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_DUTY', 'ON_LEAVE', 'HOLIDAY'))
);

-- ------------------------------------------------------------------------------
-- 4. Attendance Correction Request
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_correction (
    correction_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    record_id BIGINT NOT NULL REFERENCES student_attendance_record(record_id) ON DELETE CASCADE,
    requested_status VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    supporting_doc_url VARCHAR(500),
    review_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    review_remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_correction_status CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- ------------------------------------------------------------------------------
-- 5. Leave Request
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leave_request (
    leave_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    applicant_type VARCHAR(30) NOT NULL,
    applicant_student_id BIGINT REFERENCES student(student_id) ON DELETE CASCADE,
    applicant_faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4,1) NOT NULL,
    reason TEXT NOT NULL,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_applicant_type CHECK (applicant_type IN ('STUDENT', 'FACULTY')),
    CONSTRAINT chk_leave_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 6. Attendance Summary
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_summary (
    summary_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    semester_id BIGINT NOT NULL REFERENCES semester(semester_id) ON DELETE CASCADE,
    total_delivered_classes INTEGER NOT NULL DEFAULT 0,
    total_attended_classes INTEGER NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_course_summary UNIQUE (student_id, offering_id, semester_id)
);

-- ------------------------------------------------------------------------------
-- 7. Attendance Alert
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_alert (
    alert_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    offering_id BIGINT NOT NULL REFERENCES course_offering(offering_id) ON DELETE CASCADE,
    current_percentage NUMERIC(5,2) NOT NULL,
    threshold_percentage NUMERIC(5,2) NOT NULL DEFAULT 75.00,
    alert_level VARCHAR(20) NOT NULL DEFAULT 'WARNING',
    is_notified_to_guardian BOOLEAN NOT NULL DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_alert_level CHECK (alert_level IN ('INFO', 'WARNING', 'CRITICAL', 'DEBARRED'))
);

COMMIT;
