BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V16_document_module.sql
-- Description  : Enterprise Document Management, Versioning, Permissions, Workflows & Vault Archival
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Folder Hierarchy
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS folder (
    folder_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_folder_id BIGINT REFERENCES folder(folder_id) ON DELETE CASCADE,
    folder_name VARCHAR(150) NOT NULL,
    folder_path VARCHAR(500) NOT NULL,
    owner_user_id VARCHAR(100) NOT NULL,
    is_system_folder BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_folder_path UNIQUE (folder_path)
);

-- ------------------------------------------------------------------------------
-- 2. Document Master
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document (
    document_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folder_id BIGINT NOT NULL REFERENCES folder(folder_id) ON DELETE RESTRICT,
    document_uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    document_title VARCHAR(250) NOT NULL,
    document_code VARCHAR(100) UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    storage_bucket VARCHAR(100) NOT NULL DEFAULT 'edupulse-documents',
    storage_key VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    current_version INTEGER NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    locked_by VARCHAR(100),
    owner_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Document Version
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_version (
    version_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES document(document_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    change_summary TEXT,
    uploaded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_doc_version UNIQUE (document_id, version_number)
);

-- ------------------------------------------------------------------------------
-- 4. Document Upload Session
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_upload (
    upload_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_token VARCHAR(100) UNIQUE NOT NULL,
    original_file_name VARCHAR(250) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    target_folder_id BIGINT REFERENCES folder(folder_id) ON DELETE SET NULL,
    uploader_user_id VARCHAR(100) NOT NULL,
    upload_status VARCHAR(30) NOT NULL DEFAULT 'INITIATED',
    presigned_s3_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_upload_status CHECK (upload_status IN ('INITIATED', 'UPLOADING', 'COMPLETED', 'FAILED', 'EXPIRED'))
);

-- ------------------------------------------------------------------------------
-- 5. Permission & Access Control
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_permission (
    perm_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    folder_id BIGINT REFERENCES folder(folder_id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES document(document_id) ON DELETE CASCADE,
    role_name VARCHAR(50),
    user_id VARCHAR(100),
    can_read BOOLEAN NOT NULL DEFAULT TRUE,
    can_write BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    can_share BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. Document Sharing
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_sharing (
    share_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES document(document_id) ON DELETE CASCADE,
    shared_by_user_id VARCHAR(100) NOT NULL,
    shared_with_email VARCHAR(150),
    share_token VARCHAR(128) UNIQUE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    access_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 7. Document Approval Workflow
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_approval (
    approval_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES document(document_id) ON DELETE CASCADE,
    workflow_stage VARCHAR(50) NOT NULL,
    approver_role VARCHAR(50) NOT NULL,
    approver_user_id VARCHAR(100),
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    review_comments TEXT,
    action_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_doc_appr_status CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'))
);

-- ------------------------------------------------------------------------------
-- 8. Document Archive (Compliance Vault)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS document_archive (
    archive_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES document(document_id) ON DELETE RESTRICT,
    retention_period_years INTEGER NOT NULL DEFAULT 7,
    archived_reason TEXT NOT NULL,
    glacier_vault_id VARCHAR(150),
    purge_due_date DATE NOT NULL,
    is_purged BOOLEAN NOT NULL DEFAULT FALSE,
    purged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
