# Institutional ERP v1.0

> A modular, scalable, multi-tenant Enterprise Resource Planning platform designed for educational institutions.

## 1. Overview

**Institutional ERP v1.0** is a next-generation educational ERP designed to provide a unified platform for managing the academic, administrative, financial, operational, and analytical activities of educational institutions.

The system is designed as a **modular enterprise platform**, where individual business domains remain logically independent while operating together as one integrated system.

### Core Architectural Principles

- Domain-Driven Design (DDD)
- Modular Architecture
- Clean Architecture
- API-First Development
- Event-Driven Communication
- Multi-Tenant Data Isolation
- Security by Design
- AI & Analytics Readiness
- Cloud-Native Deployment

---

## 2. Project Vision

The objective is to build an ERP that can evolve from a single-institution deployment into a platform capable of supporting multiple institutions and campuses without requiring a fundamental redesign of the system.

The platform aims to provide:

- Unified institutional data
- Integrated academic workflows
- Centralized administrative operations
- Secure role-based access
- Real-time reporting and analytics
- Configurable business workflows
- AI-assisted decision support
- Extensible integrations

---

## 3. Core Domains

The ERP is organized around major business domains rather than treating the system as one large collection of features.

### Foundation
- Identity & Access Management
- Institution Management
- Campus Management
- Configuration
- Tenant Management

### Academic
- Admissions
- Student Information System
- Academic Management
- Timetable
- Attendance
- Examination
- Learning Management

### Enterprise Operations
- Finance
- Human Resource Management
- Library
- Hostel
- Transport
- Procurement
- Asset Management

### Platform Services
- Communication
- Notification
- Workflow
- Document Management
- Reporting
- Integration

### Intelligence
- Analytics
- Dashboards
- Predictive Analytics
- AI Services

---

## 4. Architectural Approach

The system follows a **Modular Monolith** approach during the initial implementation phase.

```text
                         Institutional ERP
                                |
        ------------------------------------------------
        |              |              |               |
    Foundation      Academic      Enterprise      Platform
        |              |              |               |
        ------------------------------------------------
                                |
                         Shared Services
                                |
              ---------------------------------
              |               |               |
          PostgreSQL        Redis          RabbitMQ
              |
           MinIO
```

Each domain is designed to maintain clear boundaries around its business logic and data.
The architecture is intentionally structured so that individual domains can be extracted into independent services in the future if scale or operational requirements justify it.

---

## 5. Technology Stack

| Component | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Component-based UI architecture |
| **Backend** | Java, Spring Boot, Spring Security, REST APIs |
| **Database** | PostgreSQL |
| **Caching** | Redis |
| **Messaging** | RabbitMQ |
| **Object Storage** | MinIO |
| **Development & Collaboration** | Git, GitHub, GitHub Actions, Pull Requests, Code Review |
| **Containerization & Infrastructure**| Docker, Container-based deployment |

---

## 6. Repository Structure

