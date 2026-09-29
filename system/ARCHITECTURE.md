# Enterprise Institutional ERP System - Architecture Blueprint

## 1. Overview
The Institutional ERP Suite architecture is built for extreme scalability, supporting 250+ enterprise modules across Academic, Foundation, and Financial domains. It enforces strict separation of concerns through Clean Architecture and SOLID principles.

---

## 2. Directory Layout & Layer Responsibilities

```
src/
├── api/              # Axios HTTP client configuration & interceptors
├── assets/           # Static images, SVG icons, and branding assets
├── components/       # Domain-agnostic reusable UI components & tables
├── constants/        # System configuration constants & mock domain data
├── contexts/         # React Context state containers (ERPContext, ThemeContext)
├── design-system/    # Core Design Tokens & WCAG AA Primitive Components
│   ├── primitives/   # Primitive UI Controls (Button, Input, Checkbox, Tag, Alert)
│   └── tokens/       # Design System Tokens (Colors, Typography, Spacing, Elevation)
├── features/         # Domain-specific feature modules (Finance, Admissions, SIS, etc.)
├── hooks/            # Custom React hooks (useERP, useAuth, useApi, usePagination)
├── layouts/          # Top-level workspace layout shell & sidebar containers
├── pages/            # View pages for routing endpoints
├── providers/        # Top-level context providers wrapper
├── routes/           # AppRoutes configuration, ProtectedRoute & RoleRoute guards
├── services/         # API integration services (authService, studentService, etc.)
├── styles/           # Global CSS variables & Tailwind directives
├── theme/            # ThemeProvider & theme resolution logic
├── types/            # TypeScript type declarations & interfaces
└── utils/            # Helper utilities (cn, storage, backendLogger, exportCsv)
```

---

## 3. Core Subsystems

### 3.1 Authentication & Authorization Pipeline
The security pipeline utilizes double-layered routing protection:
1. **`ProtectedRoute`**: Verifies JWT token presence in storage; redirects unauthenticated visitors to `/login`.
2. **`RoleRoute`**: Assesses user role privileges (`SuperAdmin`, `Admin`, `Dean`, `Faculty`, `Student`) against required route permissions.

### 3.2 Spring Boot Backend Audit Logger
All user interactions, API disbursements, and data manipulations invoke the `logBackendAction()` utility. This outputs formatted Spring Boot stdout logs into browser/terminal consoles while dispatching live audit entries to subscribers:

```
[SPRING BOOT BACKEND LOG] 2026-09-28T14:20:00Z | admin.rajesh | Updated Admissions Application Status | PUT /api/v1/admissions/applications/app-1/status | Status: 200 (24ms)
```

---

## 4. State Management Strategy
- **Client State**: Local component state managed via React `useState` / `useReducer` for UI toggles and form inputs.
- **Global Domain State**: `ERPContext` handles cross-cutting state (transactions, student rosters, toast notifications, active module path, global search modal).
- **Theme Hydration**: `ThemeContext` persists theme choice (`light`, `dark`, `system`) to `localStorage` and listens for OS `prefers-color-scheme` changes.
