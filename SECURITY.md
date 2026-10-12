# Security Policy — Institutional ERP v1.0

The development team takes security, student data privacy, and institutional access control seriously. This document outlines our vulnerability disclosure policy and the security controls implemented across the platform.

---

## 1. Supported Versions

Security updates and patches are actively maintained for the following branches:

| Version / Branch | Supported | Notes |
| :--- | :---: | :--- |
| `release/v1.0` (v1.0-RC1) | Yes | Current release candidate and active audit baseline |
| `develop` | Yes | Active integration branch |
| `main` | Yes | Stable release branch |
| Legacy feature branches | No | Archived sprint branches are not patched |

---

## 2. Reporting a Vulnerability

If you discover a potential security vulnerability within **Institutional ERP v1.0**, please notify the maintainers responsibly:

- **Do NOT open a public GitHub issue** describing the vulnerability.
- Please create a **Private Security Advisory** on GitHub via the repository's **Security** tab (`Security -> Advisories -> Report a vulnerability`).
- Alternatively, submit a detailed report to the institutional repository administrator via GitHub issues labeled `[SECURITY-CONFIDENTIAL]` with private details redacted.

### What to Include in a Report
1. Description of the vulnerability and its potential impact (e.g., IDOR, privilege escalation, token replay).
2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
3. The affected component (`backend`, `frontend-v2`, `database migrations`, or `API endpoint`).
4. Recommended fix or mitigation, if known.

Maintainers will acknowledge receipt within 48–72 hours and provide a timeline for triage and patch release.

---

## 3. Implemented Security Controls

### 3.1 Authentication & Password Security
- **BCrypt Hashing**: All user passwords are encrypted using `BCryptPasswordEncoder` with standard cost factors before persistence in the database. Plaintext passwords are never stored or logged.
- **Stateless JWT with Database Session Tracking**:
  - Authenticated sessions issue JSON Web Tokens (JWT) signed with HMAC-SHA256 (`jwt.secret`).
  - Active sessions are recorded in the `sessions` table (`Session` entity) to allow instantaneous token revocation and logout verification.
- **Single-Use Password Recovery**:
  - Password reset tokens (`PasswordResetToken` entity) are 15-minute single-use UUID tokens marked with a `used` boolean flag to thwart replay attacks.

### 3.2 Authorization & Role-Based Access Control (RBAC)
- **Method-Level Security**: Enabled via `@EnableMethodSecurity(prePostEnabled = true)` across all Spring Boot controllers and service interfaces.
- **Least Privilege Access**:
  - Super Administrator (`ROLE_SUPER_ADMIN` / `ROLE_ADMIN`): Full institutional governance and campus management.
  - Faculty (`ROLE_FACULTY`): Restricted to assigned departments, course offerings, attendance marking, and grade submission.
  - Student (`ROLE_STUDENT`): Restricted to personal profile, assigned guardian info, fee statements, and enrolled timetable.
- **Insecure Direct Object Reference (IDOR) Mitigation**:
  - Student profile and document endpoints enforce caller identity checks to ensure students can only view or download their own records.

### 3.3 Database Integrity & Isolation
- **Versioned Migrations**: Database schema modifications are exclusively applied via versioned Flyway scripts (`V1__...` through `V5__...`).
- **Fail-Fast Test Guard (`PostgresSafetyGuard`)**:
  - Automated integration test harnesses verify target JDBC URLs before execution, strictly forbidding connections to production or operational databases (`edupulse_erp`, `one`).

### 3.4 Secret Management
- Real credentials, JWT secrets, and database passwords must never be committed to Git.
- Sample configuration is supplied safely via `.env.example` using placeholder tokens (`change_in_production_jwt_secret_key_minimum_256_bits`).
