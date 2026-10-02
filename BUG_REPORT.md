# Institutional ERP System - Complete Bug Registry

## Bug Summary Table

| ID | Title | Module | Severity | Location | Description |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **BUG-001** | Typo in Folder Name | Infrastructure | Low | `frontend/pacakage.json` | Duplicate `frontend` directory contains misspelled filename `pacakage.json`. |
| **BUG-002** | Missing Lint Script | Build | Medium | `package.json` | `npm run lint` command fails because no script entry exists in root `package.json`. |
| **BUG-003** | JDK 21 Lombok Compiler Failure | Backend | Critical | `backend/pom.xml` | `mvnw test-compile` fails with `TypeTag :: UNKNOWN` under Java 21 due to Lombok version mismatch. |
| **BUG-004** | Disabled Application Routing | Frontend | High | `src/App.tsx` | Application statically mounts `FinanceDashboardPage` without React Router. |
| **BUG-005** | Monolithic JS Bundle Size | Frontend | Medium | `vite.config.ts` | Vite build produces single 863.88 kB JS asset without code-splitting chunks. |
| **BUG-006** | Unwired REST Services | Data Layer | Critical | `src/context/ERPContext.tsx` | ERP state operates exclusively on local array mutations using `mockData.ts`. |
| **BUG-007** | Duplicate Controller Classes | Backend | High | `backend/src/.../controllers` | Multiple duplicate `AuthController.java` and `GlobalExceptionHandler.java` definitions exist across packages. |
| **BUG-008** | Insecure Token Storage | Security | High | `src/utils/tokenStorage.ts` | Access tokens stored in plain `localStorage` instead of secure storage mechanism. |
