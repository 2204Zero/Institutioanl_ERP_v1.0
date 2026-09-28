# Institutional ERP Suite — Scholarship & Financial Aid System

## 1. System Overview
The Scholarship Subsystem manages student grant applications, eligibility verification, document verification, Dean approvals, and automated credit disbursements to student fee accounts.

---

## 2. Categories of Aid

- **Government Post-Matric Scholarships**: State/Central government welfare schemes.
- **Institutional Merit Scholarships**: Awarded automatically to top 5% CGPA achievers.
- **Need-Based Financial Assistance**: Income-verified tuition concessions.
- **Special Fee Waivers**: Staff ward concessions, sports quotas, and military family waivers.

---

## 3. Workflow & Approval Matrix

```
[ Student Submits Application + Income/Mark Sheet Docs ]
                          │
                          ▼
        [ Document Verification Officer Review ]
                          │
                          ▼
       [ Dean of Academic / Finance Approval ]
                          │
                          ▼
[ Grant Credited to Invoice as Scholarship Discount ]
```

---

## 4. Disbursal & Audit Control
When a scholarship is marked `DISBURSED`:
1. `scholarshipDiscount` is credited to student's active invoice line items.
2. Spring Boot audit logger records:
   ```json
   {"actor":"Dr. Rajesh Kumar","action":"DISBURSED_SCHOLARSHIP","scholarshipId":"SCH-2026-041","amount":10000,"studentRollNo":"2024CS108"}
   ```
