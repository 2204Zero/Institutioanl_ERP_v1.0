BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V9_finance_module.sql
-- Description  : Complete University Financial Management, Fee Structures, Invoices, Ledgers
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Fee Category
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Fee Structure
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fee_structure (
    structure_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_id BIGINT NOT NULL REFERENCES academic_program(program_id) ON DELETE RESTRICT,
    academic_year VARCHAR(20) NOT NULL,
    semester_number INTEGER NOT NULL,
    structure_code VARCHAR(50) UNIQUE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_program_sem_fee UNIQUE (program_id, academic_year, semester_number)
);

CREATE TABLE IF NOT EXISTS fee_structure_item (
    structure_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    structure_id BIGINT NOT NULL REFERENCES fee_structure(structure_id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES fee_category(category_id) ON DELETE RESTRICT,
    amount NUMERIC(12,2) NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_structure_fee_cat UNIQUE (structure_id, category_id)
);

-- ------------------------------------------------------------------------------
-- 3. Invoice
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice (
    invoice_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    structure_id BIGINT REFERENCES fee_structure(structure_id) ON DELETE RESTRICT,
    invoice_number VARCHAR(60) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_due_amount NUMERIC(12,2) NOT NULL,
    concession_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_payable_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    invoice_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_invoice_status CHECK (invoice_status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED')),
    CONSTRAINT chk_due_date CHECK (due_date >= issue_date)
);

-- ------------------------------------------------------------------------------
-- 4. Payment
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoice(invoice_id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_amount NUMERIC(12,2) NOT NULL,
    payment_mode VARCHAR(30) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'RAZORPAY',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    payment_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gateway_response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_payment_mode CHECK (payment_mode IN ('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'NEFT_RTGS', 'CASH', 'CHEQUE', 'DEMAND_DRAFT')),
    CONSTRAINT chk_pay_status CHECK (payment_status IN ('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED'))
);

-- ------------------------------------------------------------------------------
-- 5. Receipt
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipt (
    receipt_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id BIGINT UNIQUE NOT NULL REFERENCES payment(payment_id) ON DELETE RESTRICT,
    receipt_number VARCHAR(60) UNIQUE NOT NULL,
    receipt_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receipt_pdf_url VARCHAR(500),
    issued_by VARCHAR(100) NOT NULL DEFAULT 'FINANCE_GATEWAY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. Fine
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fine (
    fine_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    fine_category VARCHAR(50) NOT NULL,
    fine_amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    is_waived BOOLEAN NOT NULL DEFAULT FALSE,
    waiver_reason TEXT,
    waived_by VARCHAR(100),
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_payment_id BIGINT REFERENCES payment(payment_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_fine_cat CHECK (fine_category IN ('LATE_FEE', 'LIBRARY_OVERDUE', 'HOSTEL_DAMAGE', 'DISCIPLINARY', 'LAB_BREAKAGE'))
);

-- ------------------------------------------------------------------------------
-- 7. Refund
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refund (
    refund_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payment(payment_id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    refund_amount NUMERIC(12,2) NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    bank_account_number VARCHAR(50) NOT NULL,
    bank_ifsc VARCHAR(20) NOT NULL,
    processed_date TIMESTAMPTZ,
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_refund_status CHECK (refund_status IN ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED'))
);

-- ------------------------------------------------------------------------------
-- 8. Ledger (Double-Entry Financial Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ledger (
    ledger_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    entry_type VARCHAR(10) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    running_balance NUMERIC(12,2) NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    description TEXT,
    entry_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_ledger_entry_type CHECK (entry_type IN ('DEBIT', 'CREDIT'))
);

COMMIT;
