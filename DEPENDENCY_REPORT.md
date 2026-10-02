# Institutional ERP System - Dependency Report

## 1. Frontend Dependencies (`package.json`)

### Core Production Dependencies
| Package | Version | Purpose | Assessment |
| :--- | :--- | :--- | :--- |
| `react` | `^18.3.1` | Core UI Library | Up to date, stable |
| `react-dom` | `^18.3.1` | React DOM Renderer | Up to date |
| `axios` | `^1.20.0` | HTTP Client | Operational, configured with interceptors in `apiClient.ts` |
| `clsx` | `^2.1.1` | Utility for conditional classNames | Used across design system components |
| `tailwind-merge` | `^2.3.0` | Tailwind class merging | Essential for UI component variant overrides |
| `framer-motion` | `^11.2.10` | UI Animations & Modals | Operational in modals and drawer transitions |
| `lucide-react` | `^0.395.0` | Icon Set | Heavy import footprint; needs tree-shaking review |
| `react-hook-form`| `^7.51.5` | Form State & Management | Core form foundation |
| `zod` | `^3.23.8` | Schema Validation | Integrated via `@hookform/resolvers` |
| `@hookform/resolvers` | `^3.6.0` | Zod Resolver for RHF | Operational |
| `recharts` | `^2.12.7` | Charts & Data Visualization | Used in Finance Dashboard |

### Dev Dependencies
| Package | Version | Purpose | Assessment |
| :--- | :--- | :--- | :--- |
| `vite` | `^5.2.13` | Dev Server & Bundler | Fast compilation |
| `typescript` | `^5.9.3` | TypeScript Compiler | Passing 0 errors |
| `tailwindcss` | `^3.4.4` | Utility CSS Framework | Configured |
| `postcss` | `^8.4.38` | CSS Processor | Configured |
| `autoprefixer` | `^10.4.19` | CSS Prefixing | Configured |

---

## 2. Missing Critical Dependencies
- **`react-router-dom`**: Not present in `package.json`. SPA navigation relies on manual state switching instead of URL routes.
- **`eslint` / `prettier`**: Missing from root `package.json`.
- **`vitest` / `@testing-library/react`**: Missing unit testing harness for frontend components.

---

## 3. Backend Dependencies (`pom.xml`)
- **Spring Boot**: `3.3.4`
- **Java Version**: `21`
- **Spring Security**: `3.3.4` + `jjwt-api 0.11.5`
- **Spring Data JPA**: Hibernate ORM
- **Database**: H2 (In-memory dev), PostgreSQL (Production driver)
- **Documentation**: Springdoc OpenAPI `2.6.0`
- **Lombok**: `1.18.34` (Requires Maven compiler configuration update for JDK 21 compatibility)
