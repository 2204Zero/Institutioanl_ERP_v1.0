# Enterprise Analytics & BI System Architecture (Phase 11)

## 1. Executive Vision & Topology
The Enterprise Analytics, Business Intelligence & Artificial Intelligence Platform (`src/types/analyticsTypes.ts`, `src/services/analyticsService.ts`, `src/components/analytics/EnterpriseChartEngine.tsx`, `src/pages/AnalyticsPage.tsx`) brings Power BI and Tableau level BI reporting and predictive machine learning to the Institutional ERP Suite.

It unifies multi-role dashboards, domain analytics (Student, Faculty, Finance, Library, Hostel, Transport, Examination, HRMS), predictive ML risk modeling (dropout, low attendance, fee default), natural language conversational search, and automated PDF/Excel/CSV scheduled report generation.

---

## 2. System Architecture & Data Pipeline Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          Multi-Role User Dashboard Interfaces                          │
│     (Student, Teacher, Parent, Dept Head, Principal, Finance, HR, Library, Transport)  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Phase 11 Analytics & AI Engine Service                          │
│                            (src/services/analyticsService.ts)                          │
└──────────────┬────────────────────────────┬─────────────────────────────┬──────────────┘
               │                            │                             │
               ▼                            ▼                             ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐ ┌──────────────────────┐
│  Domain Analytics Engine     │ │  ML Predictive Risk Models  │ │  Natural Language BI │
│ (Student, Finance, HR, etc.) │ │(RandomForest, XGBoost, etc) │ │   Conversational AI  │
└──────────────────────────────┘ └─────────────────────────────┘ └──────────────────────┘
```

---

## 3. Key Components
1. **Analytics Data Models** (`src/types/analyticsTypes.ts`): Typed schema definitions for global KPIs, role-specific metrics, domain datasets, ML models, NL search responses, and report schedules.
2. **Analytics Service Layer** (`src/services/analyticsService.ts`): Aggregates cross-module metrics, computes domain trends, runs ML risk inference simulations, and outputs Spring Boot format audit log lines (`logAnalyticsAction`).
3. **Enterprise Chart Engine** (`src/components/analytics/EnterpriseChartEngine.tsx`): Custom SVG/CSS chart engine supporting Bar, Line, Area, Donut, Pie, Gauge, and Data Table visualizations adhering to 8px spatial grid and WCAG AA standards.
4. **Natural Language BI Search Assistant** (`src/components/analytics/AISearchAssistant.tsx`): Conversational query interface interpreting user prompts and generating dynamic chart views with confidence metrics.
5. **Main BI Workspace** (`src/pages/AnalyticsPage.tsx`): Multi-tab workspace giving role-based access to Executive BI, Domain Intelligence, AI Predictive Hub, NL Search, and Scheduled Report Dispatcher.
