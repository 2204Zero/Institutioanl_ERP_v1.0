-- ==============================================================================
-- Institutional ERP v1.0 - Database Schema
-- Day 05: Student Status & Audit Module
-- Target: PostgreSQL / ANSI SQL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS student_status_history (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL, -- ACTIVE, INACTIVE, SUSPENDED, GRADUATED, ALUMNI
    reason VARCHAR(500),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_history_student_id ON student_status_history (student_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON student_status_history (changed_at);
