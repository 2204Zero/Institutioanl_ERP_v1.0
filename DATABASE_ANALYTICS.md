# PostgreSQL Analytics & BI Database Schema (Phase 11)

## 1. Relational Database Schema DDL

```sql
-- Analytics Aggregated Snapshots Table
CREATE TABLE analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_date DATE NOT NULL,
    domain VARCHAR(50) NOT NULL,
    metric_key VARCHAR(100) NOT NULL,
    metric_value NUMERIC(15, 2) NOT NULL,
    dimensions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_snapshots_date_domain ON analytics_snapshots(snapshot_date, domain);

-- Machine Learning Prediction Logs Table
CREATE TABLE ml_prediction_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id VARCHAR(50) NOT NULL,
    target_name VARCHAR(100) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL,
    feature_importance JSONB NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ml_prediction_logs_target ON ml_prediction_logs(target_id, prediction_type);

-- Scheduled Reports Table
CREATE TABLE scheduled_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    recipients TEXT[] NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_generated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Aggregation & Indexing Strategy
- **JSONB Dimensions**: Flexible indexing for arbitrary metadata filtering.
- **Partitioning**: Partitioning `analytics_snapshots` by `snapshot_date` for fast historical query range scans.
