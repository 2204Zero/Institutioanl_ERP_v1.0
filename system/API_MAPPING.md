# Spring Boot REST API Endpoint Mapping

## 1. Authentication Endpoints
- `POST /api/v1/auth/login` – Authenticate user credentials & issue JWT tokens.
- `POST /api/v1/auth/roles/select` – Persist active workspace role selection.
- `POST /api/v1/auth/signup` – Register new user account.
- `POST /api/v1/auth/refresh` – Refresh expired JWT access token.

## 2. ERP Operations Endpoints
- `POST /api/v1/finance/fee/collect` – Collect student tuition fee & generate receipt.
- `GET /api/v1/admissions/applications` – Retrieve admissions intake roster.
- `GET /api/v1/sis/students` – Fetch student directory & transcript data.
- `POST /api/v1/timetable/audit-conflicts` – Execute automated schedule conflict check.
- `POST /api/v1/attendance/biometric/sync` – Sync biometric gate scanner logs.
- `POST /api/v1/gradebook/results/publish` – Publish semester examination results.
- `POST /api/v1/hr/payroll/disburse` – Disburse monthly faculty payroll direct deposit.
- `POST /api/v1/library/books/{id}/issue` – Issue library volume to student.
- `POST /api/v1/hostel/rooms/{id}/allocate` – Allocate hostel bed.
- `POST /api/v1/transport/passes/issue` – Issue digital QR bus pass.
- `PUT /api/v1/auth/users/{id}/lock` – Toggle user RBAC access lock.
- `POST /api/v1/org/departments` – Create new academic department.
