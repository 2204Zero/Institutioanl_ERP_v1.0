BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V15_notification_module.sql
-- Description  : Enterprise Notification Engine, Templates, Queues, Multi-Channel Delivery Logs
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Notification Type & Template
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_type (
    type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    default_channel VARCHAR(30) NOT NULL DEFAULT 'EMAIL',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_notif_channel CHECK (default_channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WHATSAPP'))
);

CREATE TABLE IF NOT EXISTS notification_template (
    template_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type_id BIGINT NOT NULL REFERENCES notification_type(type_id) ON DELETE RESTRICT,
    template_code VARCHAR(60) UNIQUE NOT NULL,
    template_title VARCHAR(150) NOT NULL,
    subject_template VARCHAR(250),
    body_template TEXT NOT NULL,
    required_variables JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Notification Dispatch Queue
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_queue (
    queue_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    template_id BIGINT REFERENCES notification_template(template_id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL,
    recipient_identifier VARCHAR(200) NOT NULL,
    payload_json JSONB NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    queue_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_q_channel CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WHATSAPP')),
    CONSTRAINT chk_q_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_q_status CHECK (queue_status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'DEAD_LETTER'))
);

-- ------------------------------------------------------------------------------
-- 3. In-App Notification
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification (
    notification_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    recipient_user_id VARCHAR(100) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 4. Multi-Channel Delivery Logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_log (
    email_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue_id BIGINT REFERENCES notification_queue(queue_id) ON DELETE SET NULL,
    sender_email VARCHAR(150) NOT NULL DEFAULT 'noreply@edupulse.edu',
    recipient_email VARCHAR(150) NOT NULL,
    subject VARCHAR(250) NOT NULL,
    body_snippet VARCHAR(500),
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    smtp_message_id VARCHAR(150),
    delivery_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sms_log (
    sms_log_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue_id BIGINT REFERENCES notification_queue(queue_id) ON DELETE SET NULL,
    mobile_number VARCHAR(25) NOT NULL,
    sms_text VARCHAR(500) NOT NULL,
    gateway_name VARCHAR(50) NOT NULL DEFAULT 'TWILIO',
    gateway_message_id VARCHAR(100),
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'DELIVERED',
    cost_amount NUMERIC(6,4) DEFAULT 0.0000,
    sent_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS push_notification (
    push_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue_id BIGINT REFERENCES notification_queue(queue_id) ON DELETE SET NULL,
    device_token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL DEFAULT 'FCM',
    payload_content JSONB NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    sent_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_push_platform CHECK (platform IN ('FCM', 'APNS', 'WEB_PUSH'))
);

-- ------------------------------------------------------------------------------
-- 5. Notification Delivery Audit
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_audit (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    queue_id BIGINT REFERENCES notification_queue(queue_id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    dispatch_latency_ms INTEGER NOT NULL DEFAULT 0,
    http_status_code INTEGER,
    response_payload TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

COMMIT;
