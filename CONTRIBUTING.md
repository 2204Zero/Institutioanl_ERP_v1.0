# Contributing to Institutional ERP v1.0

Thank you for your interest in contributing to **Institutional ERP v1.0**. This guide outlines our development workflow, coding standards, branch conventions, and testing requirements to ensure high software quality across our modular monolith.

---

## 1. Code of Conduct & Core Principles
- **Evidence-Based Engineering**: Ensure every pull request includes verifiable automated tests (unit, integration, or contract tests).
- **Security First**: Never hardcode credentials, tokens, or personal identifiers. Adhere strictly to the guidelines in [SECURITY.md](SECURITY.md).
- **Safe Database Practices**: Never execute unversioned DDL directly against shared databases. All schema modifications must be scripted via versioned Flyway migrations (`V{version}__{description}.sql`).

---

## 2. Branching Strategy & Conventions

All contributors must follow the branch conventions documented in [`docs/Branch-Registry.md`](docs/Branch-Registry.md).

### Permanent Branches
- `main`: Protected production release branch. Direct pushes are disabled.
- `develop`: Protected integration branch. All feature branches must branch from and target `develop`.

### Branch Naming Patterns
| Branch Type | Format | Example |
| :--- | :--- | :--- |
| **Feature** | `feature/<module-name>` | `feature/student-profile` |
| **Bug Fix** | `bugfix/<issue-name>` | `bugfix/student-search` |
| **Hot Fix** | `hotfix/<patch-name>` | `hotfix/login-csrf-patch` |
| **Release** | `release/<version>` | `release/v1.0` |

*Rules:*
- Always use lowercase letters separated by hyphens.
- Never name branches after personal names or vague descriptors (e.g., `test`, `work`).

---

## 3. Development Setup & Prerequisites

Ensure the following tools are installed before contributing:
- **Java SE Development Kit 21** (Temurin / OpenJDK 21 LTS)
- **Apache Maven 3.9+** (or use bundled `mvnw.cmd` / `./mvnw`)
- **Node.js 22 LTS** and **npm 10+**
- **Docker & Docker Compose** (for PostgreSQL 17, Redis, RabbitMQ, and MinIO)

### Local Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/2204Zero/Institutioanl_ERP_v1.0.git
   cd Institutioanl_ERP_v1.0
   ```
2. Start infrastructure services (optional for fast H2 unit testing, required for full stack):
   ```bash
   cd edupulse
   docker compose up -d
   ```
3. Run backend (Spring Boot on port 8081):
   ```bash
   cd ../backend
   ./mvnw spring-boot:run
   ```
4. Run frontend (Authoritative `frontend-v2` on port 5173):
   ```bash
   cd ../frontend-v2
   npm install
   npm run dev
   ```

---

## 4. Testing Requirements

Every backend PR must pass both testing suites before review:

### Fast Developer Suite (H2 In-Memory)
```bash
cd backend
mvn clean test
```
*Validates controller MockMvc endpoints, service logic, and Spring Security filters.*

### PostgreSQL Integration Suite (`postgres-it`)
```bash
cd backend
mvn verify -P postgres-it
```
*Validates Flyway V1–V5 migrations, foreign key constraints, and transactional concurrency against isolated database `edupulse_test`.*

> **Database Safety Notice**: Never point test executions to `edupulse_erp` or `one`. The test safety guard `PostgresSafetyGuard` will automatically abort execution if an unauthorized database target is detected.

### Frontend Validation
```bash
cd frontend-v2
npx tsc --noEmit
npm run build
```

---

## 5. Commit & Pull Request Workflow

We enforce **Conventional Commits**:
- `feat(student): add roll number uniqueness check`
- `fix(auth): prevent token reuse after password reset`
- `test(finance): add concurrency test for fee payments`
- `docs(readme): update system architecture diagrams`

### Pull Request Checklist
1. [ ] Branch created from the latest `develop`.
2. [ ] Backend tests passing (`mvn clean test`).
3. [ ] Frontend builds without TypeScript errors (`npm run build`).
4. [ ] No sensitive credentials, keys, or passwords committed.
5. [ ] Relevant documentation updated in `docs/`.
6. [ ] PR description clearly explains the problem, proposed solution, and test evidence.