# Institutional ERP System - Project Structure & Directory Mapping

## Directory Structure Map

```
D:\ERP_Project
├── .github/                       # CI/CD Workflows
├── backend/                       # Spring Boot Java 21 Backend
│   ├── .mvn/
│   ├── mvnw / mvnw.cmd
│   ├── pom.xml                    # Maven configuration (Spring Boot 3.3.4)
│   └── src/
│       ├── main/
│       │   ├── java/com/erp/      # Controllers, Services, Repositories, Entities, Security
│       │   └── resources/         # application.yml, db migrations
│       └── test/
├── database/                      # DB Migration Scripts & Schemas
│   ├── migrations/
│   ├── schema/
│   └── seeds/
├── docs/                          # Project Specifications & Specifications
│   ├── ADR/                       # Architecture Decision Records
│   ├── API/                       # API Specifications
│   ├── BRD/                       # Business Requirements Documents
│   ├── FRD/                       # Functional Requirements Documents
│   ├── HLD/                       # High-Level Architecture Design
│   ├── LLD/                       # Low-Level Architecture Design
│   └── SRS/                       # System Requirements Specifications
├── frontend/                      # ORPHANED DUPLICATE FOLDER (Needs Deprecation/Cleanup)
│   ├── pacakage.json              # Typo in filename
│   └── src/
├── infrastructure/                # Docker & Nginx Infrastructure
│   ├── docker/
│   ├── monitoring/
│   └── nginx/
├── src/                           # ACTIVE FRONTEND REACT SOURCE CODE
│   ├── components/                # UI Components (Dashboard, Forms, Modals, Layout, UI)
│   ├── constants/                 # Mock Data & System Constants
│   ├── context/                   # ERPContext state container
│   ├── hooks/                     # Custom React Hooks (19 hooks)
│   ├── pages/                     # FinanceDashboardPage, LoginPage, UnauthorizedPage
│   ├── providers/                 # AppProviders container
│   ├── routes/                    # Route definition interfaces
│   ├── services/                  # apiClient, authService, studentService
│   ├── store/                     # StoreContext & storeReducer
│   ├── styles/                    # globals.css & Tailwind
│   ├── tokens/                    # Color, Spacing, Typography tokens
│   ├── types/                     # TypeScript interfaces
│   ├── utils/                     # Cache, Search, Filter, TokenStorage, CSV Exporter
│   └── validation/                # Zod schemas & error formatters
├── index.html                     # SPA Entrypoint HTML
├── package.json                   # Active Frontend Dependencies
├── tailwind.config.js             # Tailwind CSS Configuration
├── tsconfig.json                  # TypeScript Compiler Settings
└── vite.config.ts                 # Vite Build Engine Configuration
```
