# Institutional ERP System - Architecture Overview

## System Architecture Overview

The system is designed as a standard decoupled Client-Server architecture:
- **Frontend**: React 18 SPA built with Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, and Recharts.
- **Backend**: Spring Boot 3.3.4 (Java 21) RESTful micro-monolith backend providing domain microservices for Auth, Academics, SIS, Attendance, and Finance.
- **Database**: PostgreSQL / H2 Database managed with JPA/Hibernate entities and Liquibase database migrations.
- **Infrastructure**: Nginx reverse proxy, Docker containers, and Cloud deployment configurations.

---

## Frontend Architecture
- **State Management**: Dual-tier state architecture:
  1. `StoreContext.tsx`: Handles global application state (User Session, Auth Tokens, Global Dispatch).
  2. `ERPContext.tsx`: Handles operational ERP domain state (Transactions, Students, Modals, Navigation state, Toast notifications).
- **Design Tokens & System**: `src/tokens/` provides centralized JavaScript design tokens for colors, spacing, and typography.
- **Form Architecture**: React Hook Form coupled with Zod validation schemas (`src/validation/schemas/`).

---

## Backend Architecture
- **Layered Architecture**: Controller -> Service -> Repository -> JPA Entity / DTO.
- **Security Layer**: Spring Security with custom `JwtAuthenticationFilter` and `JwtTokenProvider`.
- **Exception Handling**: `GlobalExceptionHandler` handling `MethodArgumentNotValidException`, `ResourceNotFoundException`, and general `Exception`.
