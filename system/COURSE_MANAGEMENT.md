# Institutional ERP Suite — Course Catalog & Curriculum Management

## 1. Overview & Educational Framework
The Course Catalog & Curriculum Management Module supports multi-disciplinary curricula, Choice-Based Credit Systems (CBCS), and the National Education Policy (NEP 2020) framework.

It handles course definitions, prerequisite networks, core/elective credit mapping, laboratory vs theory allocation, and department course offerings.

---

## 2. NEP 2020 & CBCS Structure Support

### 2.1 Credit & Category Classification
- **Major Core (CC)**: Compulsory subject credits specific to the degree branch.
- **Minor Elective (ME)**: Inter-departmental specialization courses.
- **Skill Enhancement Courses (SEC)**: Hands-on technical and soft skill modules.
- **Ability Enhancement Courses (AEC)**: Language, communication, and ethics courses.
- **Value Added Courses (VAC)**: Environmental science, Indian Knowledge Systems (IKS), digital literacy.
- **Research / Capstone Project**: Senior year credit thesis/dissertation allocations.

---

## 3. Technical Schema & Types

```typescript
export type CourseType = 'THEORY' | 'LABORATORY' | 'SEMINAR' | 'PROJECT' | 'STUDIO';

export interface Course {
  id: string;
  code: string; // e.g., 'CS-501'
  title: string; // e.g., 'Database Management Systems'
  departmentId: string;
  lectureHours: number; // L
  tutorialHours: number; // T
  practicalHours: number; // P
  credits: number; // L + T + (P/2)
  type: CourseType;
  category: 'CORE' | 'ELECTIVE' | 'OPEN_ELECTIVE' | 'SKILL' | 'VALUE_ADDED';
  prerequisites: string[]; // Course IDs
  syllabusUrl?: string;
  isActive: boolean;
}

export interface CurriculumSchema {
  id: string;
  degreeProgramId: string; // e.g., 'B.Tech CS'
  academicYear: string;
  totalCreditsRequired: number;
  semesterWiseCourses: {
    semesterNumber: number;
    courseIds: string[];
    minElectivesToChoose: number;
  }[];
}
```

---

## 4. API Specification & Prerequisite Enforcement

### 4.1 Prerequisites Validation Algorithm
When a student attempts course registration, the system runs an automated validation pipeline:
1. Verify if all prerequisite course IDs are present in the student's completed grade history with a passing grade ($\ge D$).
2. Check for credit overload ($\text{Total Registered Credits} \le \text{Max Allowed Credits (26)}$).
3. Check slot conflict with already selected courses.

### 4.2 Endpoint Table

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/courses` | List all courses with filtering by dept/category |
| `POST` | `/api/v1/courses` | Create a new course entry in catalog |
| `GET` | `/api/v1/courses/{id}/prerequisites` | Fetch prerequisite tree for a course |
| `POST` | `/api/v1/curriculum/validate-selection` | Validate student course basket selection |

---

## 5. UI Component Architecture
- Integrated in `src/pages/SISPage.tsx` and `src/pages/LMSPage.tsx`.
- Uses `Badge` component for credit tags (`purple` for Major, `info` for Electives, `success` for Labs).
