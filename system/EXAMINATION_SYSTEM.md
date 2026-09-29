# Institutional ERP Suite — Examination & Gradebook Management System

## 1. Overview & Regulatory Mandate
The Examination & Gradebook System (`src/pages/GradebookPage.tsx`) manages continuous internal evaluation (CIE), semester end examinations (SEE), relative/absolute grading curves, transcript generation, and SGPA/CGPA calculations.

---

## 2. Grading Scale & CGPA Computation Framework

### 2.1 Standard 10-Point Absolute/Relative Grading Scale
| Grade Letter | Grade Point | Marks Range (Absolute) | Qualitative Description |
|---|---|---|---|
| **O** | 10.0 | $\ge 90\%$ | Outstanding |
| **A+** | 9.0 | $80\% - 89\%$ | Excellent |
| **A** | 8.0 | $70\% - 79\%$ | Very Good |
| **B+** | 7.0 | $60\% - 69\%$ | Good |
| **B** | 6.0 | $55\% - 59\%$ | Above Average |
| **C** | 5.0 | $50\% - 54\%$ | Average |
| **P** | 4.0 | $40\% - 49\%$ | Pass |
| **F** | 0.0 | $< 40\%$ | Fail / Re-appear |

### 2.2 SGPA & CGPA Calculation Formulas

$$\text{SGPA} = \frac{\sum_{i=1}^{n} (C_i \times G_i)}{\sum_{i=1}^{n} C_i}$$

$$\text{CGPA} = \frac{\sum_{j=1}^{m} (\text{SGPA}_j \times \text{Total Semester Credits}_j)}{\sum_{j=1}^{m} \text{Total Semester Credits}_j}$$

Where:
- $C_i$: Course Credits for course $i$
- $G_i$: Grade Points secured in course $i$

---

## 3. Data Schema Specifications

```typescript
export interface StudentExamMark {
  id: string;
  studentRollNo: string;
  studentName: string;
  courseCode: string;
  internalMarks: number;  // Max 40
  externalMarks: number;  // Max 60
  totalMarks: number;     // Internal + External
  gradeLetter: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  gradePoint: number;
  status: 'PASSED' | 'FAILED' | 'ABSENT' | 'MALPRACTICE';
}
```

---

## 4. Hall Ticket & Moderation Rules
1. **Hall Ticket Generation Requirement**: Student must have $\ge 75\%$ aggregate attendance AND no outstanding fee dues.
2. **Moderation Committee Audit**: Final marks locked by Examination Controller. Amendments require 3-tier approval (HOD $\rightarrow$ Dean $\rightarrow$ Controller of Exams).
3. **Audit Logging**: Every mark submission logs actor details to Spring Boot stdout logs.
