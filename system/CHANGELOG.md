# Changelog - Institutional ERP Suite

All notable changes to this project will be documented in this file.

## [2.4.0] - 2026-09-28

### Added
- **Enterprise Design System Foundation (`src/design-system/`)**:
  - `tokens/`: Created strict 8px grid spacing, Inter font scale, semantic light/dark theme tokens, elevation shadows, motion curves, and z-index tokens.
  - `primitives/`: Added WCAG AA compliant primitive controls (`Checkbox`, `Tag`, `Alert`, `Button`, `Input`, `Card`, `Badge`, `Modal`, `Table`, `Toast`).
- **Complete ERP Module Coverage**:
  - Implemented full interactive views for 12 ERP modules: `Finance`, `Admissions`, `SIS`, `Timetable`, `Attendance`, `Gradebook`, `HR/Payroll`, `Library`, `Hostel`, `Transport`, `User Auth (RBAC)`, and `Org Structure`.
- **Spring Boot Terminal Audit Logger**:
  - `logBackendAction()` utility simulating Spring Boot REST terminal stdout logs for all user interactions.
- **Routing & Navigation**:
  - Integrated `useNavigate` across Sidebar, Topbar, and Cmd+K Global Search modal for seamless single-page application routing.
- **Documentation Suite**:
  - Generated `PROJECT_AUDIT.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, and `MIGRATION_PLAN.md`.

### Changed
- Standardized Badge component variants to support `danger` as a first-class alias for `error`.
- Refactored `AppRoutes.tsx` to mount all protected module views inside `ProtectedRoute`.

### Fixed
- Fixed TypeScript compiler type mismatch warnings across page badge properties.
- Resolved dark mode flash on initial page render.
