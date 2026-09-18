# Branch Registry

> **Purpose**
>
> This document maintains the official registry of Git branches used in the Institutional ERP project.
>
> All contributors must follow the branch naming conventions defined here. Feature development should always be performed in dedicated feature branches created from `develop`.

---

# Permanent Branches

| Branch | Purpose | Protected | Direct Push |
|----------|----------|-----------|-------------|
| `main` | Stable production-ready code |
| `develop` | Integration branch |

---

# Branch Naming Convention

| Branch Type | Format | Example |
|--------------|--------|----------|
| Feature | `feature/<feature-name>` | `feature/student-profile` |
| Bug Fix | `bugfix/<issue-name>` | `bugfix/student-search` |
| Hot Fix | `hotfix/<issue-name>` | `hotfix/security-patch` |
| Release | `release/<version>` | `release/v1.0` |

---

# Naming Rules

- Use lowercase letters only.
- Separate words using hyphens (`-`).
- Use meaningful names.
- One branch should represent one feature or one fix.
- Never create random branch names.

### Good

```text
feature/student-profile
feature/authentication
feature/dashboard
feature/institution
bugfix/student-api
hotfix/login-issue
```

### Bad

```text
student
student1
lakshya-work
new-feature
test
final
final-final
```

---

# Development Workflow

```text
develop
    │
    ▼
Create Feature Branch
    │
    ▼
Development
    │
    ▼
Commit
    │
    ▼
Push
    │
    ▼
Pull Request
    │
    ▼
Code Review
    │
    ▼
Merge into develop
```

---

# Active Branch Registry

> This section contains all branches that are currently active in the repository.
>
> Before creating a new branch, verify that the feature is not already assigned.

| Module | Branch Name | Owner | Sprint | Status |
|----------|-------------|--------|----------|----------|
| Student Profile | `feature/student-profile` | Palak Agarwal | Week 3 | Active |
| Authentication & Security | `feature/authentication` | Manish Sharma | Week 3 | Active |
| Dashboard & UI | `feature/dashboard` | Lakshya Singhal | Week 3 | Active |
| Institution Management | `feature/institution` | Prashant Jain | Week 3 | Active |

---

# Planned Branch Registry

> Reserved branch names for upcoming implementation phases.

| Module | Planned Branch |
|----------|----------------|
| Student Management | `feature/student-management` |
| Admission Management | `feature/admission` |
| Attendance Management | `feature/attendance` |
| Timetable Management | `feature/timetable` |
| Examination Management | `feature/examination` |
| Academic Management | `feature/academic` |
| Finance Management | `feature/finance` |
| HRMS | `feature/hrms` |
| Library | `feature/library` |
| Hostel | `feature/hostel` |
| Transport | `feature/transport` |
| Document Management | `feature/document-management` |
| Workflow Engine | `feature/workflow-engine` |
| Notification Service | `feature/notification` |
| Reporting & Analytics | `feature/analytics` |

---

# Branch Lifecycle

Every feature branch should follow the lifecycle below.

```text
develop
    │
    ▼
Create Feature Branch
    │
    ▼
Development
    │
    ▼
Commit Changes
    │
    ▼
Push to GitHub
    │
    ▼
Create Pull Request
    │
    ▼
Code Review
    │
    ▼
Merge into develop
    │
    ▼
Delete Feature Branch
```

---

# Important Rules

- Never commit directly to `main`.
- Never commit directly to `develop`.
- Always branch from `develop`.
- Open a Pull Request for every completed feature.
- Delete feature branches after merging.
- Follow Conventional Commits for all commits.