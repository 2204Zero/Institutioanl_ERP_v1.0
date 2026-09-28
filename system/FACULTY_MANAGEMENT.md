# Institutional ERP Suite — Faculty Management & Workload Optimization

## 1. System Context
The Faculty Management Module (`src/pages/HRPage.tsx`, `src/types/lmsTypes.ts`) optimizes teaching allocations, research output tracking, and administrative duties.

---

## 2. UGC / AICTE Workload Norms & Calculation

### 2.1 Prescribed Weekly Direct Contact Hours
- **Professor / HOD**: 14 Hours / week
- **Associate Professor**: 14 Hours / week
- **Assistant Professor**: 16 Hours / week

### 2.2 Workload Index Calculation Engine
$$\text{Total Workload Index} = L + (1.0 \times T) + (0.5 \times P) + (1.5 \times R)$$

Where:
- $L$: Weekly Lecture Hours
- $T$: Weekly Tutorial Hours
- $P$: Weekly Practical / Lab Hours
- $R$: Research Supervision & Administrative Load (Ph.D. guidance, Deanship)

---

## 3. Data Schema Specs

```typescript
export interface FacultyWorkload {
  id: string;
  facultyId: string;
  facultyName: string;
  department: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor';
  assignedCourses: {
    courseCode: string;
    courseName: string;
    section: string;
    lectureHours: number;
    labHours: number;
  }[];
  totalDirectHours: number;
  maxPermissibleHours: number;
  workloadStatus: 'UNDERLOADED' | 'OPTIMAL' | 'OVERLOADED';
}
```

---

## 4. UI Capabilities & Security Audit
- Rendered in `HRPage.tsx` and `LMSPage.tsx`.
- Visual progress bar indicates workload percentage. Overload warnings generated if direct contact hours exceed 18 hours/week.
- Audit logging tracks faculty re-assignments and leave approvals.
