# Frontend–Backend Integration Architecture Documentation
**Institutional ERP Suite (Production Grade)**

---

## 1. Executive Summary

This document details the production-grade frontend–backend integration architecture connecting the **React 19 / TypeScript** frontend with the **Spring Boot REST API** microservices ecosystem. It is engineered to scale across **250+ enterprise ERP modules** with zero dead UI elements, strict token security, automatic token refreshing, typed DTO contracts, and resilient error recovery.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 FRONTEND LAYER                            │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │  UI Pages & Controls  │  │   React Form Engine  │  │ Context / Store   │  │
│  └───────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼────────────────────────┼───────────┘
               │                         │                        │
               ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATA & HOOKS LAYER                              │
│         useAuth()     useServerTable()     useFormValidation()               │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN SERVICES LAYER                              │
│   authService   studentService   dashboardService   notificationService     │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CENTRALIZED API CLIENT & HUB                          │
│                         src/services/apiClient.ts                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Request Interceptor: Attach JWT Bearer, Request ID, Correlation ID     │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │ Response Interceptor: 401 Silent Refresh Queue, HTTP Status Mapping   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────┬────────────────────────────────────┘
                                         │  HTTPS REST / JSON
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPRING BOOT BACKEND API                           │
│      Spring Security │ JWT AuthFilter │ PostgreSQL Enterprise Database       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Components

### 3.1 Centralized Axios Client (`src/services/apiClient.ts`)
- Configured with `baseURL` (`http://localhost:8080`), `timeout` (15,000 ms), and standard enterprise headers (`Content-Type: application/json`, `Accept: application/json`).
- Exposes typed helper methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`, and `getRawAxios()`.
- Wraps raw Spring DTO responses into standardized `APIResponse<T>` envelopes.

### 3.2 Request Interceptor (`src/interceptors/requestInterceptor.ts`)
- Automatically retrieves JWT access tokens from `tokenStorage` and sets `Authorization: Bearer <token>`.
- Generates unique audit tracing headers:
  - `X-Request-ID`: `req-{timestamp}-{hash}`
  - `X-Correlation-ID`: `corr-{timestamp}`
- Provides styled console logging in development mode (`VITE_APP_ENV === 'development'`).

### 3.3 Response Interceptor & Silent Token Refresh (`src/interceptors/responseInterceptor.ts`)
- **Success Mapping**: Logs and returns HTTP 200, 201, 204 responses.
- **401 Silent Refresh Queue**:
  1. Detects `401 Unauthorized` responses.
  2. Subscribes pending asynchronous requests to a queue.
  3. Dispatches a single `/auth/refresh` request using the stored refresh token.
  4. Upon success, updates stored tokens and retries queued requests with the fresh token.
  5. Upon refresh failure, invokes `notifyUnauthorized()`, clears local storage, and prompts re-authentication.
- **HTTP Status Exception Mapping**: Maps 400, 403, 404, 409, 422, 429, 500, 502, 503, and 504 to domain errors (`BadRequestError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, etc.).

---

## 4. Domain Services & Typed DTOs

| Service Module | File Location | Key Capabilities |
| :--- | :--- | :--- |
| **Auth Service** | `src/services/authService.ts` | `login()`, `logout()`, `refreshToken()`, `getCurrentUser()`, JWT claims decoding |
| **Student Service** | `src/services/studentService.ts` | `getStudents()`, `getStudentById()`, `createStudent()`, `updateStudent()`, `deleteStudent()`, `exportCSV()` |
| **Dashboard Service** | `src/services/dashboardService.ts` | `getMetrics()`, `getChartData()`, `getRecentActivities()` |
| **Notification Service** | `src/services/notificationService.ts` | `getNotifications()`, `markAsRead()`, `markAllAsRead()`, `deleteNotification()` |

---

## 5. Security & Route Protection

- **`ProtectedRoute` (`src/routes/ProtectedRoute.tsx`)**: Enforces active JWT authentication before rendering nested routes; redirects unauthenticated users to `/login`.
- **`RoleRoute` (`src/routes/RoleRoute.tsx`)**: Restricts module access based on assigned user roles (`SuperAdmin`, `Admin`, `Dean`, `Faculty`, `FinanceOfficer`, `Student`) and specific permission flags.

---

## 6. Environment Configuration

Toggle backend integration mode via `src/config/apiConfig.ts` or environment variables:

```env
# Spring Boot Live Backend Mode
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_API=false

# Offline / Standalone Mock Preview Mode
VITE_USE_MOCK_API=true
```
