BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V25_backup_restore.sql
-- Description  : Production DBA Roles, Grants, Maintenance & Backup/Restore Architecture
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Dedicated Production Database Roles
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edupulse_app_user') THEN
        CREATE ROLE edupulse_app_user WITH LOGIN PASSWORD 'EduPulse_App_Secure_Pass#2026' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edupulse_readonly') THEN
        CREATE ROLE edupulse_readonly WITH LOGIN PASSWORD 'EduPulse_ReadOnly_Pass#2026' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edupulse_backup_operator') THEN
        CREATE ROLE edupulse_backup_operator WITH LOGIN PASSWORD 'EduPulse_Backup_Pass#2026' NOSUPERUSER NOCREATEDB NOCREATEROLE REPLICATION;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Schema Grants & Least-Privilege Access Control
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO edupulse_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO edupulse_app_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO edupulse_app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO edupulse_app_user;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO edupulse_app_user;

GRANT USAGE ON SCHEMA public TO edupulse_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO edupulse_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO edupulse_readonly;

-- Enforce Default Privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edupulse_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO edupulse_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO edupulse_readonly;

-- ------------------------------------------------------------------------------
-- 3. Production Database Health & Activity Monitoring Views
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_db_connection_activity AS
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    xact_start,
    query_start,
    state,
    wait_event_type,
    wait_event,
    SUBSTRING(query FROM 1 FOR 100) AS current_query_snippet
FROM pg_stat_activity
WHERE datname = current_database();

CREATE OR REPLACE VIEW v_db_table_sizes AS
SELECT 
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    pg_size_pretty(pg_relation_size(relid)) AS table_size,
    pg_size_pretty(pg_indexes_size(relid)) AS index_size,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

CREATE OR REPLACE VIEW v_db_index_usage_efficiency AS
SELECT 
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ------------------------------------------------------------------------------
-- 4. Automated Database Maintenance Routine Procedure
-- ------------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_run_database_maintenance()
AS $$
BEGIN
    -- Refresh Materialized Views for Analytics
    REFRESH MATERIALIZED VIEW mv_student_enrollment_stats;
    REFRESH MATERIALIZED VIEW mv_revenue_collection_summary;
    REFRESH MATERIALIZED VIEW mv_department_academic_performance;

    -- Update query planner optimizer statistics
    ANALYZE;

    -- Clean expired user sessions
    UPDATE session_table
    SET is_terminated = TRUE
    WHERE session_expires_at < CURRENT_TIMESTAMP AND is_terminated = FALSE;

    -- Purge old test results older than 30 days
    DELETE FROM test_suite_results
    WHERE executed_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 5. Production Backup & Recovery Command Definitions (Meta Schema)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS db_backup_configuration (
    config_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    backup_type VARCHAR(30) NOT NULL,
    recommended_command TEXT NOT NULL,
    restore_command TEXT NOT NULL,
    frequency_schedule VARCHAR(50) NOT NULL,
    retention_days INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'DBA',
    updated_by VARCHAR(100) DEFAULT 'DBA',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

INSERT INTO db_backup_configuration (backup_type, frequency_schedule, recommended_command, restore_command)
VALUES (
    'FULL_PHYSICAL_DUMP',
    'DAILY_AT_MIDNIGHT',
    'pg_dump -h localhost -p 5432 -U edupulse_backup_operator -d edupulse_erp -F c -b -v -f /backups/edupulse_erp_full_$(date +%Y%m%d_%H%M%S).dump',
    'pg_restore -h localhost -p 5432 -U edupulse_admin -d edupulse_erp -v --clean --if-exists /backups/edupulse_erp_full.dump'
);

INSERT INTO db_backup_configuration (backup_type, frequency_schedule, recommended_command, restore_command)
VALUES (
    'SCHEMA_ONLY_DUMP',
    'ON_EACH_RELEASE',
    'pg_dump -h localhost -p 5432 -U edupulse_backup_operator -d edupulse_erp --schema-only -F p -f /backups/edupulse_erp_schema_$(date +%Y%m%d).sql',
    'psql -h localhost -p 5432 -U edupulse_admin -d edupulse_erp -f /backups/edupulse_erp_schema.sql'
);

INSERT INTO db_backup_configuration (backup_type, frequency_schedule, recommended_command, restore_command)
VALUES (
    'DATA_ONLY_PARALLEL_DUMP',
    'WEEKLY_SUNDAY_0200',
    'pg_dump -h localhost -p 5432 -U edupulse_backup_operator -d edupulse_erp --data-only -F d -j 4 -f /backups/edupulse_erp_data_dir',
    'pg_restore -h localhost -p 5432 -U edupulse_admin -d edupulse_erp -j 4 --data-only /backups/edupulse_erp_data_dir'
);

COMMIT;
