# Institutional ERP Suite — Academic Analytics & BI Reporting Engine

## 1. Executive Summary & BI Architecture
The Academic Analytics Dashboard (`src/pages/dashboards/DashboardDispatcher.tsx`, `src/pages/SISPage.tsx`) aggregates cross-domain data to deliver executive insights for Deans, HODs, and Vice-Chancellors.

It powers early warning systems for student dropout prevention, department performance comparisons, and NIRF/NAAC accreditation reports.

---

## 2. Key Analytics Engines & Metrics

```
[ ERP Data Streams ] ──> [ Analytics Aggregator ] ──> [ Recharts Data Visualization ]
 ├── Attendance Records                                  ├── Attendance Heatmaps
 ├── Exam Gradebook                                      ├── Grade Gaussian Distribution
 ├── Fee Payments                                        ├── Pass Rate Trends
 └── LMS Engagement                                      └── At-Risk Risk Radar
```

### 2.1 Early Warning Risk Model
A student is flagged as **AT-RISK** if any of the following conditions trigger:
1. Aggregate Attendance $< 75\%$.
2. Continuous Evaluation Grade $< 5.0$ CGPA.
3. Fee payment overdue $> 30$ days.
4. Zero LMS downloads/logins in the last 14 days.

---

## 3. Accreditation Data Aggregation (NAAC / NIRF Standards)
- **NAAC Criterion 2**: Teaching-Learning & Evaluation (Calculates Student-Teacher Ratio, Pass Percentage, Dropouts).
- **NIRF Metric**: Graduation Outcome (GPH & GUE) calculations.
- **Data Export**: Support for instant JSON/CSV export formatted for official portal submissions.
