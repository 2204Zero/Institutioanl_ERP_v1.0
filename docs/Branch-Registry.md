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

# Important Rules

- Never commit directly to `main`.
- Never commit directly to `develop`.
- Always branch from `develop`.
- Open a Pull Request for every completed feature.
- Delete feature branches after merging.
- Follow Conventional Commits for all commits.