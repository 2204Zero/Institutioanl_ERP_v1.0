# Institutional ERP Suite — PostgreSQL Financial Relational Database Schema

## 1. DDL Entity Definitions

```sql
-- 1. Fee Structures Table
CREATE TABLE fee_structures (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    program VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    total_gst NUMERIC(12,2) NOT NULL,
    net_amount NUMERIC(12,2) NOT NULL,
    allow_installments BOOLEAN DEFAULT TRUE,
    max_installments INT DEFAULT 2,
    late_fee_per_day NUMERIC(8,2) DEFAULT 100.00,
    due_date DATE NOT NULL,
    is_frozen BOOLEAN DEFAULT FALSE,
    revision_version INT DEFAULT 1,
    updated_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2. Invoices Table
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    student_id VARCHAR(36) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(30) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    parent_email VARCHAR(100),
    parent_phone VARCHAR(20),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    scholarship_discount NUMERIC(12,2) DEFAULT 0.00,
    tax_amount NUMERIC(12,2) DEFAULT 0.00,
    late_penalty_amount NUMERIC(12,2) DEFAULT 0.00,
    total_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0.00,
    balance_due NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PAID', 'PENDING', 'OVERDUE', 'PARTIAL', 'CANCELLED', 'REFUNDED')),
    payment_reference_number VARCHAR(50),
    qr_code_payload TEXT
);

-- 3. Payments Transaction Table
CREATE TABLE payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    invoice_number VARCHAR(30) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(30) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED', 'SETTLED')),
    gateway_reference VARCHAR(100),
    gateway_response_code VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    receipt_number VARCHAR(30) NOT NULL UNIQUE,
    FOREIGN KEY (invoice_number) REFERENCES invoices(invoice_number) ON DELETE RESTRICT
);

-- 4. Chart of Accounts Table
CREATE TABLE accounts (
    id VARCHAR(36) PRIMARY KEY,
    account_code VARCHAR(30) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_account VARCHAR(36),
    balance NUMERIC(14,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## 2. Database Indexes for High Throughput
- `CREATE INDEX idx_invoices_student_roll ON invoices(roll_no);`
- `CREATE INDEX idx_payments_txn ON payment_transactions(transaction_id);`
- `CREATE INDEX idx_invoices_status ON invoices(status);`
