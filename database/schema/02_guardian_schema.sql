-- ==============================================================================
-- Institutional ERP v1.0 - Database Schema
-- Day 03: Guardian Management Module
-- Target: PostgreSQL / ANSI SQL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS guardians (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL, -- FATHER, MOTHER, LEGAL_GUARDIAN, OTHER
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    occupation VARCHAR(100),
    address VARCHAR(255),
    is_emergency_contact BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guardians_student_id ON guardians (student_id);
CREATE INDEX IF NOT EXISTS idx_guardians_phone ON guardians (phone);
