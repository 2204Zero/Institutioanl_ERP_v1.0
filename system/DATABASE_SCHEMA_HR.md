# Institutional ERP Suite — PostgreSQL HRMS Database Schema

## 1. DDL Relational Schemas

```sql
-- 1. Employees Table
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(30) CHECK (category IN ('FACULTY', 'NON_TEACHING', 'CONTRACT', 'VISITING', 'GUEST', 'RESEARCH')),
    status VARCHAR(30) CHECK (status IN ('JOINING', 'PROBATION', 'CONFIRMED', 'TRANSFERRED', 'PROMOTED', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'TERMINATED', 'REHIRED', 'ALUMNI_FACULTY')),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    job_grade VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    salary_basic NUMERIC(12,2) NOT NULL,
    salary_gross NUMERIC(12,2) NOT NULL,
    bank_account_no VARCHAR(50),
    ifsc_code VARCHAR(20),
    pan_number VARCHAR(20),
    aadhaar_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Leave Applications Table
CREATE TABLE leave_applications (
    id VARCHAR(36) PRIMARY KEY,
    application_no VARCHAR(30) NOT NULL UNIQUE,
    employee_id VARCHAR(30) NOT NULL,
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    applied_on DATE DEFAULT CURRENT_DATE,
    approved_by VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 3. Payslips Table
CREATE TABLE payslips (
    id VARCHAR(36) PRIMARY KEY,
    payslip_number VARCHAR(30) NOT NULL UNIQUE,
    employee_id VARCHAR(30) NOT NULL,
    month_year VARCHAR(30) NOT NULL,
    basic_pay NUMERIC(12,2) NOT NULL,
    gross_salary NUMERIC(12,2) NOT NULL,
    total_deductions NUMERIC(12,2) NOT NULL,
    net_salary NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PROCESSED', 'DISBURSED', 'HELD')),
    payment_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE RESTRICT
);
```

---

## 2. High Throughput Performance Indexes
- `CREATE INDEX idx_emp_dept ON employees(department);`
- `CREATE INDEX idx_leave_emp ON leave_applications(employee_id);`
- `CREATE INDEX idx_payslip_month ON payslips(month_year);`
