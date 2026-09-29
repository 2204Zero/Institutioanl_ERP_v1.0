# Institutional ERP Suite — Academic Session & Lifecycle Management System

## 1. Overview & Architectural Vision
The Academic Session Management System forms the foundational operational engine of the Institutional ERP Suite. Designed to serve Tier-1 higher education institutions, multi-campus universities, and affiliated colleges, the module governs the temporal, operational, and administrative structure of an academic year.

It manages academic sessions, terms (semesters/trimesters/terms), registration windows, fee linkage, course offerings, and status transitions across the student lifecycle.

---

## 2. Core Operational Entities & Data Models

### 2.1 Academic Session Hierarchy
```
[ Academic Year ]  (e.g., 2026-2027)
       │
       ├──> [ Term / Semester ] (e.g., Autumn 2026 / Semester 5)
       │         │
       │         ├──> [ Academic Calendar Events ] (Holidays, Mid-Terms, Exams)
       │         ├──> [ Course Offerings & Sections ]
       │         └──> [ Course Registration Window ]
       │
       └──> [ Student Enrollment Statuses ]
```

### 2.2 Data Structure Definitions (TypeScript Specs)
```typescript
export interface AcademicSession {
  id: string;
  code: string; // e.g., 'AY2026-27'
  name: string; // 'Academic Year 2026-2027'
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'CONCLUDED' | 'ARCHIVED';
  terms: AcademicTerm[];
  createdTimestamp: string;
}

export interface AcademicTerm {
  id: string;
  sessionId: string;
  termNumber: number; // 1 to 10
  name: string; // 'Semester V - Autumn'
  type: 'SEMESTER' | 'TRIMESTER' | 'ANNUAL';
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  gradeSubmissionDeadline: string;
  status: 'DRAFT' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'EXAM_PERIOD' | 'CLOSED';
}
```

---

## 3. Lifecycle & State Machine

```
[ DRAFT ] ──> [ REGISTRATION_OPEN ] ──> [ IN_PROGRESS ] ──> [ EXAM_PERIOD ] ──> [ CLOSED ]
```

1. **DRAFT**: Admin sets up calendar dates, course catalogs, and faculty workloads.
2. **REGISTRATION_OPEN**: Students register for courses via CBCS/NEP credit rules. Automated prerequisite checks occur.
3. **IN_PROGRESS**: Classes run, attendance is captured, LMS course material is accessible.
4. **EXAM_PERIOD**: Admit cards generated, hall tickets locked based on minimum attendance threshold (75%).
5. **CLOSED**: Final marks finalized, transcripts compiled, session archived.

---

## 4. REST API Endpoints Specification

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/v1/academic/sessions` | Fetch all academic sessions | Student, Faculty, Admin |
| `POST` | `/api/v1/academic/sessions` | Create new academic session | SuperAdmin, Dean |
| `PUT` | `/api/v1/academic/sessions/{id}/activate` | Set active academic session | SuperAdmin, Dean |
| `POST` | `/api/v1/academic/terms` | Create term within session | Admin, Dean |
| `PUT` | `/api/v1/academic/terms/{id}/status` | Transition term status | Admin, Dean |

---

## 5. Security, RBAC & Audit Logging
- **Access Control**: Only users with `SuperAdmin` or `Dean` roles can transition session statuses or edit registration windows.
- **Audit Logging**: Every status transition executes `logBackendAction()` sending structured stdout logs for Spring Boot log aggregators:
  ```json
  {"timestamp":"2026-09-28T15:30:00Z","actor":"Dr. Rajesh Kumar","action":"ACTIVATED_SESSION","targetId":"AY2026-27","details":"Set Academic Year 2026-2027 as system active"}
  ```
