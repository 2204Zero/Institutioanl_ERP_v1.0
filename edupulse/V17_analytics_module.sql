BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V17_analytics_module.sql
-- Description  : Executive Analytics, KPIs, Materialized Views, Dashboards & Charts
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Analytics Dashboard Registry
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_dashboard (
    dashboard_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dashboard_code VARCHAR(50) UNIQUE NOT NULL,
    dashboard_title VARCHAR(150) NOT NULL,
    target_role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    grid_layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. KPIs & Metrics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_definition (
    kpi_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kpi_code VARCHAR(50) UNIQUE NOT NULL,
    kpi_name VARCHAR(150) NOT NULL,
    kpi_category VARCHAR(50) NOT NULL,
    target_value NUMERIC(14,2) NOT NULL,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'COUNT',
    calculation_sql TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_kpi_cat CHECK (kpi_category IN ('ACADEMIC', 'FINANCIAL', 'ADMISSION', 'ATTENDANCE', 'HR', 'FACILITY'))
);

CREATE TABLE IF NOT EXISTS kpi_snapshot (
    snapshot_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    kpi_id BIGINT NOT NULL REFERENCES kpi_definition(kpi_id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_value NUMERIC(14,2) NOT NULL,
    variance_percentage NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_kpi_snapshot_date UNIQUE (kpi_id, snapshot_date)
);

-- ------------------------------------------------------------------------------
-- 3. Reports & Schedules
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_report (
    report_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_code VARCHAR(50) UNIQUE NOT NULL,
    report_title VARCHAR(150) NOT NULL,
    report_category VARCHAR(50) NOT NULL,
    base_query TEXT NOT NULL,
    default_parameters JSONB,
    export_formats VARCHAR(50) NOT NULL DEFAULT 'PDF,CSV,XLSX',
    schedule_cron VARCHAR(50),
    last_generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 4. Charts & Visualization Widgets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_chart (
    chart_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dashboard_id BIGINT NOT NULL REFERENCES analytics_dashboard(dashboard_id) ON DELETE CASCADE,
    chart_title VARCHAR(150) NOT NULL,
    chart_type VARCHAR(30) NOT NULL,
    data_endpoint VARCHAR(250) NOT NULL,
    color_palette VARCHAR(50) DEFAULT 'EMERALD_INDIGO',
    refresh_rate_seconds INTEGER NOT NULL DEFAULT 300,
    width_units INTEGER NOT NULL DEFAULT 6,
    height_units INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_chart_type CHECK (chart_type IN ('LINE', 'BAR', 'DONUT', 'AREA', 'RADAR', 'HEATMAP', 'GAUGE', 'METRIC_CARD'))
);

-- ------------------------------------------------------------------------------
-- 5. Statistics Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_statistics (
    stat_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    domain VARCHAR(50) NOT NULL,
    stat_key VARCHAR(100) NOT NULL,
    stat_numeric_val NUMERIC(16,4),
    stat_text_val TEXT,
    stat_json_val JSONB,
    gathered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 6. Materialized Views for High-Speed Analytics
-- ------------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_student_enrollment_stats AS
SELECT 
    d.department_name,
    p.program_code,
    p.program_name,
    s.batch_year AS admission_year,
    COUNT(s.student_id) AS total_enrolled,
    COUNT(CASE WHEN sp.gender = 'MALE' THEN 1 END) AS male_count,
    COUNT(CASE WHEN sp.gender = 'FEMALE' THEN 1 END) AS female_count,
    COUNT(CASE WHEN s.enrollment_status = 'ACTIVE' THEN 1 END) AS active_count
FROM student s
JOIN application a ON s.application_id = a.application_id
JOIN academic_program p ON a.program_id = p.program_id
JOIN department d ON p.department_id = d.department_id
LEFT JOIN student_profile sp ON s.student_id = sp.student_id
WHERE s.is_active = TRUE
GROUP BY d.department_name, p.program_code, p.program_name, s.batch_year
WITH DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_collection_summary AS
SELECT 
    i.issue_date,
    COALESCE(SUM(i.net_payable_amount), 0.00) AS total_invoiced,
    COALESCE(SUM(i.paid_amount), 0.00) AS total_collected,
    COALESCE(SUM(i.net_payable_amount - i.paid_amount), 0.00) AS total_outstanding,
    COUNT(i.invoice_id) AS total_invoices_issued
FROM invoice i
WHERE i.is_active = TRUE
GROUP BY i.issue_date
WITH DATA;

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_department_academic_performance AS
SELECT 
    d.department_code,
    d.department_name,
    c.course_code,
    c.course_title,
    ROUND(AVG(r.total_marks_obtained), 2) AS average_score,
    ROUND(AVG(r.grade_point), 2) AS average_gpa,
    COUNT(r.result_id) AS total_examinees,
    COUNT(CASE WHEN r.is_passed = TRUE THEN 1 END) AS passed_count,
    ROUND((COUNT(CASE WHEN r.is_passed = TRUE THEN 1 END)::NUMERIC / NULLIF(COUNT(r.result_id), 0)) * 100, 2) AS pass_percentage
FROM department d
JOIN course c ON d.department_id = c.department_id
JOIN course_offering co ON c.course_id = co.course_id
JOIN result r ON co.offering_id = r.offering_id
GROUP BY d.department_code, d.department_name, c.course_code, c.course_title
WITH DATA;

COMMIT;
