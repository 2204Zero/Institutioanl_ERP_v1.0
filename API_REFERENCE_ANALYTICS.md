# Enterprise Analytics & AI REST API Reference (Phase 11)

## 1. Overview
The Phase 11 REST APIs provide endpoints for fetching global KPIs, domain metrics, running ML risk inferences, querying the natural language engine, and managing scheduled reports.

---

## 2. API Endpoints Summary

### A. Global & Role Analytics
- `GET /api/v1/analytics/kpis`
  - Returns global institutional KPIs (`totalStudents`, `annualRevenue`, `placementPercentage`, etc.).
- `GET /api/v1/analytics/domains/{domainName}`
  - Parameters: `domainName` = `student` | `finance` | `faculty` | `library` | `hostel` | `transport` | `exam` | `hr`.
  - Returns domain-specific metrics and chart datasets.

### B. Machine Learning & Predictive AI
- `GET /api/v1/ai/predictions`
  - Returns active ML risk predictions and confidence scores.
- `GET /api/v1/ai/models/metrics`
  - Returns model accuracy, precision, recall, and F1 scores (`Random Forest`, `XGBoost`, `Isolation Forest`).

### C. Natural Language BI Engine
- `POST /api/v1/analytics/nl-search`
  - Request Body: `{ "query": "Show high dropout risk students in Mechanical Engg" }`
  - Response Body: Extracted intent, summary, generated insights, and suggested chart data points.

### D. Scheduled Reports
- `GET /api/v1/analytics/reports`
  - Lists scheduled automated reports.
- `POST /api/v1/analytics/reports/export`
  - Request Body: `{ "format": "PDF" | "EXCEL" | "CSV", "module": "Finance" }`
