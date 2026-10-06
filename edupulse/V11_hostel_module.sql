BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V11_hostel_module.sql
-- Description  : Complete Hostel & Residence Management Module
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Hostel Building
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel (
    hostel_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_code VARCHAR(30) UNIQUE NOT NULL,
    hostel_name VARCHAR(150) NOT NULL,
    hostel_type VARCHAR(20) NOT NULL,
    total_floors INTEGER NOT NULL DEFAULT 4,
    warden_name VARCHAR(150) NOT NULL,
    warden_phone VARCHAR(25) NOT NULL,
    warden_email VARCHAR(150),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_hostel_type CHECK (hostel_type IN ('BOYS', 'GIRLS', 'COED', 'FACULTY_QUARTERS'))
);

-- ------------------------------------------------------------------------------
-- 2. Room & Bed
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_room (
    room_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_id BIGINT NOT NULL REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    room_number VARCHAR(30) NOT NULL,
    floor_number INTEGER NOT NULL DEFAULT 1,
    bed_capacity INTEGER NOT NULL DEFAULT 2,
    room_climate_type VARCHAR(20) NOT NULL DEFAULT 'NON_AC',
    has_attached_bathroom BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_rent NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_hostel_room UNIQUE (hostel_id, room_number),
    CONSTRAINT chk_climate_type CHECK (room_climate_type IN ('AC', 'NON_AC'))
);

CREATE TABLE IF NOT EXISTS hostel_bed (
    bed_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES hostel_room(room_id) ON DELETE CASCADE,
    bed_label VARCHAR(20) NOT NULL,
    is_occupied BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_room_bed UNIQUE (room_id, bed_label)
);

-- ------------------------------------------------------------------------------
-- 3. Allocation & Vacate
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_bed_allocation (
    allocation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bed_id BIGINT NOT NULL REFERENCES hostel_bed(bed_id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_vacate_date DATE,
    actual_vacate_date DATE,
    allocation_status VARCHAR(30) NOT NULL DEFAULT 'ALLOCATED',
    deposit_amount NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_alloc_status CHECK (allocation_status IN ('ALLOCATED', 'OCCUPIED', 'VACATED', 'EXPELLED'))
);

CREATE TABLE IF NOT EXISTS hostel_vacate_request (
    vacate_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    allocation_id BIGINT UNIQUE NOT NULL REFERENCES hostel_bed_allocation(allocation_id) ON DELETE RESTRICT,
    request_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vacate_date DATE NOT NULL,
    reason TEXT NOT NULL,
    clearance_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    inspection_remarks TEXT,
    damage_fee NUMERIC(10,2) DEFAULT 0.00,
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_clearance_status CHECK (clearance_status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- ------------------------------------------------------------------------------
-- 4. Mess Management
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_mess (
    mess_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_id BIGINT NOT NULL REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    mess_name VARCHAR(100) NOT NULL,
    caterer_name VARCHAR(150) NOT NULL,
    monthly_charges NUMERIC(10,2) NOT NULL DEFAULT 4000.00,
    has_veg_only BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS hostel_mess_subscription (
    subscription_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mess_id BIGINT NOT NULL REFERENCES hostel_mess(mess_id) ON DELETE RESTRICT,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE RESTRICT,
    dietary_preference VARCHAR(30) NOT NULL DEFAULT 'VEG',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    subscription_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_diet_pref CHECK (dietary_preference IN ('VEG', 'NON_VEG', 'JAIN_VEG', 'VEGAN'))
);

-- ------------------------------------------------------------------------------
-- 5. Visitor Log
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_visitor (
    visitor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_id BIGINT NOT NULL REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    visitor_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(25) NOT NULL,
    id_proof_type VARCHAR(50) NOT NULL,
    id_proof_number VARCHAR(100) NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMPTZ,
    security_guard_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. Hostel Complaint
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hostel_complaint (
    complaint_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    hostel_id BIGINT NOT NULL REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student(student_id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES hostel_room(room_id) ON DELETE SET NULL,
    complaint_category VARCHAR(50) NOT NULL,
    complaint_title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    complaint_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_technician VARCHAR(100),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_complaint_cat CHECK (complaint_category IN ('ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'CLEANLINESS', 'WIFI_NETWORK', 'PEST_CONTROL', 'OTHER')),
    CONSTRAINT chk_hostel_comp_status CHECK (complaint_status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

COMMIT;
