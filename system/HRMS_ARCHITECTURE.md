# Institutional ERP Suite — Phase 7 Enterprise HRMS & Payroll Architecture

## 1. Executive Vision & Topology
The HRMS Module transforms human resource management in the Institutional ERP Suite into an enterprise-class HR system comparable to **SAP SuccessFactors, Oracle HCM Cloud, Workday HCM, and Darwinbox**.

It unifies employee onboarding, org hierarchy, Applicant Tracking System (ATS), biometric/RFID attendance, leave balance workflows, 7th Pay Commission payroll disbursal, faculty research appraisals, and Employee Self Service (ESS).

---

## 2. Component Topology

```
                  ┌──────────────────────────────────────────────┐
                  │    Employee Self Service (ESS) & Web Portal  │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                      Phase 7 HR Service Layer Engine                           │
│                        (src/services/hrService.ts)                             │
└──────┬───────────────────┬─────────────────┬───────────────────┬───────────────┘
       │                   │                 │                   │
       ▼                   ▼                 ▼                   ▼
┌──────────────┐   ┌───────────────┐  ┌──────────────┐    ┌──────────────┐
│  Employee    │   │  Recruitment  │  │  Biometric   │    │ 7th Pay      │
│  Lifecycle   │   │  & ATS        │  │  Attendance  │    │ Payroll      │
└──────────────┘   └───────────────┘  └──────────────┘    └──────────────┘
```

---

## 3. Core Enterprise Protocols
1. **Automated Onboarding Sequence**: On registering an employee, an ID (`EMP-YYYY-XXXX`) is issued, login credentials generated, and initial payroll/leave balances initialized.
2. **Terminal Audit Logging**: Outputs Spring Boot stdout logs (`[HR] User: ... Action: ...`) for compliance log aggregators.
