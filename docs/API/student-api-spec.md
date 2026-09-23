# Institutional ERP v1.0 — Student & Guardian REST API Specifications

> **Base URL**: `http://localhost:8080`  
> **Swagger UI**: `http://localhost:8080/swagger-ui.html`  
> **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

---

## 1. Student Profile APIs (Day 02)

### 1.1 Create Student Profile
- **Endpoint**: `POST /api/v1/students`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "rollNumber": "2024-CSE-001",
    "firstName": "Aarav",
    "lastName": "Sharma",
    "email": "aarav.sharma@college.edu",
    "phone": "+919876543210",
    "dateOfBirth": "2004-06-15",
    "gender": "MALE",
    "bloodGroup": "O+",
    "address": "Flat 402, Sunshine Heights",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "department": "Computer Science and Engineering",
    "program": "B.Tech CSE",
    "batch": "2024-2028",
    "enrollmentDate": "2024-08-01",
    "status": "ACTIVE"
  }
  ```
- **Responses**:
  - `201 Created`: Student created successfully.
  - `400 Bad Request`: Validation failure on input fields.
  - `409 Conflict`: Roll number or email already in use.

### 1.2 List Students (Paginated & Filtered)
- **Endpoint**: `GET /api/v1/students`
- **Query Parameters**:
  - `page` (int, default: 0)
  - `size` (int, default: 10)
  - `search` (string, optional - searches name, roll number, email)
  - `status` (string, optional: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `GRADUATED`, `ALUMNI`)
  - `department` (string, optional)
  - `sortBy` (string, default: `id`)
  - `sortDir` (string, default: `desc`)
- **Response**:
  - `200 OK`: Paginated list of student profiles.

### 1.3 View Student by ID
- **Endpoint**: `GET /api/v1/students/{id}`
- **Response**:
  - `200 OK`: Complete student profile with linked guardians and documents.
  - `404 Not Found`: Student ID does not exist.

### 1.4 Update Student
- **Endpoint**: `PUT /api/v1/students/{id}`
- **Response**:
  - `200 OK`: Updated student profile.
  - `400 Bad Request`: Validation failure.
  - `404 Not Found`: Student ID does not exist.

### 1.5 Delete Student
- **Endpoint**: `DELETE /api/v1/students/{id}`
- **Response**:
  - `200 OK`: Deletion confirmed. Cascades to guardians and documents.
  - `404 Not Found`: Student not found.

---

## 2. Guardian Management APIs (Day 03)

### 2.1 Get All Guardians
- **Endpoint**: `GET /guardians` (or `GET /api/v1/guardians`)
- **Response**:
  - `200 OK`: List of all registered guardians.

### 2.2 Create Guardian
- **Endpoint**: `POST /guardians` (or `POST /api/v1/guardians`)
- **Request Body**:
  ```json
  {
    "studentId": 1,
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "relation": "FATHER",
    "phone": "+919811223344",
    "email": "rajesh.sharma@example.com",
    "occupation": "Senior Software Architect",
    "address": "Flat 402, Sunshine Heights, New Delhi",
    "isEmergencyContact": true
  }
  ```
- **Response**: `201 Created`

### 2.3 Edit Guardian
- **Endpoint**: `PUT /guardians/{id}`
- **Response**: `200 OK`

### 2.4 Delete Guardian
- **Endpoint**: `DELETE /guardians/{id}`
- **Response**: `200 OK`

### 2.5 Get Guardians for Student
- **Endpoint**: `GET /api/v1/students/{studentId}/guardians`
- **Response**: `200 OK`

### 2.6 Add and Link Guardian to Student
- **Endpoint**: `POST /api/v1/students/{studentId}/guardians`
- **Response**: `201 Created`

---

## 3. Student Documents APIs (Day 04)

### 3.1 Upload Document
- **Endpoint**: `POST /api/v1/students/{studentId}/documents`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `documentType`: `AADHAAR` | `TRANSFER_CERTIFICATE` | `MIGRATION` | `MARKSHEET` | `PHOTOGRAPH`
  - `file`: Binary file (PDF, JPG, PNG - max 10MB)
- **Response**:
  - `201 Created`: Document uploaded and metadata saved.
  - `413 Payload Too Large`: File exceeds 10MB limit.

### 3.2 List Student Documents
- **Endpoint**: `GET /api/v1/students/{studentId}/documents`
- **Response**: `200 OK`

### 3.3 View Document (Inline Preview)
- **Endpoint**: `GET /api/v1/documents/{id}/view`
- **Header**: `Content-Disposition: inline; filename="..."`
- **Response**: `200 OK` (Streams file for browser rendering)

### 3.4 Download Document
- **Endpoint**: `GET /api/v1/documents/{id}/download`
- **Header**: `Content-Disposition: attachment; filename="..."`
- **Response**: `200 OK` (Downloads file)

### 3.5 Delete Document
- **Endpoint**: `DELETE /api/v1/documents/{id}`
- **Response**: `200 OK` (Removes file from disk and deletes database record)

---

## 4. Student Status APIs (Day 05)

### 4.1 Update Student Status
- **Endpoint**: `PATCH /api/v1/students/{id}/status`
- **Request Body**:
  ```json
  {
    "status": "SUSPENDED",
    "reason": "Attendance shortage below 60% requirement in Semester 3",
    "changedBy": "dean_academics"
  }
  ```
- **Response**:
  - `200 OK`: Status updated and change recorded in `student_status_history`.

### 4.2 View Status Audit History
- **Endpoint**: `GET /api/v1/students/{id}/status-history`
- **Response**:
  - `200 OK`: Chronological list of status changes with timestamps, reasons, and actors.
