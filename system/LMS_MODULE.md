# Institutional ERP Suite — Learning Management System (LMS) Architecture

## 1. Overview & Core Features
The Learning Management System (`src/pages/LMSPage.tsx`, `src/services/lmsService.ts`, `src/types/lmsTypes.ts`) provides a unified, digital learning repository and collaborative academic environment.

It connects faculty, students, and course administrators for:
- Course material publishing (Lecture Slides, Syllabi, Code Notebooks, Video links).
- Interactive Q&A discussion forums with upvoting and accepted answers.
- Assignment submissions with plagiarism checking integration points.
- Online quizzes and self-assessment modules.

---

## 2. LMS Architecture & State Management

```
[ Frontend: LMSPage.tsx ]
         │
         ├──> [ lmsService.ts ] (API Abstraction Layer)
         │          │
         │          ├──> GET  /api/v1/lms/materials
         │          ├──> POST /api/v1/lms/materials/upload
         │          ├──> GET  /api/v1/lms/discussions
         │          └──> POST /api/v1/lms/quizzes
         │
         └──> [ ERPContext / Spring Boot stdout Audit Log ]
```

---

## 3. Data Specs & Types (`src/types/lmsTypes.ts`)

```typescript
export interface LearningMaterial {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  category: 'LECTURE_SLIDES' | 'LAB_MANUAL' | 'REFERENCE_BOOK' | 'VIDEO' | 'SYLLABUS';
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  downloadsCount: number;
}

export interface DiscussionThread {
  id: string;
  courseCode: string;
  title: string;
  authorName: string;
  authorRole: 'Student' | 'Faculty' | 'TA';
  createdAt: string;
  content: string;
  repliesCount: number;
  upvotes: number;
  isAnswered: boolean;
  tags: string[];
}
```

---

## 4. Operational Workflows

### 4.1 Learning Material Ingestion
1. Faculty uploads resource file via `lmsService.uploadMaterial()`.
2. Metadata is indexed into the global course search repository.
3. Automated push notification delivered to all registered students in that course section.

### 4.2 Discussion Forum Q&A
1. Students publish queries tagged by week or topic.
2. Faculty and Teaching Assistants (TAs) post responses.
3. Faculty can mark a response as `isAnswered: true`, highlighting it as the verified resolution.

---

## 5. Security & File Storage Standards
- **File Upload Protection**: Restricts file extensions (`.pdf`, `.pptx`, `.ipynb`, `.zip`, `.docx`).
- **Virus & Malware Scanning**: Pre-upload validation hook integration.
- **Audit Logging**: Uploads, material downloads, and Q&A interactions dispatch structured logs:
  ```json
  {"actor":"2024CS108","action":"DOWNLOADED_LMS_MATERIAL","materialId":"mat-101","timestamp":"2026-09-28T15:00:00Z"}
  ```
