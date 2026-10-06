BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V13_hr_module.sql
-- Description  : Human Resources, Staff Management, Payroll, Leaves & Performance
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. HR Administrative Department
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hr_department (
    hr_dept_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dept_code VARCHAR(30) UNIQUE NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    manager_name VARCHAR(150),
    budget_allocated NUMERIC(14,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Employee (Non-Teaching & Administrative Staff)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
    employee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    hr_dept_id BIGINT NOT NULL REFERENCES hr_department(hr_dept_id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    official_email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(25) UNIQUE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    joining_date DATE NOT NULL,
    designation VARCHAR(100) NOT NULL,
    employment_type VARCHAR(30) NOT NULL DEFAULT 'PERMANENT',
    pan_number VARCHAR(20) UNIQUE,
    aadhaar_number VARCHAR(30) UNIQUE,
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    employment_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_emp_status CHECK (employment_status IN ('ACTIVE', 'PROBATION', 'RESIGNED', 'TERMINATED', 'RETIRED'))
);

-- ------------------------------------------------------------------------------
-- 3. Recruitment & Candidates
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruitment (
    requisition_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hr_dept_id BIGINT NOT NULL REFERENCES hr_department(hr_dept_id) ON DELETE RESTRICT,
    job_title VARCHAR(150) NOT NULL,
    vacancies_count INTEGER NOT NULL DEFAULT 1,
    experience_required_years NUMERIC(3,1) DEFAULT 0.0,
    min_salary_offered NUMERIC(12,2),
    max_salary_offered NUMERIC(12,2),
    job_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    target_closing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_recruitment_status CHECK (job_status IN ('OPEN', 'ON_HOLD', 'FILLED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS job_candidate (
    candidate_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requisition_id BIGINT NOT NULL REFERENCES recruitment(requisition_id) ON DELETE CASCADE,
    candidate_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    resume_doc_url VARCHAR(500) NOT NULL,
    interview_stage VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    interviewer_feedback TEXT,
    offered_salary NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_candidate_stage CHECK (interview_stage IN ('APPLIED', 'SCREENING', 'TECHNICAL_INTERVIEW', 'HR_ROUND', 'OFFER_MADE', 'HIRED', 'REJECTED'))
);

-- ------------------------------------------------------------------------------
-- 4. Employee Performance Appraisal
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS performance (
    appraisal_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    appraisal_cycle VARCHAR(50) NOT NULL,
    kpi_score NUMERIC(5,2) NOT NULL,
    rating_category VARCHAR(30) NOT NULL,
    evaluator_remarks TEXT,
    appraiser_name VARCHAR(150) NOT NULL,
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_rating_category CHECK (rating_category IN ('EXCELLENT', 'MEETS_EXPECTATIONS', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY'))
);

-- ------------------------------------------------------------------------------
-- 5. Employee Promotion
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotion (
    promotion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    previous_designation VARCHAR(100) NOT NULL,
    new_designation VARCHAR(100) NOT NULL,
    previous_salary NUMERIC(12,2) NOT NULL,
    revised_salary NUMERIC(12,2) NOT NULL,
    effective_date DATE NOT NULL,
    approved_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. HR Staff Attendance
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hr_attendance (
    hr_att_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    work_hours NUMERIC(4,2) DEFAULT 8.00,
    att_status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_emp_att_date UNIQUE (employee_id, attendance_date),
    CONSTRAINT chk_staff_att_status CHECK (att_status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'))
);

-- ------------------------------------------------------------------------------
-- 7. Employee Leave
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hr_leave (
    leave_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_days NUMERIC(4,1) NOT NULL,
    reason TEXT NOT NULL,
    leave_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approved_by VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_hr_leave_type CHECK (leave_type IN ('CASUAL', 'EARNED', 'SICK', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT')),
    CONSTRAINT chk_hr_leave_status CHECK (leave_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- ------------------------------------------------------------------------------
-- 8. Payroll Processing
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll (
    payroll_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
    pay_period_month INTEGER NOT NULL,
    pay_period_year INTEGER NOT NULL,
    basic_pay NUMERIC(12,2) NOT NULL,
    allowances NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    gross_pay NUMERIC(12,2) NOT NULL,
    deductions NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_pay NUMERIC(12,2) NOT NULL,
    disbursement_status VARCHAR(30) NOT NULL DEFAULT 'PROCESSED',
    disbursement_date TIMESTAMPTZ,
    bank_reference_number VARCHAR(100),
    payslip_pdf_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_emp_payroll_period UNIQUE (employee_id, pay_period_month, pay_period_year),
    CONSTRAINT chk_payroll_disb_status CHECK (disbursement_status IN ('DRAFT', 'PROCESSED', 'PAID', 'FAILED'))
);

COMMIT;
