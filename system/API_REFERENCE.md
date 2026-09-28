# Institutional ERP Suite — Phase 5 Academic & LMS REST API Reference

## 1. Overview & Authentication Standard
All REST APIs in Phase 5 follow enterprise standards:
- Base URL: `https://api.erp.institution.edu/api/v1`
- Authorization Header: `Authorization: Bearer <JWT_TOKEN>`
- Content Type: `application/json`

---

## 2. API Endpoints Catalog

### 2.1 Learning Management System (`/lms`)

#### `GET /api/v1/lms/materials`
Fetch learning materials catalog.
- **Query Params**: `courseCode` (optional), `category` (optional)
- **Response `200 OK`**:
```json
[
  {
    "id": "mat-1",
    "courseCode": "CS-501",
    "courseName": "Database Systems",
    "title": "Module 3: Indexing & B-Trees",
    "category": "LECTURE_SLIDES",
    "fileUrl": "/docs/cs501_mod3.pdf",
    "fileSize": "4.2 MB",
    "uploadedBy": "Dr. Sunita Rao",
    "uploadedDate": "2026-09-24",
    "downloadsCount": 142
  }
]
```

#### `POST /api/v1/lms/materials/upload`
Upload a new course resource.
- **Role Required**: Faculty, Admin
- **Request Body**:
```json
{
  "courseCode": "CS-501",
  "title": "Lab Manual 4",
  "category": "LAB_MANUAL",
  "fileUrl": "https://storage.nits.edu/materials/lab4.pdf"
}
```

#### `GET /api/v1/lms/discussions`
List discussion forum threads.
- **Query Params**: `courseCode` (required)
- **Response `200 OK`**:
```json
[
  {
    "id": "disc-1",
    "courseCode": "CS-501",
    "title": "Clarification on B+ Tree node splitting algorithm",
    "authorName": "Aarav Sharma",
    "authorRole": "Student",
    "createdAt": "2 hours ago",
    "content": "When splitting an internal node in a B+ tree of order 4, does the median key promote to parent or stay in leaf?",
    "repliesCount": 4,
    "upvotes": 12,
    "isAnswered": true,
    "tags": ["BTree", "Indexing", "Lab3"]
  }
]
```

#### `POST /api/v1/lms/discussions`
Post a thread or reply.

#### `GET /api/v1/lms/quizzes`
Fetch active quizzes for enrolled courses.

#### `POST /api/v1/lms/classroom/book`
Submit a classroom or seminar hall reservation.

---

### 2.2 Timetable & Scheduling (`/timetable`)

#### `GET /api/v1/timetable/master`
Fetch entire institutional timetable matrix.

#### `POST /api/v1/timetable/slots`
Schedule a new lecture or lab session.
- **Response `409 Conflict`**: Returned if room or faculty has double-booking collision.

---

### 2.3 Attendance System (`/attendance`)

#### `GET /api/v1/attendance/summary/{studentId}`
Fetch course-wise attendance summary for a student.

#### `POST /api/v1/attendance/mark`
Bulk mark attendance for a session section.
