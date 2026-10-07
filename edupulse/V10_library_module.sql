BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V10_library_module.sql
-- Description  : Complete Library Automation System
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Category & Rack
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    dewey_decimal_class VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS library_rack (
    rack_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rack_code VARCHAR(30) UNIQUE NOT NULL,
    aisle_number VARCHAR(20) NOT NULL,
    floor_number INTEGER NOT NULL DEFAULT 1,
    shelf_capacity INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Author & Publisher
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_author (
    author_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    biography TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS book_publisher (
    publisher_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    publisher_name VARCHAR(150) UNIQUE NOT NULL,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(25),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Book (Title Record) & Author Mapping
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book (
    book_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    isbn VARCHAR(25) UNIQUE NOT NULL,
    title VARCHAR(250) NOT NULL,
    edition VARCHAR(30),
    category_id BIGINT NOT NULL REFERENCES book_category(category_id) ON DELETE RESTRICT,
    publisher_id BIGINT REFERENCES book_publisher(publisher_id) ON DELETE SET NULL,
    publication_year INTEGER,
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_book_copies CHECK (available_copies >= 0 AND total_copies >= available_copies)
);

CREATE TABLE IF NOT EXISTS book_author_mapping (
    mapping_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES book_author(author_id) ON DELETE CASCADE,
    is_primary_author BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_book_author UNIQUE (book_id, author_id)
);

-- ------------------------------------------------------------------------------
-- 4. Book Physical Copy / Item
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_item (
    item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    rack_id BIGINT REFERENCES library_rack(rack_id) ON DELETE SET NULL,
    barcode VARCHAR(60) UNIQUE NOT NULL,
    rfid_tag VARCHAR(100) UNIQUE,
    acquisition_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_item_status CHECK (item_status IN ('AVAILABLE', 'ISSUED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'REFERENCE_ONLY'))
);

-- ------------------------------------------------------------------------------
-- 5. Book Reservation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_reservation (
    reservation_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES book(book_id) ON DELETE CASCADE,
    student_id BIGINT REFERENCES student(student_id) ON DELETE CASCADE,
    faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    reservation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMPTZ NOT NULL,
    reservation_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_reservation_status CHECK (reservation_status IN ('PENDING', 'FULFILLED', 'EXPIRED', 'CANCELLED'))
);

-- ------------------------------------------------------------------------------
-- 6. Issue & Return
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_issue (
    issue_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES book_item(item_id) ON DELETE RESTRICT,
    student_id BIGINT REFERENCES student(student_id) ON DELETE RESTRICT,
    faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE RESTRICT,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL,
    issued_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS book_return (
    return_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id BIGINT UNIQUE NOT NULL REFERENCES book_issue(issue_id) ON DELETE RESTRICT,
    return_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_by VARCHAR(100) NOT NULL,
    condition_on_return VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    overdue_days INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Fine
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS library_fine (
    library_fine_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES book_issue(issue_id) ON DELETE RESTRICT,
    student_id BIGINT REFERENCES student(student_id) ON DELETE RESTRICT,
    fine_amount NUMERIC(8,2) NOT NULL,
    days_overdue INTEGER NOT NULL DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_date TIMESTAMPTZ,
    receipt_reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
