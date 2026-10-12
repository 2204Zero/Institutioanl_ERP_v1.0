# Institutional ERP v1.0 — Project Overview & Academic Abstract

## 1. Project Identity
- **Project Name:** Institutional Enterprise Resource Planning System (Institutional ERP v1.0 / EduPulse)
- **Domain:** Higher Education Institutional Administration & Student Lifecycle Management
- **Repository:** `https://github.com/2204Zero/Institutioanl_ERP_v1.0.git`
- **Current Baseline:** Version 1.0.0-SNAPSHOT | Hardened RC1 Baseline
- **Academic Context:** Multi-Tier Higher Education Software Architecture & Engineering Project

---

## 2. Abstract

Modern higher education institutions frequently struggle with fragmented administrative software ecosystems where student records, course offerings, attendance tracking, financial accounting, and faculty assignments reside in disconnected databases or manual spreadsheets. This fragmentation introduces record discrepancies, vulnerabilities to Insecure Direct Object References (IDOR), registration race conditions, and heavy administrative overhead.

**Institutional ERP v1.0** addresses these institutional challenges through a unified, production-grade modular monolith architecture. Engineered with **Java 21**, **Spring Boot 3.3.4**, and **PostgreSQL 17/18**, the system enforces strict relational integrity, automated Flyway schema migrations (V1–V5), and comprehensive Role-Based Access Control (RBAC) across six institutional personas: Super Administrator, Administrator, Faculty, Student, Parent, and Finance Officer. The user experience is delivered through a high-performance, accessible web portal built with **React 19**, **TypeScript**, **TanStack Query v5**, and **Tailwind CSS**.

The platform encapsulates core university workflows:
1. **Student Information System (SIS):** Student profile lifecycle management, emergency contacts, guardian linking, verified document repository (Aadhaar, transcripts), and immutable status audit logs.
2. **Academic & Course Administration:** Multi-department degree programs, course offerings, section scheduling, capacity enforcement, and timetable conflict prevention.
3. **Student Self-Service:** Automated course registration with concurrency safeguards and authenticated self-service attendance inspection.
4. **Faculty Workspace:** Assigned section rosters, schedule inspection, and bulk attendance submission with granular status toggles.
5. **Admissions Pipeline:** Inquiries, applications, document verification, and administrative decision transitions (Approve, Reject, Onboard).
6. **Finance & Invoicing:** Fee structure allocation, invoice management, idempotent payment recording, and balance tracking.

The system's correctness is validated through multi-tier testing: 52 automated backend test classes (including 49 targeted unit/integration tests and dedicated PostgreSQL integration suites with fail-fast safety guards), 100% production build verification across dual frontend targets, and real-browser acceptance automation across all 14 registered application routes.

---

## 3. Background & Institutional Motivation

Traditional campus administration relies on siloed departments operating disparate commercial off-the-shelf tools, homegrown desktop applications, and manual paperwork:
- **Disjointed Records:** When a student suspends enrollment, updates contact details, or clears fees, updates fail to propagate across academic departments, examination boards, and residential facilities.
- **Security & Authorization Deficits:** Legacy academic portals often rely on client-side role checks without robust backend resource ownership verification, exposing sensitive student records and financial ledgers to IDOR exploits.
- **Registration Race Conditions:** Course registration surges during drop/add windows lead to oversold sections, database deadlocks, and corrupted enrollment counts.
- **Financial Audit Vulnerabilities:** Duplicate fee payments and inconsistent transaction receipts emerge when payment endpoints lack cryptographic idempotency keys.

---

## 4. Formal Problem Statement

> **Problem Statement:** Higher education institutions lack a unified, secure, and transactional digital platform capable of harmonizing the end-to-end student lifecycle—from admission and course registration to timetable scheduling, attendance oversight, and financial settlement—while ensuring strict data privacy, horizontal privilege isolation, and verifiable database integrity under concurrent load.

### Key Operational Challenges Addressed
1. **Lack of Identity Federation:** Disconnect between login authentication accounts (`users`) and academic domain entities (`students`, `faculty`).
2. **Insecure Data Exposure:** Unauthorized access where authenticated students could enumerate peer records or list institutional directories.
3. **Capacity Breaches:** Enrollment spikes violating classroom physical seating constraints.
4. **Unregulated Status Transitions:** Arbitrary student status modifications lacking immutable historical audit trails and administrative accountability.
