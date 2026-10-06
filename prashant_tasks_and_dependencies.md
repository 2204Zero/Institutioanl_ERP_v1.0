# Prashant Jain's Task List and Dependencies (Academic & Scheduling Owner)

## Overview
**Modules Owned:**
- #21 Academic Calendar
- #25 Credit Management
- #26 Prerequisite Management
- #28 Course Offering Management
- #34 Timetable Management
- #35 Faculty Allocation
- #36 Classroom Allocation
- #37 Schedule Conflict Detection

## WEEK 06: Production Foundation & Feature Development

### Day 1: Production Foundation + Academic Foundation
**Tasks:**
- **#21 Academic Calendar:** Implement academic session, semester, start/end dates, active/current session, validation, and relationships.
- **#25 Credit Management:** Define course credits, credit limits, relevant academic relationships. (Do not duplicate existing academic models).
- **Testing:** Write tests for overlapping/invalid dates, invalid semester, duplicate session, invalid credit value, CRUD/API tests, and DB constraint tests.

**Dependencies:**
- **Database:** Singhal must set up the database foundation (tables for Academic Calendar and Credit).
- **Security:** Manish's audit infrastructure should be ready for tracking changes.

**Dependents (Who waits on your work):**
- **Palak:** Registration validation depends on your Credit Management module (Day 4).
- **Lakshya:** Frontend needs the Academic Calendar APIs to build the UI.

### Day 2: Academic Dependencies
**Tasks:**
- **#26 Prerequisite Management:** Support Course -> Prerequisite Course(s). Rules must be reusable by Registration Validation later.
- **#28 Course Offering Management:** Model: Course -> Academic Session -> Semester -> Course Offering -> Section.
- **Testing:** Test prerequisite creation, duplicate prerequisite, self-prerequisite, invalid course, offering validity, duplicate offering, and API tests.

**Dependencies:**
- **Database:** Singhal must ensure database relationships and migrations are in place for prerequisites and course offerings.

**Dependents (Who waits on your work):**
- **Palak:** Registration Validation (#31) requires your Prerequisites and Course Offerings to function (Day 4).
- **Lakshya:** Course Registration UI requires your Course Offerings APIs (Day 3).

### Day 3: Academic Dependency Verification
**Tasks:**
- Ensure academic dependencies work: Program -> Semester -> Course -> Course Offering -> Section -> Credits -> Prerequisites.
- **Testing:** Test cross-module queries.

**Dependencies:**
- **Database:** Singhal's database schema for the above entities must be fully integrated.

**Dependents (Who waits on your work):**
- **Palak:** Course Registration (#29) relies heavily on the availability and correctness of sections and offerings.
- **Lakshya:** Registration interfaces depend on these cross-module academic relationships.

### Day 4: Scheduling & Allocation Foundation
**Tasks:**
- **#34 Timetable Management**
- **#35 Faculty Allocation**
- **#36 Classroom Allocation**
- Model: Course Offering -> Section -> Faculty -> Classroom -> Time Slot.
- Start implementation of classroom allocation.
- **Testing:** Test faculty conflict, room conflict, section conflict, overlapping time, and valid allocation.

**Dependencies:**
- **Database:** Singhal must have the registration + scheduling database ready (timetable, time slots, faculty allocations, classroom allocations, section schedules).

**Dependents (Who waits on your work):**
- **Lakshya:** Needs your endpoints to build the Timetable UI and Faculty Allocation UI (Day 4/5).
- **Palak:** Class Enrollment (#32) and Attendance (#38) depend on the structural reality of these sections and timetables (Day 5).

### Day 5: Conflict Detection
**Tasks:**
- **#37 Schedule Conflict Detection:** Detect faculty conflict, classroom conflict, section conflict, and time conflict (e.g., Faculty A teaching two courses at the same time).
- **Testing:** Test all conflict scenarios.

**Dependencies:**
- **Frontend:** Lakshya Goyal needs to build the frontend conflict display, timetable, and faculty allocation UI to visualize these conflicts.

**Dependents (Who waits on your work):**
- **Lakshya:** Conflict display UI relies entirely on your conflict detection APIs.

### Day 6: Full Integration (All-Team)
**Tasks:**
- **Academic E2E Testing:** Session -> Semester -> Course -> Offering -> Section -> Faculty -> Classroom -> Timetable -> Conflict.

**Dependencies:**
- **System-Wide Integration:** Requires Frontend (Lakshya), Database (Singhal), and Security (Manish) to be fully functional for end-to-end testing.

**Dependents (Who waits on your work):**
- **Lakshya & Palak:** The full application E2E testing cannot be completed without your Academic workflow functioning properly.

### Day 7: Release Candidate Freeze
**Tasks:**
- **Academic/scheduling regression testing.**

**Dependencies:**
- **Release Candidate:** The entire team must freeze new features to focus on testing.

---

## WEEK 07: Cloud Production Infrastructure & Testing

### Day 8: Cloud Production Infrastructure
**Tasks:**
- **Academic production smoke test:** Run production migration/business smoke tests against staging/production candidate.

**Dependencies:**
- **Infrastructure:** Singhal and Lakshya must have the production environment (DB, VM, Nginx, HTTPS) set up.

### Day 9: CI/CD + First Production Deployment
**Tasks:**
- **Academic/scheduling smoke test:** Verify your services after deployment.

**Dependencies:**
- **CI/CD Pipeline:** Lakshya must have the GitHub Actions pipeline successfully building and deploying.

### Day 10: Production Functional & Security Test
**Tasks:**
- **Functional QA:** Test all academic and scheduling modules in the production environment.

**Dependencies:**
- **Production Environment:** Needs to be fully accessible and stable.

### Day 11: Load, Failure, and Recovery
**Tasks:**
- **Concurrency Testing:** Test concurrent timetable updates, classroom allocation, and faculty allocation.
- Check conflict correctness under load.

**Dependencies:**
- **Load Testing Infrastructure:** Singhal will drive the load testing, you need to verify business logic correctness under this load.

### Day 12: External User & Investor Acceptance
**Tasks:**
- **External User Observation:** Observe an external user executing: Academic -> Course -> Offering -> Timetable.
- Note where they get confused and gather feedback.

**Dependencies:**
- **Complete Platform:** The entire ERP must be live, secure, and fully functional for an external user.

---

## Definition of Done for Prashant's Modules
Your modules (#21, #25, #26, #28, #34, #35, #36, #37) are only considered complete when:
- **Backend:** Entity, Repository, Service, DTO, Validation, API, Business Rules, Authorization, and Audit are complete.
- **Testing:** Unit Tests, API Tests, DB Integration Tests, E2E Test, and Security Test are written and passing.
- **Integration:** Integrated with real PostgreSQL, real frontend, and PR reviewed/merged into develop.