```text
Institutional_ERP_v1.0/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   └── .gitkeep
│
├── frontend/
│   └── .gitkeep
│
├── database/
│   ├── schema/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│   ├── ADR/
│   ├── API/
│   ├── BRD/
│   ├── FRD/
│   ├── HLD/
│   ├── LLD/
│   └── SRS/
│
├── infrastructure/
│   ├── docker/
│   ├── monitoring/
│   └── nginx/
│
├── scripts/
│
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

### Repository Responsibilities

| Directory | Responsibility |
| :--- | :--- |
| `frontend/` | React application |
| `backend/` | Spring Boot application |
| `database/` | Database schemas, migrations and seed data |
| `docs/` | Project and technical documentation |
| `infrastructure/` | Infrastructure and deployment configuration |
| `scripts/` | Development and automation scripts |
| `.github/` | GitHub workflows and repository automation |

---

## 7. Git Branch Strategy

The project uses a protected branch workflow.

```text
                         main
                           |
                     release / stable
                           |
                        develop
                           |
        -----------------------------------------
        |             |             |            |
     feature/*     feature/*     feature/*    feature/*
```

### Main Branches
- **`main`**: Stable, production-ready code
- **`develop`**: Integration branch for completed features

### Development Branches
- `feature/<feature-name>`
- `bugfix/<bug-name>`
- `hotfix/<issue-name>`
- `release/<version>`

**Examples:**
- `feature/student-profile`
- `feature/authentication`
- `feature/institution-management`
- `bugfix/student-api`
- `hotfix/security-patch`
- `release/v1.0`

> **Note:** Direct development on `main` and `develop` is restricted. Changes should normally reach these branches through Pull Requests.

---

## 8. Development Workflow

1. Issue / Task
2. Feature Branch
3. Development
4. Local Testing
5. Commit
6. Push
7. Pull Request
8. CI Checks
9. Code Review
10. Merge to `develop`
11. Integration Testing
12. Release
13. Merge to `main`

---

## 9. Commit Convention

The project follows a Conventional Commits-style format:
`<type>(<scope>): <description>`

**Common Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`

**Examples:**
- `git commit -m "feat(student): add student profile"`
- `git commit -m "feat(auth): implement JWT authentication"`
- `git commit -m "fix(student): resolve duplicate enrollment"`
- `git commit -m "test(auth): add authentication tests"`
- `git commit -m "docs(srs): update student requirements"`
- `git commit -m "chore(ci): configure GitHub Actions"`

---

## 10. Pull Request Policy

Every feature should be submitted through a Pull Request.

**PR Flow:** Feature Branch -> Pull Request -> Automated CI -> Code Review -> Approval -> Merge

A Pull Request should include:
- Purpose of the change
- Modules affected
- Related issue/task
- Testing performed
- Screenshots for UI changes where applicable
- Relevant documentation updates

---

## 11. Continuous Integration

GitHub Actions is used for Continuous Integration. The initial CI pipeline validates the frontend and backend builds.

```text
                    GitHub
                       |
                 Pull Request
                       |
                GitHub Actions
                       |
          -------------------------
          |                       |
     Frontend CI             Backend CI
          |                       |
      npm install              Maven
          |                       |
    TypeScript Check          Tests
          |                       |
      Build Check             Verify
          |                       |
          -----------+-----------
                     |
                 PASS / FAIL
```

The CI pipeline is intended to prevent broken code from being merged into protected branches.

---

## 12. Security Architecture

Security is treated as a cross-cutting concern. The system is designed around:

- Authentication
- Authorization
- Role-Based Access Control (RBAC)
- Secure API access
- Password hashing
- Session/token management
- Audit logging
- Tenant-level data isolation

**Access Model:**
`User` -> `Authentication` -> `Authorization` -> `Role` -> `Permission` -> `Protected Resource`

---

## 13. Data Architecture

PostgreSQL is the primary transactional database. The data architecture is designed around:

- Relational integrity
- Foreign-key relationships
- Transactional consistency
- Clear ownership of domain data
- Database migrations
- Tenant isolation
- Controlled access between domains

> Business domains should not bypass domain boundaries by directly modifying another domain's data.

---

## 14. Communication Architecture

The system uses two primary communication mechanisms.

### Synchronous Communication
Used where an immediate response is required.
`React` -> `REST API` -> `Spring Boot`

### Asynchronous Communication
RabbitMQ is used for event-driven operations where asynchronous processing is appropriate.

**Example:**
```text
Admission Approved
        |
        v
      Event
        |
   +----+----+
   |         |
   v         v
 Finance   Notification
             |
             v
          Analytics
```
This allows independent operations to be processed asynchronously without unnecessarily blocking the main request.

---

## 15. Multi-Tenancy

The ERP is designed to support multiple institutions.

```text
                    ERP Platform
                         |
          -------------------------------
          |              |              |
     Institution A  Institution B  Institution C
          |              |              |
       Isolated       Isolated       Isolated
        Data           Data           Data
```

The architecture prioritizes tenant isolation, secure access boundaries, institution-specific configuration, scalable data management, and centralized platform services.

---

## 16. Documentation Structure

All major project documentation is maintained inside `docs/`.

- `BRD/`: Business Requirements
- `FRD/`: Functional Requirements
- `SRS/`: Software Requirements Specification
- `HLD/`: High-Level Design
- `LLD/`: Low-Level Design
- `API/`: API Documentation
- `ADR/`: Architecture Decision Records

**Architecture Decision Records (ADRs)**
Significant architecture decisions should be documented using ADRs.
Examples:
- `ADR-001: Modular Monolith Architecture`
- `ADR-002: PostgreSQL as Primary Database`
- `ADR-003: RabbitMQ for Asynchronous Messaging`
- `ADR-004: Multi-Tenant Data Isolation Strategy`

---

## 17. Development Principles

- **Modularity:** Business domains should remain independently maintainable.
- **Separation of Concerns:** Business logic, infrastructure, and presentation should remain separated.
- **API First:** Communication should occur through defined interfaces.
- **Security by Design:** Security should be considered during design rather than added later.
- **Configuration over Hard-Coding:** Institution-specific behavior should be configurable where practical.
- **Documentation with Development:** Important architectural and API changes should be documented alongside implementation.

---

## 18. Current Development Phase

**Phase 1 — Platform Foundation**
Current priorities include: Repository setup, Branch governance, CI setup, Backend initialization, Frontend initialization, Database foundation, Authentication, Institution management, and Student Information System foundation.

### Development Roadmap
- **Phase 1:** Platform Foundation
- **Phase 2:** Core Academic Operations
- **Phase 3:** Enterprise Operations
- **Phase 4:** Analytics & Intelligence
- **Phase 5:** Advanced Platform & Ecosystem

---

## 19. Definition of Done

A feature is considered complete when:
- [ ] Implementation is completed
- [ ] Database changes are included where required
- [ ] APIs are implemented and documented
- [ ] Validation and error handling are implemented
- [ ] Tests are added where applicable
- [ ] CI checks pass
- [ ] Documentation is updated
- [ ] Pull Request is reviewed
- [ ] Changes are merged into develop

---

## 20. Project Status

| Area | Status |
| :--- | :--- |
| Repository | Completed |
| Repository Structure | Completed |
| Branch Strategy | Configured |
| Branch Protection | Configured |
| CI Workflow | Configured |
| Frontend | In Development |
| Backend | In Development |
| Database | In Development |
| Authentication | Planned / In Development |
| ERP Modules | Progressive Implementation |

---

## 21. Team

| Member | Primary Responsibility |
| :--- | :--- |
| Palak Agarwal | Academic / SIS Domain |
| Manish Sharma | Security & Authentication |
| Lakshya Singhal | Frontend |
| Prashant Jain | Institution & Operations |
| Lakshya Goyal | Architecture, Integration & Project Leadership |

---

## 22. Contribution

Before contributing:
1. Pull the latest `develop` branch.
2. Create a feature or bug-fix branch.
3. Implement the assigned task.
4. Test the changes locally.
5. Follow the commit convention.
6. Push the branch.
7. Open a Pull Request.
8. Resolve review comments.
9. Merge only after required checks and approval.

See `CONTRIBUTING.md` for the contribution workflow.

---

## 23. License

This project is licensed under the MIT License. See `LICENSE` for details.
