# Role-Based Access Control (RBAC) Architecture

## 1. Overview
The Institutional ERP Suite supports multi-role authorization aligned with Spring Boot Security authorities.

## 2. Supported Roles & Access Matrix

| Role | Default Dashboard | Key Modules & Privileges |
| :--- | :--- | :--- |
| **Student** | `StudentDashboard` | Course schedule, CGPA progress, fee receipt download, library issue log. |
| **Teacher / Faculty** | `TeacherDashboard` | Class roster, grade evaluation & submission, attendance marking, office hours. |
| **Parent** | `ParentDashboard` | Ward performance summary, online UPI fee payment, teacher announcements. |
| **Admin / SuperAdmin / Dean** | `AdminDashboard` | Financial ledger, payroll disbursement, RBAC policies, department budgets, system terminal. |

## 3. JWT Security & Persistence
Selected role identity is persisted to `localStorage` and encoded within Spring Boot JWT access tokens for API authorization headers (`Authorization: Bearer <token>`).
