# Institutional ERP Suite — Assignment Management & Assessment System

## 1. Executive Summary & Capabilities
The Assignment Management System within LMS governs student coursework submission lifecycle, late penalties, grading rubrics, and automated plagiarism scoring integration.

---

## 2. Technical Data Schemas

```typescript
export interface Assignment {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  weightagePercentage: number; // e.g. 15% of final grade
  allowLateSubmissions: boolean;
  latePenaltyPerDayPercentage: number;
  attachments: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | 'GRADING_IN_PROGRESS';
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentRollNo: string;
  submittedAt: string;
  fileUrl: string;
  submissionText?: string;
  plagiarismScorePercentage?: number;
  obtainedPoints?: number;
  facultyFeedback?: string;
  status: 'SUBMITTED' | 'LATE_SUBMITTED' | 'GRADED' | 'RE_SUBMISSION_REQUESTED';
}
```

---

## 3. Submission Lifecycle & Grace Period Matrix

```
[ Published ] ──> [ Student Submits File ] ──> [ Plagiarism Scan (Turnitin/Ouriginal) ]
                                                            │
                                                            ▼
[ Faculty Grading & Feedback ] <── [ Plagiarism Report Generated ]
              │
              ▼
[ Grade Pushed to Gradebook Module ]
```

### 3.1 Automated Late Penalty Formula
$$\text{Effective Points} = \text{Raw Points} \times \left(1 - \frac{\text{Days Late} \times \text{Penalty \%}}{100}\right)$$

---

## 4. REST API Integration Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/assignments/course/{courseCode}` | Get all assignments for course |
| `POST` | `/api/v1/assignments` | Create assignment (Faculty) |
| `POST` | `/api/v1/assignments/{id}/submit` | Submit coursework file (Student) |
| `PUT` | `/api/v1/assignments/submissions/{subId}/grade` | Grade submission and record feedback |

---

## 5. UI Integration & Feedback Loop
- Integrated into `src/pages/LMSPage.tsx` under the **Assignments & Coursework** tab.
- Displays progress badges: `GRADED` (green), `PENDING` (amber), `OVERDUE` (red).
