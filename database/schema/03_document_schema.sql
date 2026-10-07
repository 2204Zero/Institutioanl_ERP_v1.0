-- ==============================================================================
-- Institutional ERP v1.0 - Database Schema
-- Day 04: Student Documents Module
-- Target: PostgreSQL / ANSI SQL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS student_documents (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- AADHAAR, TRANSFER_CERTIFICATE, MIGRATION, MARKSHEET, PHOTOGRAPH
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents (student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type ON student_documents (document_type);
