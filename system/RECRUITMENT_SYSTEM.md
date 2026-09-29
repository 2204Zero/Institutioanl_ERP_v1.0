# Institutional ERP Suite — Applicant Tracking System (ATS) & Recruitment

## 1. Overview & Workflow Stages
The ATS Module governs open faculty/staff vacancies:

```
[ Job Posting Created ] ──> [ Candidates Apply ] ──> [ Screening & Resume Parser ]
                                                                  │
                                                                  ▼
[ Offer Letter Issued ] <── [ Interview Panel Rating ] <── [ Technical Interview ]
```

---

## 2. Data Models
- **Job Posting**: Code (`JOB-2026-CS01`), department, qualification requirements, vacancies.
- **Candidate Application**: Stage, candidate details, interview schedule, interviewer rating score (1 to 5).
