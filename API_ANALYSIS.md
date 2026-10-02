# Institutional ERP System - API Integration Analysis

## Overview
The frontend architecture includes an `apiClient.ts` module configured with Axios interceptors, automatic bearer token injection, and response transformation. However, **the UI currently operates using in-memory mock data** provided by `mockData.ts` inside `ERPContext.tsx`.

---

## 1. Backend Controller Endpoint Mapping

### Authentication Controller (`AuthController.java`)
- `POST /api/v1/auth/login`: Authenticates user credentials, returns JWT tokens.
- `POST /api/v1/auth/refresh`: Refreshes access token using refresh token.
- `POST /api/v1/auth/logout`: Invalidates token session.
- `GET /api/v1/auth/me`: Fetches current logged-in user profile.

### Student Management Controller (`StudentController.java`)
- `GET /api/v1/students`: Paginated list of students.
- `POST /api/v1/students`: Enrolls a new student.
- `GET /api/v1/students/{id}`: Fetches detailed student profile.
- `PUT /api/v1/students/{id}`: Updates student information.
- `DELETE /api/v1/students/{id}`: Soft-deletes student record.

### Finance Controller (`FinanceController.java`)
- `GET /api/v1/finance/transactions`: Retrieves ledger transactions.
- `POST /api/v1/finance/collect-fee`: Processes fee collection payment.
- `POST /api/v1/finance/refunds`: Submits refund application.
- `GET /api/v1/finance/metrics`: Calculates summary metrics (Total Revenue, Pending Dues, Collection Rate).

---

## 2. Frontend-Backend Wiring Gap Table

| Frontend Component / Action | Current Behavior | Backend REST Endpoint | Integration Status |
| :--- | :--- | :--- | :---: |
| **Finance Ledger Table** | Reads `transactions` from `ERPContext` | `GET /api/v1/finance/transactions` | MOCK ONLY |
| **Collect Fee Modal** | Appends object to React state array | `POST /api/v1/finance/collect-fee` | MOCK ONLY |
| **Student Detail Modal** | Finds student in `initialStudents` array | `GET /api/v1/students/{id}` | MOCK ONLY |
| **Refund Request Modal** | Triggers toast alert | `POST /api/v1/finance/refunds` | MOCK ONLY |
| **Login Form** | Calls `authService.login()` (stubbed) | `POST /api/v1/auth/login` | UNCONNECTED |
| **Export CSV** | Client-side CSV generation | N/A (Client-side) | REAL |
